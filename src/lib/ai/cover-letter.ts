import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { streamText, type StreamTextOnErrorCallback, type StreamTextOnFinishCallback, type ToolSet } from "ai"
import { COVER_LETTER_PROMPT } from "./prompts/cover-letter"

const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY })
const model = google("gemini-2.5-flash")

export function streamCoverLetter(params: {
  jobDescription: string
  resumeText: string
  whyThisRole?: string
  tone?: "formal" | "conversational"
  onFinish?: StreamTextOnFinishCallback<ToolSet>
  onError?: StreamTextOnErrorCallback
}) {
  const { jobDescription, resumeText, whyThisRole, tone = "formal", onFinish, onError } = params

  let prompt = `## Job Description\n${jobDescription}\n\n## Resume\n${resumeText}\n\n## Tone\n${tone}`

  if (whyThisRole) {
    prompt += `\n\n## Why This Role (from the applicant)\n${whyThisRole}`
  }

  return streamText({
    model,
    system: COVER_LETTER_PROMPT,
    prompt,
    maxRetries: 3,
    onFinish,
    onError,
  })
}
