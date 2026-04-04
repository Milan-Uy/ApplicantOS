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

  const handleDelete = async () => {
    if (!confirm("Delete this resume?")) return
    setDeleting(true)
    try {
      await deleteDocument(document.id)
    } catch {
      setDeleting(false)
    }
  }

  const date = new Date(document.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
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
        {document.extracted_text && (
          <details className="flex-1">
            <summary className="text-xs text-primary cursor-pointer hover:underline">
              View text
            </summary>
            <pre className="mt-2 text-xs text-muted-fg whitespace-pre-wrap max-h-40 overflow-y-auto">
              {document.extracted_text}
            </pre>
          </details>
        )}
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="ml-auto p-1.5 rounded-md text-muted-fg hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50"
          aria-label="Delete resume"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
