import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { streamCoverLetter } from "@/lib/ai/cover-letter"
import { textStreamOrAbort } from "@/lib/ai/text-stream"
import { checkRateLimit } from "@/lib/rate-limit"
import { logError } from "@/lib/log"

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

  const { jobDescription, resumeText, applicationId, whyThisRole, tone } =
    await request.json()

  if (!jobDescription || !resumeText || !applicationId) {
    return NextResponse.json(
      { error: "jobDescription, resumeText, and applicationId are required" },
      { status: 400 }
    )
  }

  // Strings only: an array's .length would let any size through the cap.
  const isText = (v: unknown) => typeof v === "string"
  if (
    !isText(jobDescription) ||
    !isText(resumeText) ||
    (whyThisRole != null && !isText(whyThisRole)) ||
    (tone != null && tone !== "formal" && tone !== "conversational")
  ) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const MAX = 50 * 1024
  if (resumeText.length > MAX || jobDescription.length > MAX || (whyThisRole?.length ?? 0) > MAX) {
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

  const result = streamCoverLetter({
    jobDescription,
    resumeText,
    whyThisRole,
    tone,
    onError: ({ error }) => logError("api.ai.cover-letter", error, { userId: user.id, applicationId }),
  })

  // Persisted inside the stream: a failed insert errors the body, and a cancelled body saves nothing.
  const body = textStreamOrAbort(result.fullStream, async (text) => {
    const { error } = await supabase.from("ai_results").insert({
      application_id: applicationId,
      type: "cover_letter",
      result: { coverLetter: text },
    })
    if (error) {
      logError("api.ai.cover-letter.persist", error, { userId: user.id, applicationId })
      throw new Error("Failed to save the cover letter")
    }
  })

  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  })
}
