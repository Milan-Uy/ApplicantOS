"use client"

import { useState } from "react"
import Link from "next/link"
import type { ResumeOptimizeResult } from "@/types/database"
import { cn } from "@/lib/utils"

interface Props {
  applicationId: string
  company: string
  role: string
  jobDescription: string | null
  resumeText: string | null
  existingResult: ResumeOptimizeResult | null
}

export function ResumeOptimizerClient({
  applicationId,
  company,
  role,
  jobDescription,
  resumeText,
  existingResult,
}: Props) {
  const [result, setResult] = useState<ResumeOptimizeResult | null>(existingResult)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canOptimize = !!jobDescription && !!resumeText

  async function handleOptimize() {
    if (!canOptimize) return
    setLoading(true)
    setError(null)

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
        const data = await res.json()
        throw new Error(data.error || "Failed to optimize")
      }

      const data: ResumeOptimizeResult = await res.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
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
    <div className="space-y-6">
      <div>
        <Link
          href={`/applications/${applicationId}`}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Back to {company} &mdash; {role}
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Resume Optimizer</h1>
        <p className="text-muted-foreground text-sm mt-1">
          AI-powered analysis of your resume against the job description
        </p>
      </div>

      {!canOptimize && (
        <div className="bg-card rounded-xl border border-border shadow-card p-5">
          <p className="text-muted-foreground">
            {!jobDescription && !resumeText
              ? "Add a job description and link a resume to this application to use the optimizer."
              : !jobDescription
                ? "Add a job description to this application to use the optimizer."
                : "Link a resume to this application to use the optimizer."}
          </p>
          <Link
            href={`/applications/${applicationId}`}
            className="mt-3 inline-block text-sm text-accent hover:underline"
          >
            Edit application &rarr;
          </Link>
        </div>
      )}

      {canOptimize && (
        <div className="flex items-center gap-3">
          <button
            onClick={handleOptimize}
            disabled={loading}
            className="px-5 py-2.5 rounded-lg bg-accent text-accent-fg text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Analyzing..."
              : result
                ? "Re-analyze"
                : "Optimize Resume"}
          </button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {/* Match Score */}
          <div className="bg-card rounded-xl border border-border shadow-card p-5">
            <h2 className="text-sm font-medium text-muted-foreground mb-3">
              Match Score
            </h2>
            <div className="flex items-end gap-3 mb-3">
              <span className={cn("text-5xl font-bold", scoreColor)}>
                {result.matchScore}
              </span>
              <span className="text-muted-foreground text-lg mb-1">/ 100</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", barColor)}
                style={{ width: `${result.matchScore}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-3">{result.summary}</p>
          </div>

          {/* Missing Keywords */}
          {result.missingKeywords.length > 0 && (
            <div className="bg-card rounded-xl border border-border shadow-card p-5">
              <h2 className="text-sm font-medium text-muted-foreground mb-3">
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
            <div className="bg-card rounded-xl border border-border shadow-card p-5">
              <h2 className="text-sm font-medium text-muted-foreground mb-4">
                Suggested Rewrites
              </h2>
              <div className="space-y-4">
                {result.suggestions.map((s, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-border p-4 space-y-2"
                  >
                    <p className="text-sm text-muted-foreground line-through">
                      {s.original}
                    </p>
                    <p className="text-sm font-medium">{s.rewritten}</p>
                    <p className="text-xs text-muted-foreground">{s.reason}</p>
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
