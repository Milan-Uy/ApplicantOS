import Link from "next/link"
import {
  Cpu,
  ArrowRight,
  Play,
  Kanban,
  Sparkles,
  Mail,
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
} from "lucide-react"

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
        <header>
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
                className="text-[13px] font-medium text-muted-fg hover:text-foreground transition-colors duration-150"
              >
                Features
              </a>
              <a
                href="#how"
                className="text-[13px] font-medium text-muted-fg hover:text-foreground transition-colors duration-150"
              >
                How it works
              </a>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="h-9 px-4 rounded-lg text-[13px] font-medium text-muted-fg hover:text-foreground hover:bg-white/[0.05] transition-colors duration-150 flex items-center"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="h-9 px-4 rounded-lg bg-primary text-white text-[13px] font-semibold flex items-center transition-colors duration-150 hover:bg-[#6c77d6]"
                style={{ boxShadow: "var(--shadow-glow-primary)" }}
              >
                Get Started
              </Link>
            </div>
          </nav>
        </header>

        {/* Hero */}
        <section className="text-center px-8 pt-20 pb-16 max-w-[1152px] mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-border text-[12px] text-muted-fg mb-6">
            <span className="bg-primary text-white text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide">
              New
            </span>
            AI Resume Optimizer powered by Gemini 2.5
            <ArrowRight className="w-3 h-3" />
          </div>

          <h1
            className="font-medium tracking-[-0.04em] leading-none text-balance mx-auto max-w-[880px]"
            style={{ fontSize: "clamp(40px, 6vw, 76px)" }}
          >
            Land your next role,
            <br />
            <span
              style={{
                background: "linear-gradient(180deg, #f7f8f8 0%, #8a8f98 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              not lost in spreadsheets.
            </span>
          </h1>

          <p
            className="mt-6 mx-auto max-w-[580px] text-muted-fg text-balance"
            style={{ fontSize: "17px", lineHeight: 1.5 }}
          >
            Track every application, optimize your resume with AI, and generate
            tailored cover letters &mdash; all in one place.
          </p>

          <div className="mt-9 flex gap-2.5 justify-center items-center flex-wrap">
            <Link
              href="/signup"
              className="h-11 px-5 rounded-lg bg-primary text-white text-sm font-semibold flex items-center gap-2 transition-colors duration-150 hover:bg-[#6c77d6]"
              style={{ boxShadow: "var(--shadow-glow-primary)" }}
            >
              Get started — it&apos;s free
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/login"
              className="h-11 px-5 rounded-lg bg-[#0f1011] text-foreground text-sm font-medium border border-border flex items-center gap-2 transition-colors duration-150 hover:bg-[#16181a] hover:border-[rgba(255,255,255,0.12)]"
            >
              <Play className="w-3.5 h-3.5" />
              Watch demo
            </Link>
          </div>
        </section>

        {/* Product preview frame */}
        <div className="mt-16 mx-auto max-w-[1100px] px-8 relative">
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
                  ].map((col) => (
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
                        {col.cards.map((card, i) => (
                          <div
                            key={i}
                            className="bg-[#0f1011] border border-border rounded-lg p-2.5"
                            style={{
                              boxShadow: "0 0 0 1px rgba(255,255,255,.04)",
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
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Logos row */}
        <div className="mt-20 mx-auto max-w-[900px] px-8 text-center">
          <p className="text-[11px] uppercase tracking-[.08em] text-muted-fg mb-6">
            Job seekers tracking applications to
          </p>
          <div
            className="flex justify-center gap-14 flex-wrap"
            style={{ opacity: 0.65 }}
          >
            {["Stripe", "Linear", "Vercel", "Figma", "Anthropic", "Notion"].map(
              (name) => (
                <span
                  key={name}
                  className="text-[18px] font-semibold tracking-tight text-muted-fg"
                >
                  {name}
                </span>
              )
            )}
          </div>
        </div>

        {/* Bento features */}
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
            ApplicantOS keeps every application, resume, and AI-generated draft
            in one place &mdash; quietly organized.
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
                  { label: "Active", value: "12", color: "#f7f8f8" },
                  {
                    label: "Response rate",
                    value: "34%",
                    color: "#5e6ad2",
                  },
                  { label: "Interviews", value: "3", color: "#fb923c" },
                  { label: "Offers", value: "2", color: "#10b981" },
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
                      {s.value}
                    </div>
                  </div>
                ))}
              </div>
            </BentoTile>

            {/* Tile 2 — AI Resume Optimizer */}
            <BentoTile className="col-span-3">
              <TileIcon>
                <Sparkles className="w-[18px] h-[18px] text-[#7170ff]" />
              </TileIcon>
              <h3 className="text-[16px] font-semibold tracking-[-0.01em] mb-1.5">
                AI Resume Optimizer
              </h3>
              <p className="text-[13px] text-muted-fg leading-[1.5]">
                Match score, missing keywords, AI-rewritten bullets &mdash;
                tailored to each job description.
              </p>
              <div className="mt-5 flex items-baseline gap-3">
                <span
                  className="font-medium tabular-nums leading-none"
                  style={{ fontSize: "56px" }}
                >
                  87
                </span>
                <span className="text-[12px] font-semibold text-[#10b981] px-2 py-0.5 rounded-md bg-[rgba(16,185,129,0.1)]">
                  +12
                </span>
                <span className="text-[11px] text-muted-fg uppercase tracking-[.08em] ml-auto">
                  Match Score
                </span>
              </div>
              <div className="mt-3.5 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: "87%",
                    background: "linear-gradient(90deg, #5e6ad2, #7170ff)",
                  }}
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {[
                  { label: "React", match: true },
                  { label: "TypeScript", match: true },
                  { label: "Design Systems", match: true },
                  { label: "Storybook", match: false },
                  { label: "A11y", match: false },
                ].map((kw) => (
                  <span
                    key={kw.label}
                    className="font-mono text-[11px] px-2.5 py-0.5 rounded-md border"
                    style={
                      kw.match
                        ? {
                            color: "#10b981",
                            borderColor: "rgba(16,185,129,0.25)",
                            background: "rgba(16,185,129,0.06)",
                          }
                        : {
                            color: "#fb923c",
                            borderColor: "rgba(251,146,60,0.25)",
                            background: "rgba(251,146,60,0.06)",
                          }
                    }
                  >
                    {!kw.match && "+ "}
                    {kw.label}
                  </span>
                ))}
              </div>
            </BentoTile>

            {/* Tile 3 — Cover letters */}
            <BentoTile className="col-span-3">
              <TileIcon>
                <Mail className="w-[18px] h-[18px]" />
              </TileIcon>
              <h3 className="text-[16px] font-semibold tracking-[-0.01em] mb-1.5">
                Tailored cover letters
              </h3>
              <p className="text-[13px] text-muted-fg leading-[1.5]">
                Generate role-specific cover letters from your resume and the
                job post in seconds &mdash; never start from a blank page again.
              </p>
              <div
                className="mt-4 p-3.5 rounded-lg border border-border text-[11px] leading-[1.55] text-muted-fg"
                style={{ background: "#0a0b0c" }}
              >
                <strong className="text-foreground font-semibold">
                  Dear Linear team,
                </strong>
                <br />
                I&apos;ve spent the last four years designing the interfaces a
                small team uses every day &mdash; the kind of dense, opinionated
                tooling Linear is known for. Working on developer experience at
                Vercel taught me how to balance density with restraint
                <span
                  className="inline-block w-1.5 h-3 bg-primary align-text-bottom ml-0.5"
                  style={{ animation: "blink 1s steps(2) infinite" }}
                />
              </div>
            </BentoTile>

            {/* Tile 4 — Resume library */}
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

            {/* Tile 5 — Interview reminders */}
            <BentoTile className="col-span-3">
              <TileIcon>
                <Bell className="w-[18px] h-[18px]" />
              </TileIcon>
              <h3 className="text-[16px] font-semibold tracking-[-0.01em] mb-1.5">
                Interview reminders, not anxiety
              </h3>
              <p className="text-[13px] text-muted-fg leading-[1.5]">
                Quiet email nudges 24 hours before an interview, with the role,
                the company, and a link straight back to your notes.
              </p>
              <div
                className="mt-4 p-3 rounded-lg border border-border flex items-center gap-2.5"
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
                <div>
                  <div className="text-[12px] font-medium">
                    Linear &middot; Sr. Product Designer
                  </div>
                  <div className="text-[11px] text-muted-fg">
                    Tomorrow at 10:00 AM &middot; 30 min &middot; Notes ready
                  </div>
                </div>
              </div>
            </BentoTile>

            {/* Tile 6 — Privacy (full width) */}
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

        {/* How it works */}
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
            From job post to &ldquo;I got the offer&rdquo; in three steps.
          </h2>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                num: "01 / Add",
                heading: "Paste the job link.",
                body: "Drop the URL or fill in role, company, and salary. ApplicantOS pulls in the rest. Drag it across your board as the conversation moves.",
              },
              {
                num: "02 / Optimize",
                heading: "Let the AI tailor.",
                body: "Pick a resume from your library. Get a match score, the keywords you're missing, and rewritten bullets — specific to that company.",
              },
              {
                num: "03 / Send",
                heading: "Generate, review, ship.",
                body: "A cover letter that doesn't sound like a cover letter, in seconds. Edit, export to PDF, send. The board updates itself.",
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

        {/* Quote */}
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

        {/* Final CTA */}
        <section className="max-w-[1152px] mx-auto px-8 mt-20">
          <div
            className="rounded-[20px] border border-[rgba(255,255,255,0.12)] text-center px-8 py-16"
            style={{
              background: `
                radial-gradient(ellipse 80% 100% at 50% 0%, rgba(94,106,210,0.25), transparent 70%),
                linear-gradient(180deg, #0f1011 0%, #0a0b0c 100%)
              `,
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
                className="h-11 px-5 rounded-lg bg-primary text-white text-sm font-semibold flex items-center gap-2 transition-colors duration-150 hover:bg-[#6c77d6]"
                style={{ boxShadow: "var(--shadow-glow-primary)" }}
              >
                Create free account
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/login"
                className="h-11 px-5 rounded-lg text-muted-fg text-sm font-medium flex items-center hover:text-foreground hover:bg-white/[0.05] transition-colors duration-150"
              >
                View live demo
              </Link>
            </div>
          </div>
        </section>

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
              {["Features", "Pricing", "Changelog", "Privacy", "Terms"].map(
                (link) => (
                  <a
                    key={link}
                    href="#"
                    className="text-[13px] text-muted-fg hover:text-foreground transition-colors duration-150"
                  >
                    {link}
                  </a>
                )
              )}
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
      className={`rounded-[14px] border border-border p-6 relative overflow-hidden transition-[border-color] duration-200 hover:border-[rgba(255,255,255,0.12)] ${className}`}
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
