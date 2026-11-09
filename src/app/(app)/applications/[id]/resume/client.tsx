"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import type { ResumeOptimizeResult } from "@/types/database"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ResumePicker } from "@/components/applications/ResumePicker"

const STAGES = ["Reading the job description", "Matching keywords", "Rewriting bullet points"]
const STAGE_MS = 2000

interface Props {
  applicationId: string
  company: string
  role: string
  jobDescription: string | null
  resumeText: string | null
  currentResumeId: string | null
  resumes: { id: string; label: string | null; filename: string }[]
  existingResult: ResumeOptimizeResult | null
}

const card = "bg-card rounded-xl border border-border shadow-card p-5"

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  } catch {
    toast.error("Couldn't copy to the clipboard")
  }
}

export function ResumeOptimizerClient({
  applicationId,
  company,
  role,
  jobDescription,
  resumeText,
  currentResumeId,
  resumes,
  existingResult,
}: Props) {
  const [result, setResult] = useState<ResumeOptimizeResult | null>(existingResult)
  const [loading, setLoading] = useState(false)
  const [stage, setStage] = useState(0)

  // Advance through the stages, then hold the last one until the response lands.
  useEffect(() => {
    if (!loading) return
    const timers = STAGES.slice(1).map((_, i) => setTimeout(() => setStage(i + 1), (i + 1) * STAGE_MS))
    return () => timers.forEach(clearTimeout)
  }, [loading])

  const canOptimize = !!jobDescription && !!resumeText

  async function handleOptimize() {
    if (!canOptimize) return
    setStage(0)
    setLoading(true)

    try {
      const res = await fetch("/api/ai/resume-optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          jobDescription,
          applicationId,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to optimize")
      }

      const data: ResumeOptimizeResult = await res.json()
      setResult(data)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const scoreColor =
    result && result.matchScore >= 70
      ? "text-accent"
      : result && result.matchScore >= 40
        ? "text-amber-500"
        : "text-destructive"

  const barColor =
    result && result.matchScore >= 70
      ? "bg-accent"
      : result && result.matchScore >= 40
        ? "bg-amber-500"
        : "bg-destructive"

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
      <div>
        <Link
          href={`/applications/${applicationId}`}
          className="text-sm text-muted-fg hover:text-foreground transition-colors"
        >
          &larr; Back to {company} &mdash; {role}
        </Link>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Resume Optimizer</h1>
            <p className="text-muted-fg text-sm mt-1">
              AI-powered analysis of your resume against the job description
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ResumePicker applicationId={applicationId} currentResumeId={currentResumeId} resumes={resumes} />
            <Link href={`/applications/${applicationId}/edit`} className="text-sm text-accent hover:underline">
              Edit application
            </Link>
          </div>
        </div>
      </div>

      {!canOptimize && (
        <div className={card}>
          <p className="text-muted-fg">
            {!jobDescription && !resumeText
              ? "Add a job description and choose a resume above to use the optimizer."
              : !jobDescription
                ? "Add a job description to this application to use the optimizer."
                : "Choose a resume above to use the optimizer."}
          </p>
        </div>
      )}

      {canOptimize && (
        <Button onClick={handleOptimize} disabled={loading}>
          {loading ? "Analyzing…" : result ? "Re-analyze" : "Optimize Resume"}
        </Button>
      )}

      {loading && (
        <div className="space-y-6">
          <p role="status" aria-live="polite" className="text-sm text-muted-fg">
            {STAGES[stage]}…
          </p>
          <div className={cn(card, "space-y-3")}>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-28" />
            <Skeleton className="h-2.5 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className={cn(card, "space-y-4")}>
            <Skeleton className="h-4 w-32" />
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-6">
          {/* Match Score */}
          <div className={card}>
            <h2 className="text-sm font-medium text-muted-fg mb-3">
              Match Score
            </h2>
            <div className="flex items-end gap-3 mb-3">
              <span className={cn("text-4xl sm:text-5xl font-bold", scoreColor)}>
                {result.matchScore}
              </span>
              <span className="text-muted-fg text-lg mb-1">/ 100</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", barColor)}
                style={{ width: `${result.matchScore}%` }}
              />
            </div>
            <p className="text-sm text-muted-fg mt-3">{result.summary}</p>
          </div>

          {/* Missing Keywords */}
          {result.missingKeywords.length > 0 && (
            <div className={card}>
              <h2 className="text-sm font-medium text-muted-fg mb-3">
                Missing Keywords
              </h2>
              <div className="flex flex-wrap gap-2">
                {result.missingKeywords.map((kw) => (
                  <span
                    key={kw}
                    className="px-2.5 py-1 rounded-md bg-destructive/10 text-destructive text-xs font-medium"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {result.suggestions.length > 0 && (
            <div className={card}>
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-sm font-medium text-muted-fg">Suggested Rewrites</h2>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => copy(result.suggestions.map((s) => s.rewritten).join("\n\n"))}
                >
                  Copy all rewrites
                </Button>
              </div>
              <div className="space-y-4">
                {result.suggestions.map((s, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-border p-4 space-y-2"
                  >
                    <p className="text-sm text-muted-fg line-through">
                      {s.original}
                    </p>
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium">{s.rewritten}</p>
                      <Button
                        variant="ghost"
                        size="xs"
                        aria-label={`Copy rewrite ${i + 1}`}
                        onClick={() => copy(s.rewritten)}
                      >
                        Copy
                      </Button>
                    </div>
                    <p className="text-xs text-muted-fg">{s.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
