import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { StatusBadge } from "@/components/ui/badge"
import type { Application } from "@/types/database"

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string
  value: string | number
  sub?: string
  color?: string
}) {
  return (
    <div className="bg-card rounded-xl p-5 shadow-card border border-border flex flex-col gap-1 animate-fade-in">
      <span className="text-xs font-medium text-muted-fg uppercase tracking-wide">
        {label}
      </span>
      <span
        className={`text-3xl font-bold tabular-nums ${color ?? "text-foreground"}`}
      >
        {value}
      </span>
      {sub && <span className="text-xs text-muted-fg">{sub}</span>}
    </div>
  )
}

const SOURCE_LABELS: Record<string, string> = {
  linkedin: "LinkedIn",
  indeed: "Indeed",
  referral: "Referral",
  company_site: "Company Site",
  other: "Other",
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: applications } = await supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false })

  const apps = (applications as Application[]) ?? []

  const total = apps.length
  const responded = apps.filter(
    (a) =>
      !["wishlist", "applied"].includes(a.status) &&
      a.status !== "ghosted"
  ).length
  const applied = apps.filter((a) => a.status !== "wishlist").length
  const responseRate =
    applied > 0 ? Math.round((responded / applied) * 100) : 0
  const interviews = apps.filter((a) =>
    ["interview", "phone_screen"].includes(a.status)
  ).length
  const offers = apps.filter((a) => a.status === "offer").length

  const now = new Date()
  const upcomingInterviews = apps
    .filter(
      (a) => a.interview_date && new Date(a.interview_date) > now
    )
    .sort(
      (a, b) =>
        new Date(a.interview_date!).getTime() -
        new Date(b.interview_date!).getTime()
    )
    .slice(0, 5)

  // Source breakdown
  const sourceCounts: Record<string, number> = {}
  apps.forEach((a) => {
    const src = a.source ?? "other"
    sourceCounts[src] = (sourceCounts[src] ?? 0) + 1
  })
  const sourceEntries = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])
  const maxSource = sourceEntries[0]?.[1] ?? 1

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto w-full flex flex-col gap-8 pb-24 lg:pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-fg mt-0.5">
          Your job search at a glance
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Applications"
          value={total}
          sub="all time"
        />
        <StatCard
          label="Response Rate"
          value={`${responseRate}%`}
          sub="applied → response"
          color="text-primary"
        />
        <StatCard
          label="Interviews"
          value={interviews}
          sub="active"
          color="text-orange-600"
        />
        <StatCard
          label="Offers"
          value={offers}
          sub="active"
          color="text-accent"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming interviews */}
        <section>
          <h2 className="text-sm font-semibold text-foreground mb-3">
            Upcoming Interviews
          </h2>
          <div className="bg-card rounded-xl border border-border shadow-card divide-y divide-border">
            {upcomingInterviews.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-fg">
                No upcoming interviews
              </div>
            ) : (
              upcomingInterviews.map((app) => (
                <Link
                  key={app.id}
                  href={`/applications/${app.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {app.role}
                    </p>
                    <p className="text-xs text-muted-fg">{app.company}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-orange-600">
                      {new Date(app.interview_date!).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-fg">
                      {new Date(app.interview_date!).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Source breakdown */}
        <section>
          <h2 className="text-sm font-semibold text-foreground mb-3">
            Source Breakdown
          </h2>
          <div className="bg-card rounded-xl border border-border shadow-card p-4 flex flex-col gap-3">
            {sourceEntries.length === 0 ? (
              <div className="py-4 text-center text-sm text-muted-fg">
                Add applications to see source data
              </div>
            ) : (
              sourceEntries.map(([src, count]) => (
                <div key={src} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">
                      {SOURCE_LABELS[src] ?? src}
                    </span>
                    <span className="text-muted-fg tabular-nums">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${(count / maxSource) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Recent applications */}
      {apps.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">
              Recent Applications
            </h2>
            <Link
              href="/applications"
              className="text-xs font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="bg-card rounded-xl border border-border shadow-card divide-y divide-border">
            {apps.slice(0, 5).map((app) => (
              <Link
                key={app.id}
                href={`/applications/${app.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {app.role}
                  </p>
                  <p className="text-xs text-muted-fg">{app.company}</p>
                </div>
                <StatusBadge status={app.status} />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
