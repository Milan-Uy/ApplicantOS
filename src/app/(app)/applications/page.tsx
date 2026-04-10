import Link from "next/link"
import { Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import type { ApplicationListItem } from "@/types/database"
import { ApplicationsView } from "@/components/applications/ApplicationsView"

export default async function ApplicationsPage() {
  const supabase = await createClient()
  const { data: applications } = await supabase
    .from("applications")
    .select(
      "id, company, role, status, source, salary_min, salary_max, interview_date, applied_at, updated_at"
    )
    .order("updated_at", { ascending: false })

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Applications</h1>
          <p className="text-sm text-muted-fg mt-0.5">
            {(applications?.length ?? 0)} total applications
          </p>
        </div>
        <Link
          href="/applications/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-fg text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Application
        </Link>
      </div>

      <ApplicationsView
        applications={(applications as ApplicationListItem[]) ?? []}
      />
    </div>
  )
}
