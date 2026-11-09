"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

const MAX = 50 * 1024

// Overwrites the latest generated letter with the user's edit (inserts one if none exists yet).
export async function saveCoverLetter(applicationId: string, coverLetter: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  if (typeof coverLetter !== "string" || coverLetter.length > MAX) return { error: "Cover letter is too long" }

  const { data: application } = await supabase
    .from("applications")
    .select("id")
    .eq("id", applicationId)
    .eq("user_id", user.id)
    .maybeSingle()
  if (!application) return { error: "Application not found" }

  // ai_results has no user_id: ownership is the application check above, plus RLS.
  const { data: latest } = await supabase
    .from("ai_results")
    .select("id")
    .eq("application_id", applicationId)
    .eq("type", "cover_letter")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  const result = { coverLetter }
  const { data, error } = latest
    ? await supabase.from("ai_results").update({ result }).eq("id", latest.id).select("id")
    : await supabase.from("ai_results").insert({ application_id: applicationId, type: "cover_letter", result }).select("id")
  if (error) return { error: error.message }
  if (!data.length) return { error: "Couldn't save the cover letter" }

  revalidatePath(`/applications/${applicationId}/cover-letter`)
  return {}
}
