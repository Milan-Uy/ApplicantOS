import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { optimizeResume } from "@/lib/ai/resume-optimizer"
import { checkRateLimit } from "@/lib/rate-limit"

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { ok, retryAfterSec } = checkRateLimit(user.id, {
    limit: 10,
    windowMs: 60_000,
    bucket: "ai",
  })
  if (!ok) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(retryAfterSec) } }
    )
  }

  const { resumeText, jobDescription, applicationId } = await request.json()

  if (!resumeText || !jobDescription || !applicationId) {
    return NextResponse.json(
      { error: "resumeText, jobDescription, and applicationId are required" },
      { status: 400 }
    )
  }

  const MAX = 50 * 1024
  if (resumeText.length > MAX || jobDescription.length > MAX) {
    return NextResponse.json({ error: "Input too large" }, { status: 400 })
  }

  // Verify user owns this application
  const { data: application, error: appError } = await supabase
    .from("applications")
    .select("id")
    .eq("id", applicationId)
    .eq("user_id", user.id)
    .single()

  if (appError || !application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 })
  }

  try {
    const result = await optimizeResume(resumeText, jobDescription)

    await supabase.from("ai_results").insert({
      application_id: applicationId,
      type: "resume_optimize",
      result,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Resume optimize error:", error)
    return NextResponse.json(
      { error: "Failed to optimize resume" },
      { status: 500 }
    )
  }
}
