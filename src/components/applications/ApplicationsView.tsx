"use client"

import { useState } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { Briefcase } from "lucide-react"
import { EmptyState } from "@/components/EmptyState"
import { Button } from "@/components/ui/button"

import { StatusBadge } from "@/components/ui/badge"
import type { ApplicationListItem } from "@/types/database"

const KanbanBoard = dynamic(
  () => import("./KanbanBoard").then((m) => m.KanbanBoard),
  {
    ssr: false,
    loading: () => <div className="min-h-[400px]" />,
  }
)

export function ApplicationsView({
  applications,
}: {
  applications: ApplicationListItem[]
}) {
  const [view, setView] = useState<"kanban" | "list">("kanban")

  return (
    <>
      {/* View toggle + actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {(["kanban", "list"] as const).map((v) => (
            <Button
              key={v}
              variant={view === v ? "secondary" : "ghost"}
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className="capitalize"
            >
              {v}
            </Button>
          ))}
        </div>
      </div>

      {view === "kanban" ? (
        <KanbanBoard applications={applications} />
      ) : (
        <ListView applications={applications} />
      )}
    </>
  )
}

function ListView({ applications }: { applications: ApplicationListItem[] }) {
  if (applications.length === 0) {
    return (
      <EmptyState
        icon={Briefcase}
        title="No applications yet"
        description="Start by adding your first job application."
        action={
          <Button asChild>
            <Link href="/applications/new">Add Application</Link>
          </Button>
        }
      />
    )
  }

  return (
    <div className="bg-card rounded-lg border border-border shadow-card overflow-x-auto">
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
                {app.source?.replace(/_/g, " ") ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
