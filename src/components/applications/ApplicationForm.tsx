"use client"

import { useSyncExternalStore, useTransition } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { createApplication, updateApplication } from "@/app/(app)/applications/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Application } from "@/types/database"

// Radix SelectItem can't carry "", so optional selects use this and it is dropped before submit.
const NONE = "none"
const OPTIONAL_SELECTS = ["source", "resume_id", "salary_currency", "salary_period"]

// false during SSR and before hydration, true once React runs in the browser.
const subscribeNoop = () => () => {}
const useHydrated = () => useSyncExternalStore(subscribeNoop, () => true, () => false)

const STATUSES = [
  { value: "wishlist", label: "Wishlist" },
  { value: "applied", label: "Applied" },
  { value: "phone_screen", label: "Phone Screen" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
]

const SOURCES = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "indeed", label: "Indeed" },
  { value: "referral", label: "Referral" },
  { value: "company_site", label: "Company Site" },
  { value: "online_jobs_ph", label: "OnlineJobsPH" },
  { value: "other", label: "Other" },
]

const CURRENCIES = ["USD", "PHP", "AUD"].map((c) => ({ value: c, label: c }))

const PERIODS = [
  { value: "monthly", label: "Monthly" },
  { value: "hourly", label: "Hourly" },
]

type Option = { value: string; label: string }

function Field({ name, label, children }: { name: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={`app-${name}`}>{label}</Label>
      {children}
    </div>
  )
}

function SelectField({
  name,
  label,
  options,
  defaultValue,
  placeholder,
  optional = true,
}: {
  name: string
  label: string
  options: Option[]
  defaultValue?: string | null
  placeholder?: string
  optional?: boolean
}) {
  return (
    <Field name={name} label={label}>
      <Select name={name} defaultValue={defaultValue ?? undefined}>
        <SelectTrigger id={`app-${name}`} className="w-full">
          <SelectValue placeholder={placeholder ?? "—"} />
        </SelectTrigger>
        <SelectContent>
          {optional && <SelectItem value={NONE}>None</SelectItem>}
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  )
}

const toDateInput = (val: string | null | undefined) => val?.slice(0, 10) ?? ""

export function ApplicationForm({
  mode,
  initial = {},
  resumes,
}: {
  mode: "create" | "edit"
  initial?: Partial<Application>
  resumes: { id: string; label: string | null; filename: string }[]
}) {
  const [pending, startTransition] = useTransition()
  // Before hydration onSubmit isn't attached, so a submit would be a native GET that saves nothing.
  const hydrated = useHydrated()

  // onSubmit, not the form `action` prop: React resets uncontrolled fields after an action, losing input on error.
  const onSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    for (const key of OPTIONAL_SELECTS) if (formData.get(key) === NONE) formData.delete(key)
    startTransition(async () => {
      try {
        const result =
          mode === "create" ? await createApplication(formData) : await updateApplication(initial.id!, formData)
        if (result?.error) toast.error(result.error)
      } catch {
        toast.error("Couldn't save the application. Please try again.")
      }
    })
  }

  const text = (name: keyof Application) => (initial[name] as string | null | undefined) ?? ""

  return (
    <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <Field name="company" label="Company">
          <Input id="app-company" name="company" defaultValue={text("company")} placeholder="e.g. Acme Inc." />
        </Field>
        <Field name="role" label="Role *">
          <Input id="app-role" name="role" required defaultValue={text("role")} placeholder="e.g. Frontend Engineer" />
        </Field>
      </div>

      <Field name="url" label="Job Posting URL">
        <Input id="app-url" name="url" type="url" defaultValue={text("url")} placeholder="https://..." />
      </Field>

      <div className="grid sm:grid-cols-2 gap-5">
        <SelectField name="status" label="Status" options={STATUSES} defaultValue={initial.status ?? "wishlist"} optional={false} />
        <SelectField name="source" label="Source" options={SOURCES} defaultValue={initial.source} placeholder="Select source" />
      </div>

      <SelectField
        name="resume_id"
        label="Resume"
        options={resumes.map((r) => ({ value: r.id, label: r.label || r.filename }))}
        defaultValue={initial.resume_id}
        placeholder="Select resume (optional)"
      />

      <Field name="location" label="Location">
        <Input id="app-location" name="location" defaultValue={text("location")} placeholder="e.g. Remote, New York, NY" />
      </Field>

      <div className="grid sm:grid-cols-2 gap-5">
        <Field name="salary_min" label="Salary Min">
          <Input id="app-salary_min" name="salary_min" type="number" defaultValue={initial.salary_min ?? ""} placeholder="e.g. 80000" />
        </Field>
        <Field name="salary_max" label="Salary Max">
          <Input id="app-salary_max" name="salary_max" type="number" defaultValue={initial.salary_max ?? ""} placeholder="e.g. 120000" />
        </Field>
        <SelectField name="salary_currency" label="Currency" options={CURRENCIES} defaultValue={initial.salary_currency} />
        <SelectField name="salary_period" label="Period" options={PERIODS} defaultValue={initial.salary_period} />
      </div>

      <Field name="job_description" label="Job Description">
        <Textarea
          id="app-job_description"
          name="job_description"
          rows={6}
          defaultValue={text("job_description")}
          placeholder="Paste the full job description here for AI features..."
        />
      </Field>

      <Field name="notes" label="Notes">
        <Textarea id="app-notes" name="notes" rows={3} defaultValue={text("notes")} placeholder="Any personal notes..." />
      </Field>

      <div className="grid sm:grid-cols-2 gap-5">
        <Field name="contact_name" label="Contact Name">
          <Input id="app-contact_name" name="contact_name" defaultValue={text("contact_name")} placeholder="e.g. Jane Smith" />
        </Field>
        <Field name="contact_email" label="Contact Email">
          <Input id="app-contact_email" name="contact_email" type="email" defaultValue={text("contact_email")} placeholder="jane@acme.com" />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <Field name="applied_at" label="Applied Date">
          <Input id="app-applied_at" name="applied_at" type="date" defaultValue={toDateInput(initial.applied_at)} />
        </Field>
        <Field name="interview_date" label="Interview Date">
          <Input id="app-interview_date" name="interview_date" type="date" defaultValue={toDateInput(initial.interview_date)} />
        </Field>
      </div>

      <Field name="follow_up_at" label="Follow-up Date">
        <Input id="app-follow_up_at" name="follow_up_at" type="date" defaultValue={toDateInput(initial.follow_up_at)} />
      </Field>

      <div className="flex gap-3 pt-4">
        <Button type="submit" size="lg" disabled={pending || !hydrated}>
          {pending ? "Saving…" : mode === "create" ? "Save Application" : "Save Changes"}
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href={mode === "create" ? "/applications" : `/applications/${initial.id}`}>Cancel</Link>
        </Button>
      </div>
    </form>
  )
}
