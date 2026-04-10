"use client"

import { useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Briefcase } from "lucide-react"
import { StatusBadge } from "@/components/ui/badge"
import type { Application } from "@/types/database"
import { KanbanBoard } from "./KanbanBoard"

export function ApplicationsView({
  applications,
}: {
  applications: Application[]
}) {
  const [view, setView] = useState<"kanban" | "list">("kanban")

  return (
    <>
      {/* View toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setView("kanban")}
          className={cn(
            "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
            view === "kanban"
              ? "bg-primary text-primary-fg"
              : "text-muted-fg hover:text-foreground hover:bg-muted"
          )}
        >
          Kanban
        </button>
        <button
          onClick={() => setView("list")}
          className={cn(
            "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
            view === "list"
              ? "bg-primary text-primary-fg"
              : "text-muted-fg hover:text-foreground hover:bg-muted"
          )}
        >
          List
        </button>
      </div>

      {view === "kanban" ? (
        <KanbanBoard applications={applications} />
      ) : (
        <ListView applications={applications} />
      )}
    </>
  )
}

function ListView({ applications }: { applications: Application[] }) {
  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Briefcase className="w-6 h-6 text-muted-fg" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">
          No applications yet
        </h3>
        <p className="text-sm text-muted-fg mt-1 max-w-xs">
          Start by adding your first job application.
        </p>
        <Link
          href="/applications/new"
          className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-fg text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Add Application
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-fg uppercase tracking-wide">
              Company
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-fg uppercase tracking-wide">
              Role
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-fg uppercase tracking-wide">
              Status
            </th>
            <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-semibold text-muted-fg uppercase tracking-wide">
              Applied
            </th>
            <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-semibold text-muted-fg uppercase tracking-wide">
              Source
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {applications.map((app) => (
            <tr
              key={app.id}
              className="hover:bg-muted/50 transition-colors"
            >
              <td className="px-4 py-3">
                <Link
                  href={`/applications/${app.id}`}
                  className="font-medium text-foreground hover:text-primary"
                >
                  {app.company}
                </Link>
              </td>
              <td className="px-4 py-3 text-foreground">{app.role}</td>
              <td className="px-4 py-3">
                <StatusBadge status={app.status} />
              </td>
              <td className="hidden sm:table-cell px-4 py-3 text-muted-fg">
                {app.applied_at
                  ? new Date(app.applied_at).toLocaleDateString()
                  : "—"}
              </td>
              <td className="hidden sm:table-cell px-4 py-3 text-muted-fg capitalize">
                {app.source?.replace("_", " ") ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
