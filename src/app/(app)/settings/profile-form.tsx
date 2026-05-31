"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { updateProfile } from "./actions"

type State = { error?: string; success?: boolean; message?: string } | null

function SaveButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 rounded-lg bg-primary text-primary-fg text-sm font-semibold hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? "Saving…" : "Save Changes"}
    </button>
  )
}

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-fg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"

export function ProfileForm({
  defaultName,
  defaultEmail,
}: {
  defaultName: string
  defaultEmail: string
}) {
  const [state, formAction] = useActionState<State, FormData>(
    async (_prev, formData) => updateProfile(formData),
    null
  )

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">Name</label>
        <input
          name="full_name"
          defaultValue={defaultName}
          required
          className={inputClass}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">Email</label>
        <input
          name="email"
          type="email"
          defaultValue={defaultEmail}
          required
          className={inputClass}
        />
        <p className="text-xs text-muted-fg">
          Changing email sends a confirmation link to the new address.
        </p>
      </div>

      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      {state?.success && state.message && (
        <p className="text-sm text-primary">{state.message}</p>
      )}

      <div>
        <SaveButton />
      </div>
    </form>
  )
}
