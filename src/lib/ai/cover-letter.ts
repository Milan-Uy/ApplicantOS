import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { streamText, type StreamTextOnErrorCallback } from "ai"
import { COVER_LETTER_PROMPT } from "./prompts/cover-letter"

const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY })
const model = google("gemini-3.5-flash-lite")

export function streamCoverLetter(params: {
  jobDescription: string
  resumeText: string
  whyThisRole?: string
  tone?: "formal" | "conversational"
  onError?: StreamTextOnErrorCallback
}) {
  const { jobDescription, resumeText, whyThisRole, tone = "formal", onError } = params

  let prompt = `## Job Description\n${jobDescription}\n\n## Resume\n${resumeText}\n\n## Tone\n${tone}`

  if (whyThisRole) {
    prompt += `\n\n## Why This Role (from the applicant)\n${whyThisRole}`
  }

  return streamText({
    model,
    system: COVER_LETTER_PROMPT,
    prompt,
    maxRetries: 3,
    onError,
  })
}
