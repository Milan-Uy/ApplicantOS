"use client"

import { useOptimistic, useTransition } from "react"
import Link from "next/link"
import { toast } from "sonner"
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd"
import { StatusBadge, STATUS_LABELS } from "@/components/ui/badge"
import { updateApplicationStatus } from "@/app/(app)/applications/actions"
import type { ApplicationListItem, ApplicationStatus } from "@/types/database"
import { Briefcase } from "lucide-react"
import { EmptyState } from "@/components/EmptyState"
import { Button } from "@/components/ui/button"
import { formatSalary } from "@/lib/format"

const STATUSES: ApplicationStatus[] = [
  "wishlist",
  "applied",
  "phone_screen",
  "interview",
  "offer",
  "rejected",
]

export function KanbanBoard({
  applications: initialApps,
}: {
  applications: ApplicationListItem[]
}) {
  const [optimisticApps, updateOptimistic] = useOptimistic(
    initialApps,
    (state, { id, status }: { id: string; status: ApplicationStatus }) =>
      state.map((a) => (a.id === id ? { ...a, status } : a))
  )
  const [, startTransition] = useTransition()

  const grouped = STATUSES.reduce(
    (acc, status) => {
      acc[status] = optimisticApps.filter((a) => a.status === status)
      return acc
    },
    {} as Record<ApplicationStatus, ApplicationListItem[]>
  )

  const onDragEnd = (result: DropResult) => {
    const { draggableId, destination } = result
    if (!destination) return

    const newStatus = destination.droppableId as ApplicationStatus

    startTransition(async () => {
      updateOptimistic({ id: draggableId, status: newStatus })
      // useOptimistic reverts the card on its own once the transition ends.
      try {
        await updateApplicationStatus(draggableId, newStatus)
        toast.success(`Moved to ${STATUS_LABELS[newStatus]}`)
      } catch {
        toast.error("Couldn't move card")
      }
    })
  }

  if (optimisticApps.length === 0) {
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
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 scrollbar-thin">
        {STATUSES.map((status) => (
          <Droppable key={status} droppableId={status}>
            {(provided, snapshot) => (
              <div className="flex flex-col gap-2 min-w-[200px] w-[200px] sm:min-w-[240px] sm:w-[240px] shrink-0">
                <div className="flex items-center justify-between px-1">
                  <StatusBadge status={status} />
                  <span className="text-xs font-medium text-muted-fg tabular-nums">
                    {grouped[status].length}
                  </span>
                </div>
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex flex-col gap-2 min-h-[120px] rounded-lg p-2 transition-colors ${
                    snapshot.isDraggingOver ? "bg-white/[0.03]" : ""
                  }`}
                >
                  {grouped[status].length === 0 && (
                    <div className={`rounded-md border border-dashed min-h-[80px] flex items-center justify-center transition-colors ${
                      snapshot.isDraggingOver ? "border-primary/40" : "border-border/30"
                    }`}>
                      <span className="text-xs text-muted-fg/40 select-none">Drop here</span>
                    </div>
                  )}
                  {grouped[status].map((app, index) => (
                    <Draggable
                      key={app.id}
                      draggableId={app.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        // The card is the link and the drag handle at once: nesting a link in a role=button
                        // handle is an axe nested-interactive violation. role is dropped to keep link semantics.
                        <Link
                          href={`/applications/${app.id}`}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          role={undefined}
                          className={`block bg-card rounded-lg border border-border shadow-card p-4 cursor-grab active:cursor-grabbing hover:shadow-card-hover transition-shadow duration-150 ${
                            snapshot.isDragging ? "shadow-card-hover" : ""
                          }`}
                        >
                          <p className="text-sm font-semibold text-foreground truncate">
                            {app.role}
                          </p>
                          <p className="text-xs text-muted-fg mt-0.5 truncate">
                            {app.company}
                          </p>
                          {formatSalary(app) && (
                            <p className="text-xs text-success font-medium mt-2">
                              {formatSalary(app)}
                            </p>
                          )}
                          {app.interview_date && (
                            <p className="mt-2 text-xs text-amber-400">
                              Interview:{" "}
                              {new Date(
                                app.interview_date
                              ).toLocaleDateString()}
                            </p>
                          )}
                        </Link>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  )
}
