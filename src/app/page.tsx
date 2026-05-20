import Link from "next/link"
import {
  Cpu,
  ArrowRight,
  ChevronDown,
  Kanban,
  FileText,
  Bell,
  Lock,
  ShieldCheck,
  Server,
  Ban,
  CalendarClock,
  LayoutDashboard,
  Briefcase,
  Settings,
  Search,
  Phone,
  Sparkles,
} from "lucide-react"
import { ScrollReveal } from "@/components/landing/ScrollReveal"
import { StatCounter } from "@/components/landing/StatCounter"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Fixed ambient background */}
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -10%, rgba(94,106,210,0.22), transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 30%, rgba(113,112,255,0.10), transparent 60%)
          `,
          animation: "ambient-breathe 14s ease-in-out infinite",
        }}
      />
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none z-0 opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 30%, #000 30%, transparent 80%)",
        }}
      />

      {/* All page content sits above the fixed bg */}
      <div className="relative z-10">
        {/* Nav */}
        <header style={{ animation: "nav-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) both" }}>
          <nav className="max-w-[1152px] mx-auto flex items-center justify-between h-16 px-8">
            <Link href="/" className="flex items-center gap-2.5 no-underline">
              <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
                <Cpu className="w-4 h-4 text-white" />
              </div>
              <span className="text-[15px] font-bold tracking-[-0.01em] text-foreground">
                Applicant<span className="text-primary">OS</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-7">
              <a
                href="#features"
                className="nav-link text-[13px] font-medium text-muted-fg hover:text-foreground transition-colors duration-150"
              >
                Features
              </a>
              <a
                href="#how"
                className="nav-link text-[13px] font-medium text-muted-fg hover:text-foreground transition-colors duration-150"
              >
                How it works
              </a>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="nav-link h-9 px-4 rounded-lg text-[13px] font-medium text-muted-fg hover:text-foreground hover:bg-white/[0.05] transition-colors duration-150 flex items-center"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="h-9 px-4 rounded-lg bg-primary text-white text-[13px] font-semibold flex items-center transition-colors duration-150 hover:bg-[#6c77d6] relative overflow-hidden group"
                style={{ boxShadow: "var(--shadow-glow-primary)" }}
              >
                <span className="btn-shine-inner" aria-hidden />
                Get Started
              </Link>
            </div>
          </nav>
        </header>

        {/* Hero */}
        <section className="text-center px-8 pt-20 pb-16 max-w-[1152px] mx-auto">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-border text-[12px] text-muted-fg mb-6"
            style={{ animation: "hero-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) 80ms both" }}
          >
            <span className="bg-primary text-white text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide">
              New
            </span>
            Job Discovery &mdash; auto-find roles on OnlineJobs.ph
            <ArrowRight
              className="w-3 h-3"
              style={{ animation: "arrow-nudge 2.4s ease-in-out infinite" }}
            />
          </div>

          <h1
            className="font-medium tracking-[-0.04em] leading-none text-balance mx-auto max-w-[880px]"
            style={{
              fontSize: "clamp(40px, 6vw, 76px)",
              animation: "hero-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) 200ms both",
            }}
          >
            Land your next role,
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #f7f8f8 0%, #a5acf0 40%, #8a8f98 100%)",
                backgroundSize: "200% 200%",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                animation: "accent-shimmer 8s ease infinite",
              }}
            >
              not lost in spreadsheets.
            </span>
          </h1>

          <p
            className="mt-6 mx-auto max-w-[580px] text-muted-fg text-balance"
            style={{
              fontSize: "17px",
              lineHeight: 1.5,
              animation: "hero-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) 380ms both",
            }}
          >
            Auto-discover roles, track every application across the pipeline,
            and never miss an interview &mdash; all in one quiet workspace.
          </p>

          <div
            className="mt-9 flex gap-2.5 justify-center items-center flex-wrap"
            style={{ animation: "hero-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) 520ms both" }}
          >
            <Link
              href="/signup"
              className="h-11 px-5 rounded-lg bg-primary text-white text-sm font-semibold flex items-center gap-2 transition-colors duration-150 hover:bg-[#6c77d6] relative overflow-hidden group"
              style={{ animation: "cta-glow 3.2s ease-in-out infinite" }}
            >
              <span className="btn-shine-inner" aria-hidden />
              Get started &mdash; it&apos;s free
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <a
              href="#features"
              className="h-11 px-5 rounded-lg bg-[#0f1011] text-foreground text-sm font-medium border border-border flex items-center gap-2 transition-colors duration-150 hover:bg-[#16181a] hover:border-[rgba(255,255,255,0.12)]"
            >
              Browse features
              <ChevronDown className="w-3.5 h-3.5" />
            </a>
          </div>
        </section>

        {/* Product preview frame */}
        <div
          className="mt-16 mx-auto max-w-[1100px] px-8 relative"
          style={{ animation: "preview-in 0.9s cubic-bezier(0.22, 1, 0.36, 1) 600ms both" }}
        >
          {/* Glow behind frame */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              top: "-40px",
              background:
                "radial-gradient(ellipse 60% 100% at 50% 0%, rgba(94,106,210,0.25), transparent 70%)",
            }}
          />
          <div
            className="relative z-10 rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.12)]"
            style={{
              background: "linear-gradient(180deg, #0f1011 0%, #0a0b0c 100%)",
              boxShadow:
                "0 0 0 1px rgba(255,255,255,.05), 0 40px 80px -20px rgba(0,0,0,.6), 0 12px 32px -8px rgba(94,106,210,.15)",
            }}
          >
            {/* Toolbar */}
            <div className="flex items-center gap-2 px-4 py-3.5 border-b border-border">
              <span className="w-2.5 h-2.5 rounded-full bg-white/[0.08]" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/[0.08]" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/[0.08]" />
              <span className="ml-3 font-mono text-[12px] text-muted-fg">
                applicant-os.app/applications
              </span>
            </div>
            {/* Body */}
            <div className="flex" style={{ minHeight: "380px" }}>
              {/* Mini sidebar */}
              <aside
                className="border-r border-border p-3 flex-shrink-0"
                style={{ width: "200px", background: "rgba(0,0,0,0.2)" }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-[22px] h-[22px] rounded-[5px] bg-primary flex items-center justify-center">
                    <Cpu className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-[12px] font-bold">
                    Applicant<span className="text-primary">OS</span>
                  </span>
                </div>
                {[
                  { icon: LayoutDashboard, label: "Dashboard" },
                  { icon: Briefcase, label: "Applications", active: true },
                  { icon: FileText, label: "Resumes" },
                  { icon: Search, label: "Job Discovery" },
                  { icon: Settings, label: "Settings" },
                ].map(({ icon: Icon, label, active }) => (
                  <div
                    key={label}
                    className={`flex items-center gap-2.5 px-2.5 py-[7px] rounded-md text-[12px] mb-0.5 ${
                      active
                        ? "bg-white/[0.05] text-foreground"
                        : "text-muted-fg"
                    }`}
                  >
                    <Icon className="w-[13px] h-[13px]" />
                    {label}
                  </div>
                ))}
              </aside>

              {/* Mini kanban */}
              <div className="flex-1 p-[18px] overflow-hidden">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <div className="text-[16px] font-bold tracking-[-0.01em]">
                      Applications
                    </div>
                    <div className="text-[12px] text-muted-fg mt-0.5">
                      12 active &middot; 3 interviewing
                    </div>
                  </div>
                  <div
                    className="flex items-center gap-1.5 bg-primary text-white rounded px-2.5 text-[11px] font-semibold"
                    style={{ height: "28px" }}
                  >
                    + Add
                  </div>
                </div>

                <div className="flex gap-3">
                  {[
                    {
                      label: "Wishlist",
                      color: "#8a8f98",
                      count: 2,
                      cards: [
                        { role: "Staff Designer", co: "Figma" },
                        { role: "Visual Designer", co: "Arc Browser" },
                      ],
                    },
                    {
                      label: "Applied",
                      color: "#5e6ad2",
                      count: 3,
                      cards: [
                        { role: "Frontend Engineer", co: "Vercel" },
                        {
                          role: "Design Engineer",
                          co: "Ramp",
                          meta: "$170k–$210k",
                          metaColor: "#10b981",
                        },
                      ],
                    },
                    {
                      label: "Phone Screen",
                      color: "#fbbf24",
                      count: 1,
                      cards: [
                        {
                          role: "Design Engineer",
                          co: "Anthropic",
                          meta: "Interview: May 1",
                          metaColor: "#fb923c",
                        },
                      ],
                    },
                    {
                      label: "Interview",
                      color: "#fb923c",
                      count: 1,
                      cards: [
                        {
                          role: "Sr. Product Designer",
                          co: "Linear",
                          meta: "$160k–$210k",
                          metaColor: "#10b981",
                        },
                      ],
                    },
                    {
                      label: "Offer",
                      color: "#10b981",
                      count: 1,
                      cards: [
                        {
                          role: "Product Designer",
                          co: "Stripe",
                          meta: "$190k–$240k",
                          metaColor: "#10b981",
                        },
                      ],
                    },
                  ].map((col, colIdx) => (
                    <div key={col.label} className="flex-1 min-w-0">
                      <div className="flex justify-between items-center px-1 pb-2">
                        <span
                          className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/[0.05] border border-border"
                          style={{ color: col.color }}
                        >
                          {col.label}
                        </span>
                        <span className="text-[10px] text-muted-fg tabular-nums">
                          {col.count}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {col.cards.map((card, cardIdx) => {
                          const isInterviewCard = colIdx === 3 && cardIdx === 0
                          const baseDelay = 1100 + colIdx * 120
                          return (
                            <div
                              key={cardIdx}
                              className="bg-[#0f1011] border border-border rounded-lg p-2.5"
                              style={{
                                boxShadow: "0 0 0 1px rgba(255,255,255,.04)",
                                animation: isInterviewCard
                                  ? `pv-card-in 0.5s ease ${baseDelay}ms both, card-drag 4s ease-in-out 2400ms infinite`
                                  : `pv-card-in 0.5s ease ${baseDelay}ms both`,
                              }}
                            >
                              <div className="text-[12px] font-semibold">
                                {card.role}
                              </div>
                              <div className="text-[11px] text-muted-fg mt-0.5">
                                {card.co}
                              </div>
                              {card.meta && (
                                <div
                                  className="text-[11px] font-medium mt-1.5"
                                  style={{ color: card.metaColor }}
                                >
                                  {card.meta}
                                </div>
                              )}
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

        {/* Bento features */}
        <ScrollReveal>
          <section
            id="features"
            className="pt-[120px] max-w-[1152px] mx-auto px-8"
          >
            <p className="text-[12px] font-semibold text-primary uppercase tracking-[.08em] mb-4">
              Everything in one place
            </p>
            <h2
              className="font-medium tracking-tight leading-[1.1] max-w-[680px]"
              style={{ fontSize: "clamp(28px, 4vw, 44px)" }}
            >
              A job-search workspace built for the way you actually look for work.
            </h2>
            <p
              className="mt-4 text-muted-fg max-w-[580px]"
              style={{ fontSize: "16px", lineHeight: 1.55 }}
            >
              Stop juggling spreadsheets, doc folders, and four different tabs.
              ApplicantOS finds roles, holds your resumes, and tracks every
              conversation &mdash; quietly organized in one place.
            </p>

            <div
              className="mt-14 grid gap-4"
              style={{ gridTemplateColumns: "repeat(6, 1fr)" }}
            >
              {/* Tile 1 — Kanban tracker (col-3 row-2) */}
              <BentoTile className="col-span-3 row-span-2">
                <TileIcon>
                  <Kanban className="w-[18px] h-[18px]" />
                </TileIcon>
                <h3 className="text-[16px] font-semibold tracking-[-0.01em] mb-1.5">
                  Kanban-first tracker
                </h3>
                <p className="text-[13px] text-muted-fg leading-[1.5] max-w-[380px]">
                  Drag every role across wishlist &rarr; applied &rarr; interview
                  &rarr; offer. The board you wish your job search had.
                </p>
                <div
                  className="mt-6 grid gap-2.5"
                  style={{ gridTemplateColumns: "repeat(2, 1fr)" }}
                >
                  {[
                    { label: "Active", value: 12, suffix: "", color: "#f7f8f8" },
                    { label: "Response rate", value: 34, suffix: "%", color: "#5e6ad2" },
                    { label: "Interviews", value: 3, suffix: "", color: "#fb923c" },
                    { label: "Offers", value: 2, suffix: "", color: "#10b981" },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="bg-white/[0.02] border border-border rounded-lg p-3"
                    >
                      <div className="text-[10px] text-muted-fg uppercase tracking-[.08em] font-medium">
                        {s.label}
                      </div>
                      <div
                        className="text-[22px] font-bold tabular-nums mt-1"
                        style={{ color: s.color }}
                      >
                        <StatCounter value={s.value} suffix={s.suffix} />
                      </div>
                    </div>
                  ))}
                </div>
              </BentoTile>

              {/* Tile 2 — Job Discovery */}
              <BentoTile className="col-span-3">
                <TileIcon>
                  <Search className="w-[18px] h-[18px]" style={{ color: "#7170ff" }} />
                </TileIcon>
                <h3 className="text-[16px] font-semibold tracking-[-0.01em] mb-1.5">
                  Auto-discover jobs on OnlineJobs.ph
                </h3>
                <p className="text-[13px] text-muted-fg leading-[1.5]">
                  Set a few keywords. We check daily and queue any matches as
                  wishlist applications &mdash; you just review, dismiss, or move
                  them forward.
                </p>
                {/* Status row */}
                <div className="mt-5 flex items-center gap-2">
                  <span className="relative w-2 h-2 flex-shrink-0">
                    <span
                      className="absolute inset-0 rounded-full bg-[#10b981]"
                      style={{ animation: "pulse-fade 2s ease-out infinite" }}
                    />
                    <span className="absolute inset-0 rounded-full bg-[#10b981]" />
                  </span>
                  <span className="text-[11px] text-muted-fg">
                    Last checked{" "}
                    <span className="text-foreground font-medium">2h ago</span>
                    {" "}&middot; 3 new matches
                  </span>
                </div>
                {/* Keyword chips */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {["react developer", "bookkeeper", "virtual assistant"].map(
                    (kw, i) => (
                      <span
                        key={kw}
                        className="font-mono text-[11px] px-2.5 py-0.5 rounded-md"
                        style={{
                          color: "#a5acf0",
                          background: "rgba(94,106,210,0.08)",
                          border: "1px solid rgba(94,106,210,0.22)",
                          animation: `chip-pulse 4.8s ease-in-out ${i * 1600}ms infinite`,
                        }}
                      >
                        {kw}
                      </span>
                    )
                  )}
                </div>
                {/* Matched job card */}
                <div
                  className="mt-3 p-3 rounded-lg border border-border flex gap-2.5 items-start"
                  style={{ background: "#0a0b0c" }}
                >
                  <span
                    className="flex items-center gap-1 text-[9px] font-medium uppercase tracking-[.06em] px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5"
                    style={{
                      color: "#a5acf0",
                      background: "rgba(94,106,210,0.12)",
                      border: "1px solid rgba(94,106,210,0.25)",
                    }}
                  >
                    <Sparkles className="w-[9px] h-[9px]" />
                    Auto
                  </span>
                  <div className="min-w-0">
                    <div className="text-[12px] font-semibold leading-snug">
                      Senior React Developer (Remote, PH)
                    </div>
                    <div className="text-[11px] text-muted-fg mt-0.5">
                      Acme Software &middot; matched &ldquo;react developer&rdquo;
                    </div>
                  </div>
                </div>
              </BentoTile>

              {/* Tile 3 — Resume library */}
              <BentoTile className="col-span-3">
                <TileIcon>
                  <FileText className="w-[18px] h-[18px]" />
                </TileIcon>
                <h3 className="text-[16px] font-semibold tracking-[-0.01em] mb-1.5">
                  Resume library
                </h3>
                <p className="text-[13px] text-muted-fg leading-[1.5]">
                  Upload PDF or DOCX. Auto-parse, version, and pick the right one
                  for each application.
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  {[
                    {
                      label: "Frontend — 2026 v3",
                      file: "resume_v3.pdf · Apr 18",
                    },
                    {
                      label: "Design Engineer",
                      file: "resume_de.pdf · Apr 11",
                    },
                  ].map((r) => (
                    <div
                      key={r.label}
                      className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border bg-white/[0.02]"
                    >
                      <div className="w-7 h-7 rounded-md bg-white/[0.05] flex items-center justify-center text-muted-fg flex-shrink-0">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-[12px] font-medium">{r.label}</div>
                        <div className="text-[11px] text-muted-fg">{r.file}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </BentoTile>

              {/* Tile 4 — Interview reminders (full width, two cards) */}
              <BentoTile className="col-span-6">
                <div className="flex justify-between items-start gap-8 flex-wrap">
                  <div className="max-w-[380px]">
                    <TileIcon>
                      <Bell className="w-[18px] h-[18px]" />
                    </TileIcon>
                    <h3 className="text-[16px] font-semibold tracking-[-0.01em] mb-1.5">
                      Interview reminders, not anxiety
                    </h3>
                    <p className="text-[13px] text-muted-fg leading-[1.5]">
                      Quiet email nudges 24 hours before an interview &mdash; the
                      role, the company, and a link straight back to your notes.
                    </p>
                  </div>
                  <div className="flex-1 min-w-[280px] max-w-[440px] flex flex-col gap-2">
                    {/* Card 1 — Interview */}
                    <div
                      className="p-3 rounded-lg border border-border flex items-center gap-2.5"
                      style={{ background: "#0a0b0c" }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          background: "rgba(251,146,60,0.1)",
                          color: "#fb923c",
                        }}
                      >
                        <CalendarClock className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-medium">
                          Linear &middot; Sr. Product Designer
                        </div>
                        <div className="text-[11px] text-muted-fg">
                          Tomorrow at 10:00 AM &middot; 30 min &middot; Notes ready
                        </div>
                      </div>
                      <span
                        className="text-[10px] font-medium uppercase tracking-[.06em] flex-shrink-0"
                        style={{ color: "#fb923c" }}
                      >
                        Interview
                      </span>
                    </div>
                    {/* Card 2 — Phone Screen */}
                    <div
                      className="p-3 rounded-lg border border-border flex items-center gap-2.5"
                      style={{ background: "#0a0b0c" }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          background: "rgba(251,191,36,0.1)",
                          color: "#fbbf24",
                        }}
                      >
                        <Phone className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-medium">
                          Anthropic &middot; Design Engineer
                        </div>
                        <div className="text-[11px] text-muted-fg">
                          Thu at 2:30 PM &middot; 45 min &middot; Phone screen
                        </div>
                      </div>
                      <span
                        className="text-[10px] font-medium uppercase tracking-[.06em] flex-shrink-0"
                        style={{ color: "#fbbf24" }}
                      >
                        Screen
                      </span>
                    </div>
                  </div>
                </div>
              </BentoTile>

              {/* Tile 5 — Privacy (full width) */}
              <BentoTile className="col-span-6">
                <div className="flex justify-between items-start gap-8 flex-wrap">
                  <div className="max-w-[520px]">
                    <TileIcon>
                      <Lock className="w-[18px] h-[18px]" />
                    </TileIcon>
                    <h3 className="text-[16px] font-semibold tracking-[-0.01em] mb-1.5">
                      Yours, and only yours.
                    </h3>
                    <p className="text-[13px] text-muted-fg leading-[1.5]">
                      Resumes are stored encrypted in S3 with row-level security.
                      We never train on your data, and we never sell it. The only
                      people who see your job search are you and the recruiters you
                      choose.
                    </p>
                  </div>
                  <div className="flex gap-2.5 flex-wrap items-center">
                    {[
                      {
                        icon: ShieldCheck,
                        label: "Row-level security",
                        color: "#10b981",
                      },
                      { icon: Server, label: "Encrypted at rest", color: null },
                      {
                        icon: Ban,
                        label: "Never used for training",
                        color: null,
                      },
                    ].map(({ icon: Icon, label, color }) => (
                      <div
                        key={label}
                        className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-border text-[12px] text-muted-fg bg-white/[0.03]"
                      >
                        <Icon
                          className="w-3.5 h-3.5"
                          style={color ? { color } : undefined}
                        />
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
              </BentoTile>
            </div>
          </section>
        </ScrollReveal>

        {/* How it works */}
        <ScrollReveal delay={80}>
          <section
            id="how"
            className="pt-[120px] max-w-[1152px] mx-auto px-8"
          >
            <p className="text-[12px] font-semibold text-primary uppercase tracking-[.08em] mb-4">
              How it works
            </p>
            <h2
              className="font-medium tracking-tight leading-[1.1] max-w-[680px]"
              style={{ fontSize: "clamp(28px, 4vw, 44px)" }}
            >
              From keyword to offer in three quiet steps.
            </h2>

            <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  num: "01 / Discover",
                  heading: "Set your keywords.",
                  body: "Add the roles you want — react developer, bookkeeper, virtual assistant. We scan OnlineJobs.ph every morning and queue matches as wishlist applications.",
                },
                {
                  num: "02 / Track",
                  heading: "Drag across the board.",
                  body: "Move every role through wishlist → applied → phone screen → interview → offer. Notes, salary, and source stick to the card.",
                },
                {
                  num: "03 / Show up",
                  heading: "Walk into the interview prepared.",
                  body: "Email nudges 24 hours before each interview — the role, the company, and a link back to your notes. The board updates itself.",
                },
              ].map((step) => (
                <div
                  key={step.num}
                  className="pt-6 border-t border-border"
                >
                  <div className="font-mono text-[11px] text-primary font-medium mb-3">
                    {step.num}
                  </div>
                  <h3 className="text-[16px] font-semibold tracking-[-0.01em] mb-2">
                    {step.heading}
                  </h3>
                  <p className="text-[13px] text-muted-fg leading-[1.5]">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* Quote */}
        <ScrollReveal delay={60}>
          <section className="py-16">
            <div className="max-w-[820px] mx-auto px-8 text-center">
              <blockquote
                className="font-medium tracking-[-0.02em] leading-[1.3] text-balance"
                style={{ fontSize: "clamp(22px, 3vw, 32px)" }}
              >
                &ldquo;Stop losing track of opportunities.
                <br />
                Start landing the role you deserve.&rdquo;
              </blockquote>
              <p className="mt-6 text-[13px] text-muted-fg">&mdash; ApplicantOS</p>
            </div>
          </section>
        </ScrollReveal>

        {/* Final CTA */}
        <ScrollReveal delay={40}>
          <section className="max-w-[1152px] mx-auto px-8 mt-20">
            <div
              className="rounded-[20px] border border-[rgba(255,255,255,0.12)] text-center px-8 py-16"
              style={{
                background: `
                  radial-gradient(ellipse 80% 100% at 50% 0%, rgba(94,106,210,0.25), transparent 70%),
                  linear-gradient(135deg, #0f1011 0%, #0a0b0c 50%, #0f1011 100%)
                `,
                backgroundSize: "200% 200%",
                animation: "cta-bg-drift 12s ease infinite",
                boxShadow:
                  "0 0 0 1px rgba(255,255,255,.05), 0 20px 40px -20px rgba(0,0,0,.6)",
              }}
            >
              <h2
                className="font-medium tracking-[-0.03em] leading-[1.1]"
                style={{ fontSize: "clamp(28px, 4vw, 40px)" }}
              >
                Ready to get organized?
              </h2>
              <p
                className="mt-3 text-muted-fg"
                style={{ fontSize: "15px" }}
              >
                Start tracking your job search in under a minute. Free to use, no
                credit card.
              </p>
              <div className="mt-7 flex gap-2.5 justify-center flex-wrap">
                <Link
                  href="/signup"
                  className="h-11 px-5 rounded-lg bg-primary text-white text-sm font-semibold flex items-center gap-2 transition-colors duration-150 hover:bg-[#6c77d6] relative overflow-hidden group"
                  style={{ boxShadow: "var(--shadow-glow-primary)" }}
                >
                  <span className="btn-shine-inner" aria-hidden />
                  Create free account
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <a
                  href="#features"
                  className="h-11 px-5 rounded-lg text-muted-fg text-sm font-medium flex items-center hover:text-foreground hover:bg-white/[0.05] transition-colors duration-150"
                >
                  See what&apos;s inside
                </a>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Footer */}
        <footer className="mt-20 border-t border-border">
          <div className="max-w-[1152px] mx-auto px-8 py-10 flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-[22px] h-[22px] rounded-[5px] bg-primary flex items-center justify-center">
                <Cpu className="w-3 h-3 text-white" />
              </div>
              <span className="text-[13px] font-semibold">
                Applicant<span className="text-primary">OS</span>
              </span>
            </div>
            <div className="flex items-center gap-6">
              {[
                { label: "Features", href: "#features" },
                { label: "How it works", href: "#how" },
              ].map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="text-[13px] text-muted-fg hover:text-foreground transition-colors duration-150"
                >
                  {label}
                </a>
              ))}
            </div>
            <p className="text-[13px] text-muted-fg">&copy; 2026 ApplicantOS</p>
          </div>
        </footer>
      </div>
    </div>
  )
}

function BentoTile({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-[14px] border border-border p-6 relative overflow-hidden transition-all duration-200 hover:border-[rgba(255,255,255,0.12)] hover:-translate-y-0.5 ${className}`}
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,.02), rgba(255,255,255,0))",
      }}
    >
      {children}
    </div>
  )
}

function TileIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-9 h-9 rounded-lg bg-white/[0.05] flex items-center justify-center text-foreground mb-4">
      {children}
    </div>
  )
}
