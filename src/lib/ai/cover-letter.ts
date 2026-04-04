import { google } from "@ai-sdk/google"
import { generateText } from "ai"
import { COVER_LETTER_PROMPT } from "./prompts/cover-letter"
import type { CoverLetterResult } from "@/types/database"

const model = google("gemini-1.5-flash")

export async function generateCoverLetter(params: {
  jobDescription: string
  resumeText: string
  whyThisRole?: string
  tone?: "formal" | "conversational"
}): Promise<CoverLetterResult> {
  const { jobDescription, resumeText, whyThisRole, tone = "formal" } = params

  let prompt = `## Job Description\n${jobDescription}\n\n## Resume\n${resumeText}\n\n## Tone\n${tone}`

  if (whyThisRole) {
    prompt += `\n\n## Why This Role (from the applicant)\n${whyThisRole}`
  }

  const { text } = await generateText({
    model,
    system: COVER_LETTER_PROMPT,
    prompt,
  })

  return { coverLetter: text }
}
