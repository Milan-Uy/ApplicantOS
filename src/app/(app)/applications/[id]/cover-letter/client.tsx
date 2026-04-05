"use client"

import { useState } from "react"
import Link from "next/link"
import type { CoverLetterResult } from "@/types/database"
import { cn } from "@/lib/utils"

interface Props {
  applicationId: string
  company: string
  role: string
  jobDescription: string | null
  resumeText: string | null
  existingResult: CoverLetterResult | null
}

export function CoverLetterClient({
  applicationId,
  company,
  role,
  jobDescription,
  resumeText,
  existingResult,
}: Props) {
  const [tone, setTone] = useState<"formal" | "conversational">("formal")
  const [whyThisRole, setWhyThisRole] = useState("")
  const [coverLetter, setCoverLetter] = useState(existingResult?.coverLetter ?? "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  const canGenerate = !!jobDescription && !!resumeText

  async function handleGenerate() {
    if (!canGenerate) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/ai/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          resumeText,
          applicationId,
          whyThisRole: whyThisRole || undefined,
          tone,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to generate")
      }

      const data: CoverLetterResult = await res.json()
      setCoverLetter(data.coverLetter)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(coverLetter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleDownload() {
    if (!coverLetter) return
    setDownloading(true)
    setDownloadError(null)

    try {
      const res = await fetch("/api/pdf/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, coverLetter }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to generate PDF")
      }

      const { downloadUrl } = await res.json()
      window.open(downloadUrl, "_blank")
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/applications/${applicationId}`}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Back to {company} &mdash; {role}
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Cover Letter Generator</h1>
        <p className="text-muted-foreground text-sm mt-1">
          AI-generated cover letter tailored to this role
        </p>
      </div>

      {!canGenerate && (
        <div className="bg-card rounded-xl border border-border shadow-card p-5">
          <p className="text-muted-foreground">
            {!jobDescription && !resumeText
              ? "Add a job description and link a resume to this application to generate a cover letter."
              : !jobDescription
                ? "Add a job description to this application to generate a cover letter."
                : "Link a resume to this application to generate a cover letter."}
          </p>
          <Link
            href={`/applications/${applicationId}`}
            className="mt-3 inline-block text-sm text-accent hover:underline"
          >
            Edit application &rarr;
          </Link>
        </div>
      )}

      {canGenerate && (
        <div className="space-y-4">
          {/* Tone selector */}
          <div className="bg-card rounded-xl border border-border shadow-card p-5">
            <label className="text-sm font-medium text-muted-foreground block mb-3">
              Tone
            </label>
            <div className="flex gap-2">
              {(["formal", "conversational"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    tone === t
                      ? "bg-accent text-accent-fg"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t === "formal" ? "Formal" : "Conversational"}
                </button>
              ))}
            </div>
          </div>

          {/* Why this role */}
          <div className="bg-card rounded-xl border border-border shadow-card p-5">
            <label
              htmlFor="why-this-role"
              className="text-sm font-medium text-muted-foreground block mb-2"
            >
              Why this role? (optional)
            </label>
            <textarea
              id="why-this-role"
              value={whyThisRole}
              onChange={(e) => setWhyThisRole(e.target.value)}
              placeholder="What excites you about this role or company?"
              rows={3}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="px-5 py-2.5 rounded-lg bg-accent text-accent-fg text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Generating..."
                : coverLetter
                  ? "Regenerate"
                  : "Generate Cover Letter"}
            </button>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </div>
      )}

      {coverLetter && (
        <div className="bg-card rounded-xl border border-border shadow-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-muted-foreground">
              Generated Cover Letter
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="px-3 py-1.5 rounded-md text-xs font-medium bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloading ? "Generating PDF..." : "Download PDF"}
              </button>
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-md text-xs font-medium bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
          {downloadError && (
            <p className="text-xs text-destructive mb-2">{downloadError}</p>
          )}
          <textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            rows={16}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-accent/50 resize-y"
          />
        </div>
      )}
    </div>
  )
}
