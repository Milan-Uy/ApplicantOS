"use client"

import Link from "next/link"
import { useActionState } from "react"
import { Cpu, ArrowRight } from "lucide-react"
import { signUp, signInWithGoogle } from "../actions"

const QUOTE = "Your AI-powered command center for the job search."
const WORDS = QUOTE.split(" ")

const FLOAT_CARDS = [
  {
    role: "Product Designer",
    co: "Stripe",
    meta: "$190k–$240k",
    metaColor: "#10b981",
    rotate: "3deg",
    top: "20%",
    right: "6%",
    delay: "0ms",
    driftDelay: "0ms",
  },
  {
    role: "Staff Designer",
    co: "Figma",
    meta: "Interview: May 3",
    metaColor: "#fb923c",
    rotate: "1deg",
    top: "46%",
    right: "16%",
    delay: "150ms",
    driftDelay: "2000ms",
  },
  {
    role: "Frontend Engineer",
    co: "Vercel",
    meta: "$170k–$210k",
    metaColor: "#10b981",
    rotate: "-2deg",
    top: "68%",
    right: "4%",
    delay: "300ms",
    driftDelay: "4000ms",
  },
]

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error: string } | null, formData: FormData) => {
      const result = await signUp(formData)
      return result ?? null
    },
    null
  )
  return (
    <div className="min-h-dvh flex">
      {/* Left brand panel — desktop only */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 p-12 text-white relative overflow-hidden"
        style={{ background: "#0f1011" }}
      >
        {/* Ambient glow layers */}
        <div
          aria-hidden
          className="absolute pointer-events-none rounded-full"
          style={{
            width: "500px",
            height: "500px",
            top: "25%",
            left: "50%",
            background: "radial-gradient(circle, rgba(94,106,210,0.35) 0%, transparent 70%)",
            animation: "brand-glow-1 18s ease-in-out infinite",
          }}
        />
        <div
          aria-hidden
          className="absolute pointer-events-none rounded-full"
          style={{
            width: "380px",
            height: "380px",
            top: "55%",
            left: "20%",
            background: "radial-gradient(circle, rgba(113,112,255,0.2) 0%, transparent 70%)",
            animation: "brand-glow-2 22s ease-in-out infinite",
          }}
        />
        {/* Grid overlay */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Floating kanban cards */}
        {FLOAT_CARDS.map((card, i) => (
          <div
            key={i}
            aria-hidden
            className="absolute w-[180px] bg-[#16181a] border border-[rgba(255,255,255,0.1)] rounded-xl p-3 pointer-events-none"
            style={{
              top: card.top,
              right: card.right,
              ["--card-rotate" as string]: card.rotate,
              boxShadow: "0 8px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)",
              animation: `float-in 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${card.delay} both, float-drift 8s ease-in-out ${card.driftDelay} infinite`,
            }}
          >
            <div className="text-[11px] font-semibold text-white/90">{card.role}</div>
            <div className="text-[10px] text-white/40 mt-0.5">{card.co}</div>
            <div className="text-[10px] font-medium mt-1.5" style={{ color: card.metaColor }}>
              {card.meta}
            </div>
          </div>
        ))}

        {/* Brand lockup */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center"
            style={{
              background: "#5e6ad2",
              boxShadow: "0 0 20px rgba(94,106,210,0.5)",
            }}
          >
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight">ApplicantOS</span>
          <span
            className="w-1.5 h-1.5 rounded-full bg-[#5e6ad2] ml-1"
            style={{ animation: "dot-pulse 2.4s ease-in-out infinite" }}
          />
        </div>

        {/* Quote */}
        <div className="relative z-10">
          <blockquote className="text-2xl font-semibold leading-snug text-white/90">
            &ldquo;
            {WORDS.map((word, i) => (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  animation: `word-in 0.5s ease ${i * 60}ms both`,
                }}
              >
                {word}&nbsp;
              </span>
            ))}
            &rdquo;
          </blockquote>
          <p className="mt-4 text-sm text-white/50">Track, optimize, and land your next role</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div
            className="flex items-center gap-2 mb-8 lg:hidden"
            style={{ animation: "hero-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) 200ms both" }}
          >
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <Cpu className="w-4 h-4 text-primary-fg" />
            </div>
            <span className="text-base font-semibold">
              Applicant<span className="text-primary">OS</span>
            </span>
          </div>

          <h1
            className="text-2xl font-bold text-foreground"
            style={{ animation: "hero-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) 200ms both" }}
          >
            Create your account
          </h1>
          <p
            className="mt-1 text-sm text-muted-fg"
            style={{ animation: "hero-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) 300ms both" }}
          >
            Start tracking your job search
          </p>

          {state?.error && (
            <div className="mt-4 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
              {state.error}
            </div>
          )}

          <form action={formAction} className="mt-8 flex flex-col gap-4">
            <div
              className="flex flex-col gap-1.5"
              style={{ animation: "hero-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) 350ms both" }}
            >
              <label htmlFor="name" className="text-sm font-medium text-foreground">
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                placeholder="Jane Doe"
                className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-fg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
              />
            </div>
            <div
              className="flex flex-col gap-1.5"
              style={{ animation: "hero-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) 430ms both" }}
            >
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-fg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
              />
            </div>
            <div
              className="flex flex-col gap-1.5"
              style={{ animation: "hero-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) 510ms both" }}
            >
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                placeholder="••••••••"
                className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-fg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
              />
            </div>
            <div
              style={{ animation: "hero-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) 590ms both" }}
            >
              <button
                type="submit"
                disabled={pending}
                className="h-10 w-full rounded-lg bg-primary text-primary-fg text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all duration-150 cursor-pointer disabled:opacity-70 disabled:cursor-default relative overflow-hidden group flex items-center justify-center gap-2"
                style={{ animation: "cta-glow 3.2s ease-in-out infinite" }}
              >
                <span className="btn-shine-inner" aria-hidden />
                {pending ? (
                  <>
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden
                      style={{ animation: "spin 0.7s linear infinite" }}
                    >
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-150" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div
            className="relative my-6"
            style={{ animation: "hero-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) 640ms both" }}
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs text-muted-fg">
              <span className="bg-background px-2">or continue with</span>
            </div>
          </div>

          {/* Google OAuth */}
          <div
            style={{ animation: "hero-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) 700ms both" }}
          >
            <form action={signInWithGoogle}>
              <button
                type="submit"
                className="h-10 w-full rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:bg-muted transition-colors duration-150 cursor-pointer flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </button>
            </form>
          </div>

          <p
            className="mt-6 text-center text-sm text-muted-fg"
            style={{ animation: "hero-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) 740ms both" }}
          >
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
