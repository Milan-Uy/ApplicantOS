import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { AIResult, ResumeOptimizeResult } from "@/types/database"
import { ResumeOptimizerClient } from "./client"

export default async function ResumeOptimizePage({
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
    .select("company, role, job_description, resume_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!application) redirect("/applications")

  // Linked resume's text comes from this list, so the picker and the AI input always agree.
  const { data: resumes } = await supabase
    .from("documents")
    .select("id, label, filename, extracted_text")
    .eq("user_id", user.id)
    .eq("type", "resume")
    .order("created_at", { ascending: false })
  const resumeText = resumes?.find((r) => r.id === application.resume_id)?.extracted_text ?? null

  // Get latest AI result
  const { data: aiResult } = await supabase
    .from("ai_results")
    .select("*")
    .eq("application_id", id)
    .eq("type", "resume_optimize")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  const existingResult = aiResult
    ? ((aiResult as AIResult).result as ResumeOptimizeResult)
    : null

  return (
    <ResumeOptimizerClient
      applicationId={id}
      company={application.company}
      role={application.role}
      jobDescription={application.job_description}
      resumeText={resumeText}
      currentResumeId={application.resume_id}
      resumes={(resumes ?? []).map(({ id, label, filename }) => ({ id, label, filename }))}
      existingResult={existingResult}
    />
  )
}
