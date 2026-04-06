import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { updateApplication } from "../../actions"
import { SubmitButton } from "../../new/submit-button"
import type { Application } from "@/types/database"

const STATUSES = [
  { value: "wishlist", label: "Wishlist" },
  { value: "applied", label: "Applied" },
  { value: "phone_screen", label: "Phone Screen" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
  { value: "ghosted", label: "Ghosted" },
]

const SOURCES = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "indeed", label: "Indeed" },
  { value: "referral", label: "Referral" },
  { value: "company_site", label: "Company Site" },
  { value: "other", label: "Other" },
]

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  )
}

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-fg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"

export default async function EditApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const [{ data: app }, { data: documents }] = await Promise.all([
    supabase.from("applications").select("*").eq("id", id).single(),
    supabase
      .from("documents")
      .select("id, label, filename")
      .eq("type", "resume")
      .order("created_at", { ascending: false }),
  ])

  if (!app) notFound()
  const resumes = documents ?? []

  const application = app as Application
  const action = updateApplication.bind(null, id)

  const toDateInput = (val: string | null) => val?.slice(0, 10) ?? ""
  const toDateTimeInput = (val: string | null) => val?.slice(0, 16) ?? ""

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto w-full">
      <Link
        href={`/applications/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-fg hover:text-foreground transition-colors mb-4"
      >
        ← Back to Application
      </Link>
      <h1 className="text-2xl font-bold text-foreground">Edit Application</h1>
      <p className="text-sm text-muted-fg mt-0.5">
        {application.role} at {application.company}
      </p>

      <form action={action} className="mt-8 flex flex-col gap-5">
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Company *">
            <input
              name="company"
              required
              defaultValue={application.company}
              className={inputClass}
            />
          </Field>
          <Field label="Role *">
            <input
              name="role"
              required
              defaultValue={application.role}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Job Posting URL">
          <input
            name="url"
            type="url"
            defaultValue={application.url ?? ""}
            placeholder="https://..."
            className={inputClass}
          />
        </Field>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Status">
            <select name="status" defaultValue={application.status} className={inputClass}>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Source">
            <select name="source" defaultValue={application.source ?? ""} className={inputClass}>
              <option value="">Select source</option>
              {SOURCES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Resume">
          <select name="resume_id" defaultValue={application.resume_id ?? ""} className={inputClass}>
            <option value="">Select resume (optional)</option>
            {resumes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label || r.filename}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Location">
          <input
            name="location"
            defaultValue={application.location ?? ""}
            placeholder="e.g. Remote, New York, NY"
            className={inputClass}
          />
        </Field>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Salary Min">
            <input
              name="salary_min"
              type="number"
              defaultValue={application.salary_min ?? ""}
              className={inputClass}
            />
          </Field>
          <Field label="Salary Max">
            <input
              name="salary_max"
              type="number"
              defaultValue={application.salary_max ?? ""}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Job Description">
          <textarea
            name="job_description"
            rows={6}
            defaultValue={application.job_description ?? ""}
            placeholder="Paste the full job description here for AI features..."
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-fg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors resize-y"
          />
        </Field>

        <Field label="Notes">
          <textarea
            name="notes"
            rows={3}
            defaultValue={application.notes ?? ""}
            placeholder="Any personal notes..."
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-fg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors resize-y"
          />
        </Field>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Contact Name">
            <input
              name="contact_name"
              defaultValue={application.contact_name ?? ""}
              placeholder="e.g. Jane Smith"
              className={inputClass}
            />
          </Field>
          <Field label="Contact Email">
            <input
              name="contact_email"
              type="email"
              defaultValue={application.contact_email ?? ""}
              placeholder="jane@acme.com"
              className={inputClass}
            />
          </Field>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Applied Date">
            <input
              name="applied_at"
              type="date"
              defaultValue={toDateInput(application.applied_at)}
              className={inputClass}
            />
          </Field>
          <Field label="Interview Date">
            <input
              name="interview_date"
              type="datetime-local"
              defaultValue={toDateTimeInput(application.interview_date)}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Follow-up Date">
          <input
            name="follow_up_at"
            type="date"
            defaultValue={toDateInput(application.follow_up_at)}
            className={inputClass}
          />
        </Field>

        <div className="flex gap-3 pt-4">
          <SubmitButton label="Save Changes" />
          <Link
            href={`/applications/${id}`}
            className="px-6 py-2.5 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
