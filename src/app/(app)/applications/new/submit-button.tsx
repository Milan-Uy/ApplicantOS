"use client"
import { useFormStatus } from "react-dom"

export function SubmitButton({ label = "Save Application" }: { label?: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-6 py-2.5 rounded-lg bg-primary text-primary-fg text-sm font-semibold hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? "Saving…" : label}
    </button>
  )
}
