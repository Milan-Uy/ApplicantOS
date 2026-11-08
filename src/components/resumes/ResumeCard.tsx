"use client"

import { FileText, Trash2 } from "lucide-react"
import type { Document } from "@/types/database"
import { deleteDocument } from "@/app/(app)/resumes/actions"
import { useState } from "react"
import { toast } from "sonner"
import { ConfirmDelete } from "@/components/ConfirmDelete"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

interface ResumeCardProps {
  document: Document
}

export function ResumeCard({ document }: ResumeCardProps) {
  const [showText, setShowText] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [loadingPdf, setLoadingPdf] = useState(false)

  const isPdf = document.filename.toLowerCase().endsWith(".pdf")

  // Fetched on every open: signed URLs expire after 5 minutes.
  const handleOpenPdf = async () => {
    setLoadingPdf(true)
    try {
      const res = await fetch(`/api/view-resume?documentId=${document.id}`)
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.url) {
        toast.error(data.error ?? "File unavailable")
        return
      }
      setPdfUrl(data.url)
    } catch {
      toast.error("Couldn't load the PDF. Please try again.")
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
                className="text-xs text-accent hover:underline"
              >
                {showText ? "Hide text" : "View text"}
              </button>
            )}
            {isPdf && (
              <button
                onClick={handleOpenPdf}
                disabled={loadingPdf}
                className="text-xs text-accent hover:underline disabled:opacity-50"
              >
                {loadingPdf ? "Loading…" : "View PDF"}
              </button>
            )}
          </div>
          <ConfirmDelete
            title="Delete this resume?"
            description="Applications using it keep their data, but lose the link to this file."
            successMessage="Resume deleted"
            onConfirm={() => deleteDocument(document.id)}
            trigger={
              <button
                className="ml-auto p-1.5 rounded-md text-muted-fg hover:text-red-400 hover:bg-red-400/10 transition-colors"
                aria-label="Delete resume"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            }
          />
        </div>

        {showText && document.extracted_text && (
          <pre className="text-xs text-muted-fg whitespace-pre-wrap max-h-40 overflow-y-auto">
            {document.extracted_text}
          </pre>
        )}
      </div>

      <Dialog open={!!pdfUrl} onOpenChange={(open) => !open && setPdfUrl(null)}>
        <DialogContent
          aria-describedby={undefined}
          className="flex h-[90vh] flex-col gap-0 p-0 sm:max-w-5xl"
        >
          <DialogTitle className="truncate border-b border-border px-4 py-3 pr-12 text-sm">
            {document.label || document.filename}
          </DialogTitle>
          {pdfUrl && (
            <iframe
              src={pdfUrl}
              title={`PDF preview of ${document.label || document.filename}`}
              className="w-full flex-1 rounded-b-xl"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
