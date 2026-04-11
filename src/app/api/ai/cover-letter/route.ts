import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateCoverLetter } from "@/lib/ai/cover-letter"

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { jobDescription, resumeText, applicationId, whyThisRole, tone } =
    await request.json()

  if (!jobDescription || !resumeText || !applicationId) {
    return NextResponse.json(
      { error: "jobDescription, resumeText, and applicationId are required" },
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
    const result = await generateCoverLetter({
      jobDescription,
      resumeText,
      whyThisRole,
      tone,
    })

    await supabase.from("ai_results").insert({
      application_id: applicationId,
      type: "cover_letter",
      result,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Cover letter error:", error)
    return NextResponse.json(
      { error: "Failed to generate cover letter" },
      { status: 500 }
    )
  }
}
