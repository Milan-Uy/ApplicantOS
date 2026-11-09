"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { ApplicationStatus } from "@/types/database"

// Pre-interview funnel stages — auto-promoted to "interview" when an
// interview_date is set. Later stages (interview/offer/rejected)
// are left alone, since follow-up rounds are valid in those states.
const PRE_INTERVIEW_STATUSES: readonly ApplicationStatus[] = [
  "wishlist",
  "applied",
  "phone_screen",
]

function resolveStatus(
  submitted: ApplicationStatus,
  interviewDate: string | null
): ApplicationStatus {
  if (interviewDate && PRE_INTERVIEW_STATUSES.includes(submitted)) {
    return "interview"
  }
  return submitted
}

function salaryRangeError(formData: FormData): string | null {
  const minRaw = formData.get("salary_min")
  const maxRaw = formData.get("salary_max")
  if (!minRaw || !maxRaw) return null
  const min = Number(minRaw)
  const max = Number(maxRaw)
  return Number.isFinite(min) && Number.isFinite(max) && min > max
    ? "Minimum salary cannot exceed maximum salary"
    : null
}

// Columns shared by create and update; empty strings become null.
function applicationFields(formData: FormData) {
  const str = (name: string) => (formData.get(name) as string) || null
  const num = (name: string) => (formData.get(name) ? Number(formData.get(name)) : null)
  const interviewDate = str("interview_date")
  const submittedStatus = (formData.get("status") as ApplicationStatus) || "wishlist"
  return {
    company: formData.get("company") as string,
    role: formData.get("role") as string,
    url: str("url"),
    status: resolveStatus(submittedStatus, interviewDate),
    source: str("source"),
    salary_min: num("salary_min"),
    salary_max: num("salary_max"),
    salary_currency: str("salary_currency"),
    salary_period: str("salary_period"),
    location: str("location"),
    job_description: str("job_description"),
    notes: str("notes"),
    contact_name: str("contact_name"),
    contact_email: str("contact_email"),
    resume_id: str("resume_id"),
    interview_date: interviewDate,
    applied_at: str("applied_at"),
    follow_up_at: str("follow_up_at"),
  }
}

// Expected failures come back as { error } so the form keeps its values; redirect() stays outside any try.
export async function createApplication(formData: FormData): Promise<{ error: string } | void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const rangeError = salaryRangeError(formData)
  if (rangeError) return { error: rangeError }

  const { data, error } = await supabase
    .from("applications")
    .insert({ user_id: user.id, ...applicationFields(formData) })
    .select("id")
    .single()

  if (error) return { error: error.message }

  revalidatePath("/applications")
  redirect(`/applications/${data.id}`)
}

export async function updateApplication(
  id: string,
  formData: FormData
): Promise<{ error: string } | void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const rangeError = salaryRangeError(formData)
  if (rangeError) return { error: rangeError }

  const fields = applicationFields(formData)

  const { data: existing } = await supabase
    .from("applications")
    .select("interview_date")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  // Reset reminder_sent so the day-before cron picks up the new date.
  const interviewDateChanged = existing?.interview_date !== fields.interview_date

  const { error } = await supabase
    .from("applications")
    .update({
      ...fields,
      updated_at: new Date().toISOString(),
      ...(interviewDateChanged ? { reminder_sent: false } : {}),
    })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return { error: error.message }

  revalidatePath("/applications")
  revalidatePath(`/applications/${id}`)
  redirect(`/applications/${id}`)
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from("applications")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) throw new Error(error.message)

  revalidatePath("/applications")
}

export async function deleteApplication(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase.from("applications").delete().eq("id", id).eq("user_id", user.id)

  if (error) throw new Error(error.message)

  // No redirect: the caller toasts, then navigates.
  revalidatePath("/applications")
}

export async function setApplicationResume(
  applicationId: string,
  resumeId: string
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { data: doc } = await supabase
    .from("documents")
    .select("id")
    .eq("id", resumeId)
    .eq("user_id", user.id)
    .eq("type", "resume")
    .maybeSingle()
  if (!doc) return { error: "Resume not found" }

  const { data, error } = await supabase
    .from("applications")
    .update({ resume_id: resumeId, updated_at: new Date().toISOString() })
    .eq("id", applicationId)
    .eq("user_id", user.id)
    .select("id")
  if (error) return { error: error.message }
  if (!data.length) return { error: "Application not found" }

  revalidatePath(`/applications/${applicationId}`)
  revalidatePath(`/applications/${applicationId}/resume`)
  revalidatePath(`/applications/${applicationId}/cover-letter`)
  return {}
}
