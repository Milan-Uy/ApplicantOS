"use client"

import { useState, useSyncExternalStore } from "react"
import Link from "next/link"
import { ArrowRight, PauseCircle, Search } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/EmptyState"
import { StatCard } from "@/components/StatCard"
import type { JobDiscoverySettings } from "@/types/database"
import { saveKeywords, dismissJob } from "./actions"
import { KeywordsEditor, MAX_KEYWORDS } from "./KeywordsEditor"
import { DiscoveredJobCard, timeAgo, type DiscoveredJob } from "./DiscoveredJobCard"

type Props = {
  settings: JobDiscoverySettings
  initialDiscovered: DiscoveredJob[]
}

// Dismissed ids live outside the component: the undo toast outlives this page, so a
// remount (navigate away and back) must still see what is pending and what was undone.
// Ids stay after the delete lands; the revalidated list no longer has those rows.
let hiddenIds: ReadonlySet<string> = new Set()
const listeners = new Set<() => void>()
const NONE: ReadonlySet<string> = new Set()

function setHiddenId(id: string, hide: boolean) {
  const next = new Set(hiddenIds)
  if (hide) next.add(id)
  else next.delete(id)
  hiddenIds = next
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function JobDiscoveryClient({ settings, initialDiscovered }: Props) {
  const [keywords, setKeywords] = useState<string[]>(settings.keywords ?? [])
  const hidden = useSyncExternalStore(subscribe, () => hiddenIds, () => NONE)
  const discovered = initialDiscovered.filter((j) => !hidden.has(j.id))

  const handleKeywords = async (next: string[]) => {
    const prev = keywords
    setKeywords(next)
    try {
      await saveKeywords(next)
    } catch {
      setKeywords(prev)
      toast.error("Couldn't save keywords. Please try again.")
    }
  }

  const handleDismiss = (job: DiscoveredJob) => {
    setHiddenId(job.id, true)
    let settled = false
    // Delete only once the undo window closes (timeout, close button or swipe).
    const persist = async () => {
      if (settled) return
      settled = true
      try {
        await dismissJob(job.id)
      } catch {
        setHiddenId(job.id, false)
        toast.error(`Couldn't dismiss ${job.role}. Please try again.`)
      }
    }
    toast("Job dismissed", {
      description: job.role,
      duration: 5000,
      action: {
        label: "Undo",
        onClick: () => {
          settled = true
          setHiddenId(job.id, false)
        },
      },
      onAutoClose: persist,
      onDismiss: persist,
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Job Discovery</h1>
        <p className="mt-0.5 max-w-xl text-sm text-muted-fg">
          Roles found on OnlineJobs.ph and queued as wishlist applications.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-border bg-surface-2 p-4">
        <PauseCircle className="mt-0.5 size-5 shrink-0 text-muted-fg" aria-hidden />
        <p className="text-sm text-muted-fg">
          <span className="font-semibold text-foreground">Automation paused</span> — the n8n
          pipeline that fed this page has been retired; showing previously discovered jobs.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Discovered" value={discovered.length} hint="in the last 30 days" />
        <StatCard
          label="Last run"
          value={settings.last_run_at ? timeAgo(settings.last_run_at) : "—"}
          hint="Pipeline retired"
        />
        <StatCard label="Keywords" value={keywords.length} hint={`of ${MAX_KEYWORDS}`} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Keywords</CardTitle>
          <CardDescription>
            Each keyword runs as its own search when automation is running.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <KeywordsEditor keywords={keywords} onChange={handleKeywords} />
        </CardContent>
      </Card>

      <section className="flex flex-col gap-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Recently discovered</h2>
            <p className="mt-0.5 text-xs text-muted-fg">
              Last 30 days · waiting in your wishlist
            </p>
          </div>
          <Link
            href="/applications"
            className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
          >
            View all <ArrowRight className="size-3" aria-hidden />
          </Link>
        </div>
        {discovered.length === 0 ? (
          <EmptyState
            icon={Search}
            title="Nothing discovered"
            description="Jobs found by earlier automation runs show up here for 30 days."
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {discovered.map((job) => (
              <DiscoveredJobCard key={job.id} job={job} onDismiss={() => handleDismiss(job)} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
