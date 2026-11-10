import { Briefcase, Cpu, FileText, LayoutDashboard, Search, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: Briefcase, label: "Applications", active: true },
  { icon: FileText, label: "Resumes" },
  { icon: Search, label: "Job Discovery" },
  { icon: Settings, label: "Settings" },
]

const COLUMNS = [
  {
    label: "Wishlist",
    color: "text-muted-fg",
    count: 2,
    cards: [
      { role: "Staff Designer", co: "Figma" },
      { role: "Visual Designer", co: "Arc Browser" },
    ],
  },
  {
    label: "Applied",
    color: "text-accent",
    count: 3,
    cards: [
      { role: "Frontend Engineer", co: "Vercel" },
      { role: "Design Engineer", co: "Ramp", meta: "$170k–$210k", metaColor: "text-success" },
    ],
  },
  {
    label: "Phone Screen",
    color: "text-amber-400",
    count: 1,
    cards: [{ role: "Design Engineer", co: "Anthropic", meta: "Interview: May 1", metaColor: "text-orange-400" }],
  },
  {
    label: "Interview",
    color: "text-orange-400",
    count: 1,
    cards: [{ role: "Sr. Product Designer", co: "Linear", meta: "$160k–$210k", metaColor: "text-success" }],
  },
  {
    label: "Offer",
    color: "text-success",
    count: 1,
    cards: [{ role: "Product Designer", co: "Stripe", meta: "$190k–$240k", metaColor: "text-success" }],
  },
]

export function ProductPreview() {
  return (
    <div className="relative mx-auto mt-16 max-w-[1100px] animate-[preview-in_0.9s_var(--ease-out)_600ms_both] px-4 sm:px-8">
      {/* Glow behind frame */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -top-10 bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,rgba(94,106,210,0.25),transparent_70%)]"
      />
      <div className="relative z-10 overflow-hidden rounded-2xl border border-border-strong bg-[linear-gradient(180deg,#0f1011_0%,#0a0b0c_100%)] shadow-[0_0_0_1px_rgba(255,255,255,.05),0_40px_80px_-20px_rgba(0,0,0,.6),0_12px_32px_-8px_rgba(94,106,210,.15)]">
        {/* Toolbar */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-3.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/[0.08]" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/[0.08]" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/[0.08]" />
          <span className="ml-3 truncate font-mono text-[12px] text-muted-fg">applicant-os.app/applications</span>
        </div>
        {/* Body */}
        <div className="flex min-h-[380px]">
          <aside data-testid="preview-sidebar" className="hidden w-[200px] flex-shrink-0 border-r border-border bg-black/20 p-3 md:block">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-[22px] w-[22px] items-center justify-center rounded-[5px] bg-primary">
                <Cpu className="h-3 w-3 text-primary-fg" />
              </div>
              <span className="text-[12px] font-bold">
                Applicant<span className="text-accent">OS</span>
              </span>
            </div>
            {NAV.map(({ icon: Icon, label, active }) => (
              <div
                key={label}
                className={cn(
                  "mb-0.5 flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[12px]",
                  active ? "bg-white/[0.05] text-foreground" : "text-muted-fg",
                )}
              >
                <Icon className="h-[13px] w-[13px]" />
                {label}
              </div>
            ))}
          </aside>

          {/* Mini kanban */}
          <div className="flex-1 overflow-hidden p-[18px]">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <div className="text-[16px] font-bold tracking-[-0.01em]">Applications</div>
                <div className="mt-0.5 text-[12px] text-muted-fg">12 active &middot; 3 interviewing</div>
              </div>
              <div className="flex h-7 items-center gap-1.5 rounded bg-primary px-2.5 text-[11px] font-semibold text-primary-fg">
                + Add
              </div>
            </div>

            <div className="flex gap-3">
              {COLUMNS.map((col, colIdx) => (
                // Three columns fit a phone; the rest return from sm up.
                <div key={col.label} className={cn("min-w-0 flex-1", colIdx >= 3 && "hidden sm:block")}>
                  <div className="flex items-center justify-between px-1 pb-2">
                    <span className={cn("rounded-md border border-border bg-white/[0.05] px-2 py-0.5 text-[10px] font-medium", col.color)}>
                      {col.label}
                    </span>
                    <span className="text-[10px] tabular-nums text-muted-fg">{col.count}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {col.cards.map((card, cardIdx) => {
                      const delay = 1100 + colIdx * 120
                      const dragged = colIdx === 3 && cardIdx === 0
                      return (
                        <div
                          key={cardIdx}
                          className="rounded-lg border border-border bg-card p-2.5 shadow-[0_0_0_1px_rgba(255,255,255,.04)]"
                          // Computed per card: staggered entrance, plus the one looping "drag" card.
                          style={{
                            animation: dragged
                              ? `pv-card-in 0.5s ease ${delay}ms both, card-drag 4s ease-in-out 2400ms infinite`
                              : `pv-card-in 0.5s ease ${delay}ms both`,
                          }}
                        >
                          <div className="text-[12px] font-semibold">{card.role}</div>
                          <div className="mt-0.5 text-[11px] text-muted-fg">{card.co}</div>
                          {card.meta && <div className={cn("mt-1.5 text-[11px] font-medium", card.metaColor)}>{card.meta}</div>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
