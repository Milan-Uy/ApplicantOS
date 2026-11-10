"use client"

import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Play } from "lucide-react"
import { signInAsDemo } from "@/app/(auth)/actions"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export function TryDemoButton() {
  const router = useRouter()
  const [state, action, pending] = useActionState(async () => {
    const result = await signInAsDemo()
    if ("error" in result) return result
    // Verified here, not on the server, so Supabase's per-IP limit applies to this visitor alone.
    const { error } = await createClient().auth.verifyOtp({ token_hash: result.tokenHash, type: "email" })
    if (error) return { error: "The demo is not available right now." }
    router.push("/dashboard")
    return { redirecting: true }
  }, null)
  const busy = pending || (!!state && "redirecting" in state)

  return (
    <form action={action} className="flex flex-col items-center">
      <Button type="submit" variant="outline" disabled={busy} className="h-11 px-5 text-sm">
        {busy ? <Loader2 className="animate-spin" aria-hidden /> : <Play aria-hidden />}
        {busy ? "Opening demo…" : "Try the demo"}
      </Button>
      {state && "error" in state && (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {state.error}
        </p>
      )}
    </form>
  )
}
