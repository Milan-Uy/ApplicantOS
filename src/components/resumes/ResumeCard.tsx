"use client"

import { FileText, Trash2 } from "lucide-react"
import type { Document } from "@/types/database"
import { deleteDocument } from "@/app/(app)/resumes/actions"
import { useState } from "react"

interface ResumeCardProps {
  document: Document
}

export function ResumeCard({ document }: ResumeCardProps) {
  const [deleting, setDeleting] = useState(false)
  const [view, setView] = useState<"none" | "text" | "pdf">("none")
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [loadingPdf, setLoadingPdf] = useState(false)

  const isPdf = document.filename.toLowerCase().endsWith(".pdf")

  const handleDelete = async () => {
    if (!confirm("Delete this resume?")) return
    setDeleting(true)
    try {
      await deleteDocument(document.id)
    } catch {
      setDeleting(false)
    }
  }

  const handleTogglePdf = async () => {
    if (view === "pdf") {
      setView("none")
      return
    }
    if (pdfUrl) {
      setView("pdf")
      return
    }
    setLoadingPdf(true)
    try {
      const res = await fetch(`/api/view-resume?documentId=${document.id}`)
      const data = await res.json()
      setPdfUrl(data.url)
      setView("pdf")
    } finally {
      setLoadingPdf(false)
    }
  }

  const date = new Date(document.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <div className="bg-card rounded-lg border border-border shadow-card p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-white/[0.05] text-muted-fg shrink-0">
          <FileText className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground truncate">
            {document.label || "Untitled Resume"}
          </p>
          <p className="text-xs text-muted-fg truncate">{document.filename}</p>
          <p className="text-xs text-muted-fg mt-1">{date}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1 border-t border-border">
        <div className="flex gap-2 flex-1 flex-wrap">
          {document.extracted_text && (
            <button
              onClick={() => setView(v => v === "text" ? "none" : "text")}
              className="text-xs text-primary hover:underline"
            >
              {view === "text" ? "Hide text" : "View text"}
            </button>
          )}
          {isPdf && (
            <button
              onClick={handleTogglePdf}
              disabled={loadingPdf}
              className="text-xs text-primary hover:underline disabled:opacity-50"
            >
              {loadingPdf ? "Loading…" : view === "pdf" ? "Hide PDF" : "View PDF"}
            </button>
          )}
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="ml-auto p-1.5 rounded-md text-muted-fg hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50"
          aria-label="Delete resume"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {view === "text" && document.extracted_text && (
        <pre className="text-xs text-muted-fg whitespace-pre-wrap max-h-40 overflow-y-auto">
          {document.extracted_text}
        </pre>
      )}
      {view === "pdf" && pdfUrl && (
        <iframe
          src={pdfUrl}
          className="w-full h-96 rounded border border-border"
        />
      )}
    </div>
  )
}
