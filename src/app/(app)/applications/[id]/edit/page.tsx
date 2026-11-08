import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ApplicationForm } from "@/components/applications/ApplicationForm"

export default async function EditApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const [{ data: application }, { data: documents }] = await Promise.all([
    supabase.from("applications").select("id, status, source, role, company, url, salary_min, salary_max, salary_currency, salary_period, location, job_description, notes, contact_name, contact_email, resume_id, interview_date, applied_at, follow_up_at").eq("id", id).eq("user_id", user!.id).single(),
    supabase
      .from("documents")
      .select("id, label, filename")
      .eq("type", "resume")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false }),
  ])

  if (!application) notFound()

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto w-full">
      <Link
        href={`/applications/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-fg hover:text-foreground transition-colors mb-4"
      >
        ← Back to Application
      </Link>
      <h1 className="text-2xl font-bold text-foreground">Edit Application</h1>
      <p className="text-sm text-muted-fg mt-0.5">
        {application.role}{application.company ? ` at ${application.company}` : ""}
      </p>
      <ApplicationForm mode="edit" initial={application} resumes={documents ?? []} />
    </div>
  )
}
