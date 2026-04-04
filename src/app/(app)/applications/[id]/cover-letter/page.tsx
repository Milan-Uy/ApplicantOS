import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { Application, AIResult, CoverLetterResult } from "@/types/database"
import { CoverLetterClient } from "./client"

export default async function CoverLetterPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: application } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!application) redirect("/applications")

  // Get linked resume text
  let resumeText: string | null = null
  if ((application as Application).resume_id) {
    const { data: doc } = await supabase
      .from("documents")
      .select("extracted_text")
      .eq("id", (application as Application).resume_id!)
      .single()
    resumeText = doc?.extracted_text ?? null
  }

  // Get latest AI result
  const { data: aiResult } = await supabase
    .from("ai_results")
    .select("*")
    .eq("application_id", id)
    .eq("type", "cover_letter")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  const app = application as Application
  const existingResult = aiResult
    ? ((aiResult as AIResult).result as CoverLetterResult)
    : null

  return (
    <CoverLetterClient
      applicationId={id}
      company={app.company}
      role={app.role}
      jobDescription={app.job_description}
      resumeText={resumeText}
      existingResult={existingResult}
    />
  )
}
