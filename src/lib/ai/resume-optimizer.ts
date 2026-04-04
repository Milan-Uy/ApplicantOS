import { google } from "@ai-sdk/google"
import { generateObject } from "ai"
import { z } from "zod"
import { KEYWORD_MATCHER_PROMPT, BULLET_REWRITER_PROMPT } from "./prompts/resume-optimizer"
import type { ResumeOptimizeResult } from "@/types/database"

const model = google("gemini-1.5-flash")

const keywordSchema = z.object({
  matchScore: z.number().min(0).max(100),
  missingKeywords: z.array(z.string()),
})

const bulletSchema = z.object({
  suggestions: z.array(
    z.object({
      original: z.string(),
      rewritten: z.string(),
      reason: z.string(),
    })
  ),
})

export async function optimizeResume(
  resumeText: string,
  jobDescription: string
): Promise<ResumeOptimizeResult> {
  const userMessage = `## Job Description\n${jobDescription}\n\n## Resume\n${resumeText}`

  const [keywordResult, bulletResult] = await Promise.all([
    generateObject({
      model,
      system: KEYWORD_MATCHER_PROMPT,
      prompt: userMessage,
      schema: keywordSchema,
    }),
    generateObject({
      model,
      system: BULLET_REWRITER_PROMPT,
      prompt: userMessage,
      schema: bulletSchema,
    }),
  ])

  const { matchScore, missingKeywords } = keywordResult.object
  const { suggestions } = bulletResult.object

  const summary =
    matchScore >= 70
      ? `Strong match! Your resume aligns well with this role. Focus on adding ${missingKeywords.length} missing keywords to improve further.`
      : matchScore >= 40
        ? `Moderate match. Your resume covers some requirements but is missing key skills. Review the suggestions below to strengthen your application.`
        : `Low match. This role requires significant skills not reflected in your current resume. Consider the suggested rewrites and missing keywords carefully.`

  return {
    matchScore,
    missingKeywords,
    suggestions,
    summary,
  }
}
