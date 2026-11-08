"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateProfile } from "./actions"

type State = { error?: string; success?: boolean; message?: string } | null

function SaveButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Save Changes"}
    </Button>
  )
}

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
        <Label htmlFor="profile-name">Name</Label>
        <Input id="profile-name" name="full_name" defaultValue={defaultName} required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="profile-email">Email</Label>
        <Input id="profile-email" name="email" type="email" defaultValue={defaultEmail} required />
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
