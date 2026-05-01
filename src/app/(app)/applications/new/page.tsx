import Link from "next/link"
import { createApplication } from "../actions"
import { SubmitButton } from "./submit-button"
import { createClient } from "@/lib/supabase/server"

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
  { value: "online_jobs_ph", label: "OnlineJobsPH" },
  { value: "other", label: "Other" },
]

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  )
}

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-fg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"

export default async function NewApplicationPage() {
  const supabase = await createClient()
  const { data: documents } = await supabase
    .from("documents")
    .select("id, label, filename")
    .eq("type", "resume")
    .order("created_at", { ascending: false })
  const resumes = documents ?? []

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto w-full">
      <Link
        href="/applications"
        className="inline-flex items-center gap-1.5 text-sm text-muted-fg hover:text-foreground transition-colors mb-4"
      >
        ← Back to Applications
      </Link>
      <h1 className="text-2xl font-bold text-foreground">
        Add New Application
      </h1>
      <p className="text-sm text-muted-fg mt-0.5">
        Track a new job application
      </p>

      <form action={createApplication} className="mt-8 flex flex-col gap-5">
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Company">
            <input
              name="company"
              placeholder="e.g. Acme Inc."
              className={inputClass}
            />
          </Field>
          <Field label="Role *">
            <input
              name="role"
              required
              placeholder="e.g. Frontend Engineer"
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Job Posting URL">
          <input
            name="url"
            type="url"
            placeholder="https://..."
            className={inputClass}
          />
        </Field>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Status">
            <select name="status" defaultValue="wishlist" className={inputClass}>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Source">
            <select name="source" defaultValue="" className={inputClass}>
              <option value="">Select source</option>
              {SOURCES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Resume">
          <select name="resume_id" defaultValue="" className={inputClass}>
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
            placeholder="e.g. Remote, New York, NY"
            className={inputClass}
          />
        </Field>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Salary Min">
            <input
              name="salary_min"
              type="number"
              placeholder="e.g. 80000"
              className={inputClass}
            />
          </Field>
          <Field label="Salary Max">
            <input
              name="salary_max"
              type="number"
              placeholder="e.g. 120000"
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Job Description">
          <textarea
            name="job_description"
            rows={6}
            placeholder="Paste the full job description here for AI features..."
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-fg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors resize-y"
          />
        </Field>

        <Field label="Notes">
          <textarea
            name="notes"
            rows={3}
            placeholder="Any personal notes..."
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-fg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors resize-y"
          />
        </Field>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Contact Name">
            <input
              name="contact_name"
              placeholder="e.g. Jane Smith"
              className={inputClass}
            />
          </Field>
          <Field label="Contact Email">
            <input
              name="contact_email"
              type="email"
              placeholder="jane@acme.com"
              className={inputClass}
            />
          </Field>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Applied Date">
            <input name="applied_at" type="date" className={inputClass} />
          </Field>
          <Field label="Interview Date">
            <input
              name="interview_date"
              type="datetime-local"
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Follow-up Date">
          <input name="follow_up_at" type="date" className={inputClass} />
        </Field>

        <div className="flex gap-3 pt-4">
          <SubmitButton />
        </div>
      </form>
    </div>
  )
}
