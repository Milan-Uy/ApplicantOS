"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { ApplicationStatus } from "@/types/database"

export async function createApplication(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase.from("applications").insert({
    user_id: user.id,
    company: formData.get("company") as string,
    role: formData.get("role") as string,
    url: (formData.get("url") as string) || null,
    status: (formData.get("status") as ApplicationStatus) || "wishlist",
    source: (formData.get("source") as string) || null,
    salary_min: formData.get("salary_min")
      ? Number(formData.get("salary_min"))
      : null,
    salary_max: formData.get("salary_max")
      ? Number(formData.get("salary_max"))
      : null,
    salary_currency: (formData.get("salary_currency") as string) || null,
    salary_period: (formData.get("salary_period") as string) || null,
    location: (formData.get("location") as string) || null,
    job_description: (formData.get("job_description") as string) || null,
    notes: (formData.get("notes") as string) || null,
    contact_name: (formData.get("contact_name") as string) || null,
    contact_email: (formData.get("contact_email") as string) || null,
    resume_id: (formData.get("resume_id") as string) || null,
    interview_date: (formData.get("interview_date") as string) || null,
    applied_at: (formData.get("applied_at") as string) || null,
    follow_up_at: (formData.get("follow_up_at") as string) || null,
  })

  if (error) throw new Error(error.message)

  revalidatePath("/applications")
  redirect("/applications")
}

export async function updateApplication(id: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from("applications")
    .update({
      company: formData.get("company") as string,
      role: formData.get("role") as string,
      url: (formData.get("url") as string) || null,
      status: (formData.get("status") as ApplicationStatus) || "wishlist",
      source: (formData.get("source") as string) || null,
      salary_min: formData.get("salary_min")
        ? Number(formData.get("salary_min"))
        : null,
      salary_max: formData.get("salary_max")
        ? Number(formData.get("salary_max"))
        : null,
      salary_currency: (formData.get("salary_currency") as string) || null,
      salary_period: (formData.get("salary_period") as string) || null,
      location: (formData.get("location") as string) || null,
      job_description: (formData.get("job_description") as string) || null,
      notes: (formData.get("notes") as string) || null,
      contact_name: (formData.get("contact_name") as string) || null,
      contact_email: (formData.get("contact_email") as string) || null,
      resume_id: (formData.get("resume_id") as string) || null,
      interview_date: (formData.get("interview_date") as string) || null,
      applied_at: (formData.get("applied_at") as string) || null,
      follow_up_at: (formData.get("follow_up_at") as string) || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) throw new Error(error.message)

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

  revalidatePath("/applications")
  redirect("/applications")
}
