import { Ban, Bell, CalendarClock, FileText, Kanban, Lock, Phone, Search, Server, ShieldCheck, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollReveal } from "./ScrollReveal"
import { StatCounter } from "./StatCounter"

const STATS = [
  { label: "Active", value: 12, suffix: "", color: "text-foreground" },
  { label: "Response rate", value: 34, suffix: "%", color: "text-accent" },
  { label: "Interviews", value: 3, suffix: "", color: "text-orange-400" },
  { label: "Offers", value: 2, suffix: "", color: "text-success" },
]

const RESUMES = [
  { label: "Frontend — 2026 v3", file: "resume_v3.pdf · Apr 18" },
  { label: "Design Engineer", file: "resume_de.pdf · Apr 11" },
]

const REMINDERS = [
  {
    icon: CalendarClock,
    title: "Linear · Sr. Product Designer",
    when: "Tomorrow at 10:00 AM · 30 min · Notes ready",
    tag: "Interview",
    tone: "bg-orange-400/10 text-orange-400",
    tagColor: "text-orange-400",
  },
  {
    icon: Phone,
    title: "Anthropic · Design Engineer",
    when: "Thu at 2:30 PM · 45 min · Phone screen",
    tag: "Screen",
    tone: "bg-amber-400/10 text-amber-400",
    tagColor: "text-amber-400",
  },
]

const GUARANTEES = [
  { icon: ShieldCheck, label: "Row-level security", iconColor: "text-success" },
  { icon: Server, label: "Encrypted at rest" },
  { icon: Ban, label: "Never used for training" },
]

export function Features() {
  return (
    <ScrollReveal>
      <section id="features" className="mx-auto max-w-[1152px] px-4 pt-[120px] sm:px-8">
        <p className="mb-4 text-[12px] font-semibold uppercase tracking-[.08em] text-accent">Everything in one place</p>
        <h2 className="max-w-[680px] text-[length:clamp(28px,4vw,44px)] font-medium leading-[1.1] tracking-tight">
          A job-search workspace built for the way you actually look for work.
        </h2>
        <p className="mt-4 max-w-[580px] text-[16px] leading-[1.55] text-muted-fg">
          Stop juggling spreadsheets, doc folders, and four different tabs. ApplicantOS finds roles, holds your resumes, and
          tracks every conversation &mdash; quietly organized in one place.
        </p>

        <div data-testid="bento" className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-6">
          {/* Kanban tracker */}
          <BentoTile className="md:col-span-3 md:row-span-2">
            <TileIcon>
              <Kanban className="h-[18px] w-[18px]" />
            </TileIcon>
            <h3 className="mb-1.5 text-[16px] font-semibold tracking-[-0.01em]">Kanban-first tracker</h3>
            <p className="max-w-[380px] text-[13px] leading-[1.5] text-muted-fg">
              Drag every role across wishlist &rarr; applied &rarr; interview &rarr; offer. The board you wish your job search
              had.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-2.5">
              {STATS.map((s) => (
                <div key={s.label} className="rounded-lg border border-border bg-white/[0.02] p-3">
                  <div className="text-[10px] font-medium uppercase tracking-[.08em] text-muted-fg">{s.label}</div>
                  <div className={cn("mt-1 text-[22px] font-bold tabular-nums", s.color)}>
                    <StatCounter value={s.value} suffix={s.suffix} />
                  </div>
                </div>
              ))}
            </div>
          </BentoTile>

          {/* Job Discovery */}
          <BentoTile className="md:col-span-3">
            <TileIcon>
              <Search className="h-[18px] w-[18px] text-secondary" />
            </TileIcon>
            <h3 className="mb-1.5 text-[16px] font-semibold tracking-[-0.01em]">Auto-discover jobs on OnlineJobs.ph</h3>
            <p className="text-[13px] leading-[1.5] text-muted-fg">
              Set a few keywords and matching roles land as wishlist applications &mdash; you just review, dismiss, or
              move them forward.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <span className="h-2 w-2 flex-shrink-0 rounded-full bg-muted-fg" />
              <span className="text-[11px] text-muted-fg">
                <span className="font-medium text-foreground">Automation paused</span> &middot; showing previously
                discovered matches
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {["react developer", "bookkeeper", "virtual assistant"].map((kw) => (
                <span
                  key={kw}
                  className="rounded-md border border-primary/22 bg-primary/8 px-2.5 py-0.5 font-mono text-[11px] text-[#a5acf0]"
                >
                  {kw}
                </span>
              ))}
            </div>
            <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-border bg-[#0a0b0c] p-3">
              <span className="mt-0.5 flex flex-shrink-0 items-center gap-1 rounded border border-primary/25 bg-primary/12 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-[.06em] text-[#a5acf0]">
                <Sparkles className="h-[9px] w-[9px]" />
                Auto
              </span>
              <div className="min-w-0">
                <div className="text-[12px] font-semibold leading-snug">Senior React Developer (Remote, PH)</div>
                <div className="mt-0.5 text-[11px] text-muted-fg">
                  Acme Software &middot; matched &ldquo;react developer&rdquo;
                </div>
              </div>
            </div>
          </BentoTile>

          {/* Resume library */}
          <BentoTile className="md:col-span-3">
            <TileIcon>
              <FileText className="h-[18px] w-[18px]" />
            </TileIcon>
            <h3 className="mb-1.5 text-[16px] font-semibold tracking-[-0.01em]">Resume library</h3>
            <p className="text-[13px] leading-[1.5] text-muted-fg">
              Upload PDF or DOCX. Auto-parse, version, and pick the right one for each application.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              {RESUMES.map((r) => (
                <div key={r.label} className="flex items-center gap-2.5 rounded-lg border border-border bg-white/[0.02] p-2.5">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-white/[0.05] text-muted-fg">
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-[12px] font-medium">{r.label}</div>
                    <div className="text-[11px] text-muted-fg">{r.file}</div>
                  </div>
                </div>
              ))}
            </div>
          </BentoTile>

          {/* Interview reminders */}
          <BentoTile className="md:col-span-6">
            <div className="flex flex-wrap items-start justify-between gap-8">
              <div className="max-w-[380px]">
                <TileIcon>
                  <Bell className="h-[18px] w-[18px]" />
                </TileIcon>
                <h3 className="mb-1.5 text-[16px] font-semibold tracking-[-0.01em]">Interview reminders, not anxiety</h3>
                <p className="text-[13px] leading-[1.5] text-muted-fg">
                  Quiet email nudges 24 hours before an interview &mdash; the role, the company, and a link straight back to
                  your notes.
                </p>
              </div>
              <div className="flex min-w-0 max-w-[440px] flex-1 basis-[280px] flex-col gap-2">
                {REMINDERS.map(({ icon: Icon, title, when, tag, tone, tagColor }) => (
                  <div key={title} className="flex items-center gap-2.5 rounded-lg border border-border bg-[#0a0b0c] p-3">
                    <div className={cn("flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg", tone)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[12px] font-medium">{title}</div>
                      <div className="text-[11px] text-muted-fg">{when}</div>
                    </div>
                    <span className={cn("flex-shrink-0 text-[10px] font-medium uppercase tracking-[.06em]", tagColor)}>
                      {tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </BentoTile>

          {/* Privacy */}
          <BentoTile className="md:col-span-6">
            <div className="flex flex-wrap items-start justify-between gap-8">
              <div className="max-w-[520px]">
                <TileIcon>
                  <Lock className="h-[18px] w-[18px]" />
                </TileIcon>
                <h3 className="mb-1.5 text-[16px] font-semibold tracking-[-0.01em]">Yours, and only yours.</h3>
                <p className="text-[13px] leading-[1.5] text-muted-fg">
                  Resumes are stored in private, per-user Supabase Storage. We never train on your data, and we never sell
                  it. The only people who see your job search are you and the recruiters you choose.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                {GUARANTEES.map(({ icon: Icon, label, iconColor }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 rounded-full border border-border bg-white/[0.03] px-3.5 py-2 text-[12px] text-muted-fg"
                  >
                    <Icon className={cn("h-3.5 w-3.5", iconColor)} />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </BentoTile>
        </div>
      </section>
    </ScrollReveal>
  )
}

function BentoTile({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[14px] border border-border bg-[linear-gradient(180deg,rgba(255,255,255,.02),rgba(255,255,255,0))] p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-border-strong",
        className,
      )}
    >
      {children}
    </div>
  )
}

function TileIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.05] text-foreground">{children}</div>
  )
}
