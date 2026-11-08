import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { ApplicationForm } from "@/components/applications/ApplicationForm"

export default async function NewApplicationPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: documents } = await supabase
    .from("documents")
    .select("id, label, filename")
    .eq("type", "resume")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto w-full">
      <Link
        href="/applications"
        className="inline-flex items-center gap-1.5 text-sm text-muted-fg hover:text-foreground transition-colors mb-4"
      >
        ← Back to Applications
      </Link>
      <h1 className="text-2xl font-bold text-foreground">Add New Application</h1>
      <p className="text-sm text-muted-fg mt-0.5">Track a new job application</p>
      <ApplicationForm mode="create" resumes={documents ?? []} />
    </div>
  )
}
