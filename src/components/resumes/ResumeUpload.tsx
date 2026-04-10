"use client"

import { useCallback, useRef, useState } from "react"
import { Upload, Loader2, FileText } from "lucide-react"
import { saveDocument } from "@/app/(app)/resumes/actions"

const MAX_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]

type Stage = "idle" | "uploading" | "parsing" | "review"

export function ResumeUpload() {
  const [stage, setStage] = useState<Stage>("idle")
  const [error, setError] = useState<string | null>(null)
  const [filename, setFilename] = useState("")
  const [s3Key, setS3Key] = useState("")
  const [extractedText, setExtractedText] = useState("")
  const [label, setLabel] = useState("")
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const reset = () => {
    setStage("idle")
    setError(null)
    setFilename("")
    setS3Key("")
    setExtractedText("")
    setLabel("")
  }

  const processFile = useCallback(async (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Please upload a PDF or DOCX file.")
      return
    }
    if (file.size > MAX_SIZE) {
      setError("File must be under 10MB.")
      return
    }

    setError(null)
    setFilename(file.name)

    try {
      // Get presigned URL
      setStage("uploading")
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      })
      if (!uploadRes.ok) throw new Error("Failed to get upload URL")
      const { url, key } = await uploadRes.json()
      setS3Key(key)

      // Upload to S3
      const putRes = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      })
      if (!putRes.ok) throw new Error("Failed to upload file")

      // Parse text
      setStage("parsing")
      const parseRes = await fetch("/api/parse-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ s3Key: key, contentType: file.type }),
      })
      if (!parseRes.ok) throw new Error("Failed to parse resume")
      const { text } = await parseRes.json()
      setExtractedText(text)

      setStage("review")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setStage("idle")
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) processFile(file)
    },
    [processFile]
  )

  const handleSubmit = async () => {
    const formData = new FormData()
    formData.set("label", label)
    formData.set("filename", filename)
    formData.set("s3Key", s3Key)
    formData.set("extractedText", extractedText)
    await saveDocument(formData)
    reset()
  }

  const inputClasses =
    "h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-fg focus:outline-none focus:ring-2 focus:ring-ring"

  if (stage === "review") {
    return (
      <div className="bg-card rounded-xl border border-border shadow-card p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-fg">
          <FileText className="w-4 h-4" />
          <span>{filename}</span>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">
            Label
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Software Engineer Resume"
            className={inputClasses}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">
            Extracted Text
          </label>
          <textarea
            value={extractedText}
            onChange={(e) => setExtractedText(e.target.value)}
            rows={6}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-fg focus:outline-none focus:ring-2 focus:ring-ring resize-y"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            className="px-4 py-2.5 rounded-lg bg-primary text-primary-fg text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Save Resume
          </button>
          <button
            onClick={reset}
            className="px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click()
        }}
        className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-colors ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        }`}
      >
        {stage === "idle" ? (
          <>
            <Upload className="w-8 h-8 text-muted-fg" />
            <p className="text-sm text-muted-fg">
              Drop a PDF or DOCX here, or click to browse
            </p>
            <p className="text-xs text-muted-fg">Up to 10MB</p>
          </>
        ) : (
          <>
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-fg">
              {stage === "uploading" ? "Uploading..." : "Extracting text..."}
            </p>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) processFile(file)
          e.target.value = ""
        }}
      />

      {error && (
        <p className="text-sm text-red-400 mt-2">{error}</p>
      )}
    </div>
  )
}
