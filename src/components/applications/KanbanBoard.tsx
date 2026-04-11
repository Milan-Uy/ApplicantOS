"use client"

import { useOptimistic, useTransition } from "react"
import Link from "next/link"
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd"
import { StatusBadge } from "@/components/ui/badge"
import { updateApplicationStatus } from "@/app/(app)/applications/actions"
import type { ApplicationListItem, ApplicationStatus } from "@/types/database"
import { Briefcase } from "lucide-react"

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
      await updateApplicationStatus(draggableId, newStatus)
    })
  }

  if (optimisticApps.length === 0) {
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
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
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
                    snapshot.isDraggingOver ? "bg-primary/5" : ""
                  }`}
                >
                  {grouped[status].map((app, index) => (
                    <Draggable
                      key={app.id}
                      draggableId={app.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`bg-card rounded-xl border border-border shadow-card p-4 cursor-grab active:cursor-grabbing hover:shadow-card-hover transition-shadow duration-150 ${
                            snapshot.isDragging ? "shadow-card-hover" : ""
                          }`}
                        >
                          <Link href={`/applications/${app.id}`}>
                            <p className="text-sm font-semibold text-foreground truncate">
                              {app.role}
                            </p>
                            <p className="text-xs text-muted-fg mt-0.5 truncate">
                              {app.company}
                            </p>
                            {app.salary_min && (
                              <p className="text-xs text-accent font-medium mt-2">
                                ${app.salary_min.toLocaleString()}
                                {app.salary_max
                                  ? `–$${app.salary_max.toLocaleString()}`
                                  : "+"}
                              </p>
                            )}
                            {app.interview_date && (
                              <p className="mt-2 text-xs text-orange-600">
                                Interview:{" "}
                                {new Date(
                                  app.interview_date
                                ).toLocaleDateString()}
                              </p>
                            )}
                          </Link>
                        </div>
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
