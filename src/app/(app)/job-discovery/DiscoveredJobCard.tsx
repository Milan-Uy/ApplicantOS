import Link from "next/link"
import { ArrowRight, ExternalLink, Sparkles, X } from "lucide-react"
import { Badge, StatusBadge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export type DiscoveredJob = {
  id: string
  role: string
  company: string
  url: string | null
  created_at: string
  status: string
}

export function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function DiscoveredJobCard({ job, onDismiss }: { job: DiscoveredJob; onDismiss: () => void }) {
  return (
    <Card className="gap-3 px-4 transition-shadow hover:ring-foreground/20">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Badge className="mb-1.5 gap-1 px-1.5 text-[10px] text-accent uppercase tracking-wider">
            <Sparkles className="size-2.5" aria-hidden />
            Auto
          </Badge>
          <h3 className="text-sm font-semibold leading-snug text-foreground">{job.role}</h3>
          {job.company && <p className="mt-0.5 text-xs text-muted-fg">{job.company}</p>}
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onDismiss}
          aria-label={`Dismiss ${job.role}`}
          className="text-fg-subtle hover:bg-destructive/10 hover:text-destructive"
        >
          <X />
        </Button>
      </div>

      <div className="flex items-center justify-between gap-2 text-xs text-fg-subtle">
        <span>Discovered {timeAgo(job.created_at)}</span>
        <StatusBadge status={job.status} />
      </div>

      <div className="flex gap-1.5 border-t border-border pt-3">
        <Button asChild variant="secondary" size="sm" className="flex-1">
          <Link href={`/applications/${job.id}`}>
            View in app <ArrowRight />
          </Link>
        </Button>
        {job.url && (
          <Button asChild variant="ghost" size="sm">
            <a href={job.url} target="_blank" rel="noopener noreferrer">
              Listing <ExternalLink />
            </a>
          </Button>
        )}
      </div>
    </Card>
  )
}
