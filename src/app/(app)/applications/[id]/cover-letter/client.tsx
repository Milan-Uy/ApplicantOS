"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { toast } from "sonner"
import type { CoverLetterResult } from "@/types/database"
import { readTextStream } from "@/lib/read-text-stream"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ResumePicker } from "@/components/applications/ResumePicker"
import { saveCoverLetter } from "./actions"

interface Props {
  applicationId: string
  company: string
  role: string
  jobDescription: string | null
  resumeText: string | null
  currentResumeId: string | null
  resumes: { id: string; label: string | null; filename: string }[]
  existingResult: CoverLetterResult | null
}

const card = "bg-card rounded-xl border border-border shadow-card p-5"

export function CoverLetterClient({
  applicationId,
  company,
  role,
  jobDescription,
  resumeText,
  currentResumeId,
  resumes,
  existingResult,
}: Props) {
  const [tone, setTone] = useState<"formal" | "conversational">("formal")
  const [whyThisRole, setWhyThisRole] = useState("")
  // `saved` mirrors what the server holds, so Save enables only for unsaved edits.
  const [saved, setSaved] = useState(existingResult?.coverLetter ?? "")
  const [coverLetter, setCoverLetter] = useState(saved)
  const [streaming, setStreaming] = useState(false)
  const [saving, startSaving] = useTransition()
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  const canGenerate = !!jobDescription && !!resumeText
  const dirty = !streaming && coverLetter !== saved

  async function handleGenerate() {
    if (!canGenerate) return
    setStreaming(true)
    setDownloadError(null)

    let started = false
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
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to generate")
      }

      started = true
      setCoverLetter("")
      // The server persists a letter only when the stream completes, so a full read means it's saved.
      setSaved(await readTextStream(res, setCoverLetter))
    } catch (err) {
      toast.error(
        started
          ? "Generation was interrupted. The partial letter is kept but not saved."
          : err instanceof Error
            ? err.message
            : "Something went wrong"
      )
    } finally {
      setStreaming(false)
    }
  }

  function handleSave() {
    const text = coverLetter
    startSaving(async () => {
      const { error } = await saveCoverLetter(applicationId, text)
      if (error) {
        toast.error(error)
        return
      }
      setSaved(text)
      toast.success("Cover letter saved")
    })
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
      const a = document.createElement("a")
      a.href = downloadUrl
      a.download = ""
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setDownloading(false)
    }
  }

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
            <h1 className="text-2xl font-bold">Cover Letter Generator</h1>
            <p className="text-muted-fg text-sm mt-1">
              AI-generated cover letter tailored to this role
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

      {!canGenerate && (
        <div className={card}>
          <p className="text-muted-fg">
            {!jobDescription && !resumeText
              ? "Add a job description and choose a resume above to generate a cover letter."
              : !jobDescription
                ? "Add a job description to this application to generate a cover letter."
                : "Choose a resume above to generate a cover letter."}
          </p>
        </div>
      )}

      {canGenerate && (
        <div className="space-y-4">
          {/* Tone selector */}
          <div className={card}>
            <p id="tone-label" className="text-sm font-medium text-muted-fg mb-3">
              Tone
            </p>
            <div role="group" aria-labelledby="tone-label" className="flex gap-2">
              {(["formal", "conversational"] as const).map((t) => (
                <Button
                  key={t}
                  variant={tone === t ? "default" : "secondary"}
                  aria-pressed={tone === t}
                  onClick={() => setTone(t)}
                >
                  {t === "formal" ? "Formal" : "Conversational"}
                </Button>
              ))}
            </div>
          </div>

          {/* Why this role */}
          <div className={card}>
            <Label htmlFor="why-this-role" className="text-muted-fg mb-2">
              Why this role? (optional)
            </Label>
            <Textarea
              id="why-this-role"
              value={whyThisRole}
              onChange={(e) => setWhyThisRole(e.target.value)}
              placeholder="What excites you about this role or company?"
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Not while saving: the save overwrites the latest row, which a new generation would be. */}
          <Button onClick={handleGenerate} disabled={streaming || saving}>
            {streaming ? "Generating…" : coverLetter ? "Regenerate" : "Generate Cover Letter"}
          </Button>
        </div>
      )}

      {(coverLetter || streaming) && (
        <div className={card}>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h2 className="text-sm font-medium text-muted-fg">
              Generated Cover Letter
            </h2>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={handleSave} disabled={!dirty || saving}>
                {saving ? "Saving…" : "Save"}
              </Button>
              <Button variant="secondary" size="sm" onClick={handleDownload} disabled={downloading || streaming}>
                {downloading ? "Generating PDF..." : "Download PDF"}
              </Button>
              <Button variant="secondary" size="sm" onClick={handleCopy} disabled={streaming}>
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>
          {downloadError && (
            <p className="text-xs text-destructive mb-2">{downloadError}</p>
          )}
          <Textarea
            aria-label="Cover letter"
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            readOnly={streaming}
            rows={10}
            className="leading-relaxed resize-y"
          />
        </div>
      )}
    </div>
  )
}
