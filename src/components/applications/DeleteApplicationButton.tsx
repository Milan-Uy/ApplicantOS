"use client"

import { deleteApplication } from "@/app/(app)/applications/actions"

export function DeleteApplicationButton({ id }: { id: string }) {
  return (
    <button
      onClick={async () => {
        if (confirm("Are you sure you want to delete this application?")) {
          await deleteApplication(id)
        }
      }}
      className="px-4 py-2 rounded-lg border border-destructive/30 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
    >
      Delete Application
    </button>
  )
}
