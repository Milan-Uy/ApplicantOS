"use client"

import { FileText, Trash2, X } from "lucide-react"
import type { Document } from "@/types/database"
import { deleteDocument } from "@/app/(app)/resumes/actions"
import { useState, useEffect } from "react"

interface ResumeCardProps {
  document: Document
}

export function ResumeCard({ document }: ResumeCardProps) {
  const [deleting, setDeleting] = useState(false)
  const [showText, setShowText] = useState(false)
  const [pdfOpen, setPdfOpen] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [loadingPdf, setLoadingPdf] = useState(false)

  const isPdf = document.filename.toLowerCase().endsWith(".pdf")

  useEffect(() => {
    if (!pdfOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setPdfOpen(false) }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [pdfOpen])

  const handleDelete = async () => {
    if (!confirm("Delete this resume?")) return
    setDeleting(true)
    try {
      await deleteDocument(document.id)
    } catch {
      setDeleting(false)
    }
  }

  const handleOpenPdf = async () => {
    if (pdfUrl) {
      setPdfOpen(true)
      return
    }
    setLoadingPdf(true)
    try {
      const res = await fetch(`/api/view-resume?documentId=${document.id}`)
      const data = await res.json()
      setPdfUrl(data.url)
      setPdfOpen(true)
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
    <>
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
                onClick={() => setShowText(v => !v)}
                className="text-xs text-primary hover:underline"
              >
                {showText ? "Hide text" : "View text"}
              </button>
            )}
            {isPdf && (
              <button
                onClick={handleOpenPdf}
                disabled={loadingPdf}
                className="text-xs text-primary hover:underline disabled:opacity-50"
              >
                {loadingPdf ? "Loading…" : "View PDF"}
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

        {showText && document.extracted_text && (
          <pre className="text-xs text-muted-fg whitespace-pre-wrap max-h-40 overflow-y-auto">
            {document.extracted_text}
          </pre>
        )}
      </div>

      {pdfOpen && pdfUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setPdfOpen(false)}
        >
          <div
            className="relative w-full max-w-5xl h-[90vh] bg-card rounded-lg border border-border shadow-xl flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
              <p className="text-sm font-medium text-foreground truncate">
                {document.label || document.filename}
              </p>
              <button
                onClick={() => setPdfOpen(false)}
                className="p-1.5 rounded-md text-muted-fg hover:text-foreground hover:bg-white/[0.05] transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <iframe
              src={pdfUrl}
              className="flex-1 w-full rounded-b-lg"
            />
          </div>
        </div>
      )}
    </>
  )
}
