"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AppError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => console.error(error), [error])
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto w-full flex flex-col items-center gap-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
      <p className="text-sm text-muted-fg max-w-sm">This page failed to load. Try again, or go back to the dashboard.</p>
      <div className="flex gap-3">
        <Button onClick={() => unstable_retry()}>Try again</Button>
        <Button asChild variant="outline">
          <Link href="/dashboard">Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
