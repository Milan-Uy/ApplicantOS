import Link from "next/link"
import { Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import type { Application } from "@/types/database"
import { StatusBadge } from "@/components/ui/badge"
import { ApplicationsView } from "@/components/applications/ApplicationsView"

export default async function ApplicationsPage() {
  const supabase = await createClient()
  const { data: applications } = await supabase
    .from("applications")
    .select("*")
    .order("updated_at", { ascending: false })

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
        applications={(applications as Application[]) ?? []}
      />
    </div>
  )
}
