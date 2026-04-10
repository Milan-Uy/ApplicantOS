import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { StatusBadge } from "@/components/ui/badge"
import { DeleteApplicationButton } from "@/components/applications/DeleteApplicationButton"
import type { Application } from "@/types/database"
import { cn } from "@/lib/utils"

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: app } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .single()

  if (!app) notFound()

  const application = app as Application

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge status={application.status} />
            {application.source && (
              <span className="text-xs text-muted-fg capitalize">
                {application.source.replace("_", " ")}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {application.role}
          </h1>
          <p className="text-base text-muted-fg mt-0.5">
            {application.company}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:shrink-0">
          <Link
            href={`/applications/${id}/edit`}
            className="flex-1 sm:flex-none text-center px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Edit
          </Link>
          <Link
            href={`/applications/${id}/resume`}
            className="flex-1 sm:flex-none text-center px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Optimize Resume
          </Link>
          <Link
            href={`/applications/${id}/cover-letter`}
            className="flex-1 sm:flex-none text-center px-4 py-2 rounded-lg bg-accent text-accent-fg text-sm font-semibold hover:bg-accent/90 transition-colors"
          >
            Cover Letter
          </Link>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Job Description */}
          <section className="bg-card rounded-xl border border-border shadow-card p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">
              Job Description
            </h2>
            <p className="text-sm text-muted-fg whitespace-pre-wrap leading-relaxed">
              {application.job_description ?? "No job description added."}
            </p>
          </section>

          {/* Notes */}
          <section className="bg-card rounded-xl border border-border shadow-card p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">
              Notes
            </h2>
            <p className="text-sm text-muted-fg whitespace-pre-wrap leading-relaxed">
              {application.notes ?? "No notes yet."}
            </p>
          </section>

          {application.url && (
            <a
              href={application.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              View Job Posting
            </a>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <div className="bg-card rounded-xl border border-border shadow-card p-5 flex flex-col gap-3 text-sm">
            <h2 className="font-semibold text-foreground">Details</h2>
            <DetailRow label="Location" value={application.location ?? "—"} />
            <DetailRow
              label="Salary"
              value={
                application.salary_min
                  ? `$${application.salary_min.toLocaleString()}${application.salary_max ? `–$${application.salary_max.toLocaleString()}` : "+"}`
                  : "—"
              }
            />
            <DetailRow
              label="Applied"
              value={
                application.applied_at
                  ? new Date(application.applied_at).toLocaleDateString()
                  : "—"
              }
            />
            <DetailRow
              label="Interview"
              value={
                application.interview_date
                  ? new Date(application.interview_date).toLocaleDateString()
                  : "—"
              }
              color={application.interview_date ? "text-orange-600" : undefined}
            />
            <DetailRow
              label="Follow-up"
              value={
                application.follow_up_at
                  ? new Date(application.follow_up_at).toLocaleDateString()
                  : "—"
              }
            />
          </div>

          <div className="bg-card rounded-xl border border-border shadow-card p-5 flex flex-col gap-3 text-sm">
            <h2 className="font-semibold text-foreground">Contact</h2>
            <DetailRow
              label="Name"
              value={application.contact_name ?? "—"}
            />
            <DetailRow
              label="Email"
              value={application.contact_email ?? "—"}
            />
          </div>

          <DeleteApplicationButton id={id} />
        </div>
      </div>
    </div>
  )
}

function DetailRow({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color?: string
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-fg shrink-0">{label}</span>
      <span
        className={cn(
          "text-right font-medium truncate",
          color ?? "text-foreground"
        )}
      >
        {value}
      </span>
    </div>
  )
}
