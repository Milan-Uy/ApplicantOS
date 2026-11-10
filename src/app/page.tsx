import Link from "next/link"
import { ArrowRight, ChevronDown, Cpu } from "lucide-react"
import { Features } from "@/components/landing/Features"
import { ProductPreview } from "@/components/landing/ProductPreview"
import { ScrollReveal } from "@/components/landing/ScrollReveal"
import { TryDemoButton } from "@/components/landing/TryDemoButton"

const STEPS = [
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
]

const FOOTER_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
]

const primaryCta =
  "group relative flex items-center gap-2 overflow-hidden rounded-lg bg-primary font-semibold text-primary-fg shadow-glow-primary transition-colors duration-150 hover:bg-primary-hover"

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* Fixed ambient background — the hero glow, one of the page's two looping animations */}
      <div
        aria-hidden
        className="bg-landing-ambient pointer-events-none fixed inset-0 z-0 animate-[ambient-breathe_14s_ease-in-out_infinite]"
      />
      <div aria-hidden className="bg-landing-grid pointer-events-none fixed inset-0 z-0 opacity-40" />

      {/* All page content sits above the fixed bg */}
      <div className="relative z-10">
        <header className="animate-[nav-in_0.6s_var(--ease-out)_both]">
          <nav className="mx-auto flex h-16 max-w-[1152px] items-center justify-between px-4 sm:px-8">
            <Link href="/" className="flex items-center gap-2.5 no-underline">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-primary">
                <Cpu className="h-4 w-4 text-primary-fg" />
              </div>
              <span className="text-[15px] font-bold tracking-[-0.01em] text-foreground">
                Applicant<span className="text-accent">OS</span>
              </span>
            </Link>

            <div className="hidden items-center gap-7 md:flex">
              <a href="#features" className="nav-link text-[13px] font-medium text-muted-fg transition-colors duration-150 hover:text-foreground">
                Features
              </a>
              <a href="#how" className="nav-link text-[13px] font-medium text-muted-fg transition-colors duration-150 hover:text-foreground">
                How it works
              </a>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="nav-link flex h-9 items-center rounded-lg px-3 text-[13px] font-medium text-muted-fg transition-colors duration-150 hover:bg-white/[0.05] hover:text-foreground sm:px-4"
              >
                Sign in
              </Link>
              <Link href="/signup" className={`${primaryCta} h-9 px-3 text-[13px] sm:px-4`}>
                <span className="btn-shine-inner" aria-hidden />
                Get Started
              </Link>
            </div>
          </nav>
        </header>

        {/* Hero */}
        <section className="mx-auto max-w-[1152px] px-4 pb-16 pt-20 text-center sm:px-8">
          <div className="mb-6 inline-flex animate-[hero-in_0.6s_var(--ease-out)_80ms_both] items-center gap-2 rounded-full border border-border bg-white/[0.04] px-3 py-1 text-[12px] text-muted-fg">
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-fg">
              New
            </span>
            Job Discovery &mdash; auto-find roles on OnlineJobs.ph
            <ArrowRight className="h-3 w-3 flex-shrink-0" />
          </div>

          <h1 className="mx-auto max-w-[880px] animate-[hero-in_0.6s_var(--ease-out)_200ms_both] text-balance text-[length:clamp(40px,6vw,76px)] font-medium leading-none tracking-[-0.04em]">
            Land your next role,
            <br />
            <span className="bg-[linear-gradient(135deg,#f7f8f8_0%,#a5acf0_40%,#8a8f98_100%)] bg-[length:200%_200%] bg-clip-text text-transparent">
              not lost in spreadsheets.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-[580px] animate-[hero-in_0.6s_var(--ease-out)_380ms_both] text-balance text-[17px] leading-normal text-muted-fg">
            Auto-discover roles, track every application across the pipeline, and never miss an interview &mdash; all in one
            quiet workspace.
          </p>

          <div className="mt-9 flex animate-[hero-in_0.6s_var(--ease-out)_520ms_both] flex-wrap items-start justify-center gap-2.5">
            <Link href="/signup" className={`${primaryCta} h-11 px-5 text-sm`}>
              <span className="btn-shine-inner" aria-hidden />
              Get started &mdash; it&apos;s free
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <TryDemoButton />
            <a
              href="#features"
              className="flex h-11 items-center gap-2 rounded-lg border border-border bg-card px-5 text-sm font-medium text-foreground transition-colors duration-150 hover:border-border-strong hover:bg-surface-2"
            >
              Browse features
              <ChevronDown className="h-3.5 w-3.5" />
            </a>
          </div>
        </section>

        <ProductPreview />

        <Features />

        {/* How it works */}
        <ScrollReveal delay={80}>
          <section id="how" className="mx-auto max-w-[1152px] px-4 pt-[120px] sm:px-8">
            <p className="mb-4 text-[12px] font-semibold uppercase tracking-[.08em] text-accent">How it works</p>
            <h2 className="max-w-[680px] text-[length:clamp(28px,4vw,44px)] font-medium leading-[1.1] tracking-tight">
              From keyword to offer in three quiet steps.
            </h2>

            <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
              {STEPS.map((step) => (
                <div key={step.num} className="border-t border-border pt-6">
                  <div className="mb-3 font-mono text-[11px] font-medium text-accent">{step.num}</div>
                  <h3 className="mb-2 text-[16px] font-semibold tracking-[-0.01em]">{step.heading}</h3>
                  <p className="text-[13px] leading-[1.5] text-muted-fg">{step.body}</p>
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* Quote */}
        <ScrollReveal delay={60}>
          <section className="py-16">
            <div className="mx-auto max-w-[820px] px-4 text-center sm:px-8">
              <blockquote className="text-balance text-[length:clamp(22px,3vw,32px)] font-medium leading-[1.3] tracking-[-0.02em]">
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
          <section className="mx-auto mt-20 max-w-[1152px] px-4 sm:px-8">
            <div className="bg-landing-cta rounded-[20px] border border-border-strong px-6 py-16 text-center shadow-[0_0_0_1px_rgba(255,255,255,.05),0_20px_40px_-20px_rgba(0,0,0,.6)] sm:px-8">
              <h2 className="text-[length:clamp(28px,4vw,40px)] font-medium leading-[1.1] tracking-[-0.03em]">
                Ready to get organized?
              </h2>
              <p className="mt-3 text-[15px] text-muted-fg">
                Start tracking your job search in under a minute. Free to use, no credit card.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-2.5">
                <Link href="/signup" className={`${primaryCta} h-11 px-5 text-sm`}>
                  <span className="btn-shine-inner" aria-hidden />
                  Create free account
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <a
                  href="#features"
                  className="flex h-11 items-center rounded-lg px-5 text-sm font-medium text-muted-fg transition-colors duration-150 hover:bg-white/[0.05] hover:text-foreground"
                >
                  See what&apos;s inside
                </a>
              </div>
            </div>
          </section>
        </ScrollReveal>

        <footer className="mt-20 border-t border-border">
          <div className="mx-auto flex max-w-[1152px] flex-wrap items-center justify-between gap-4 px-4 py-10 sm:px-8">
            <div className="flex items-center gap-2.5">
              <div className="flex h-[22px] w-[22px] items-center justify-center rounded-[5px] bg-primary">
                <Cpu className="h-3 w-3 text-primary-fg" />
              </div>
              <span className="text-[13px] font-semibold">
                Applicant<span className="text-accent">OS</span>
              </span>
            </div>
            <div className="flex items-center gap-6">
              {FOOTER_LINKS.map(({ label, href }) => (
                <a key={label} href={href} className="text-[13px] text-muted-fg transition-colors duration-150 hover:text-foreground">
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
