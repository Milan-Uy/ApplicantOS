"use client"

import { useActionState } from "react"
import { Loader2, Play } from "lucide-react"
import { signInAsDemo } from "@/app/(auth)/actions"
import { Button } from "@/components/ui/button"

export function TryDemoButton() {
  const [state, action, pending] = useActionState(async () => (await signInAsDemo()) ?? null, null)
  return (
    <form action={action} className="flex flex-col items-center">
      <Button type="submit" variant="outline" disabled={pending} className="h-11 px-5 text-sm">
        {pending ? <Loader2 className="animate-spin" aria-hidden /> : <Play aria-hidden />}
        {pending ? "Opening demo…" : "Try the demo"}
      </Button>
      {state?.error && (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {state.error}
        </p>
      )}
    </form>
  )
}
