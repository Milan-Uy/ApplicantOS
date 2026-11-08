"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full bg-card border border-border rounded-xl p-6 flex flex-col gap-4 shadow-card">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-lg font-semibold text-foreground tracking-tight">
            Something went wrong
          </h1>
          <p className="text-sm text-muted-fg leading-relaxed">
            An unexpected error occurred while loading this page. You can try again, or head back to the dashboard.
          </p>
        </div>
        {error.digest && (
          <p className="text-[11px] font-mono text-muted-fg break-all">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex gap-2">
          <button
            onClick={reset}
            className="px-4 py-2 rounded-lg bg-primary text-primary-fg text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}
