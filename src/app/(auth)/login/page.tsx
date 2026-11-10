"use client"

import Link from "next/link"
import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { Cpu, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { AuthError, AuthHeading, GoogleSignIn } from "../auth-ui"

const QUOTE = "Stop losing track of opportunities. Start landing the role you deserve."
const WORDS = QUOTE.split(" ")

const FLOAT_CARDS = [
  {
    role: "Sr. Product Designer",
    co: "Linear",
    meta: "$160k–$210k",
    metaColor: "#10b981",
    rotate: "-3deg",
    top: "22%",
    right: "8%",
    delay: "0ms",
    driftDelay: "0ms",
  },
  {
    role: "Design Engineer",
    co: "Vercel",
    meta: "Interview: May 1",
    metaColor: "#fb923c",
    rotate: "-1deg",
    top: "48%",
    right: "18%",
    delay: "150ms",
    driftDelay: "1800ms",
  },
  {
    role: "Frontend Engineer",
    co: "Ramp",
    meta: "$170k–$210k",
    metaColor: "#10b981",
    rotate: "2deg",
    top: "68%",
    right: "6%",
    delay: "300ms",
    driftDelay: "3600ms",
  },
]

export default function LoginPage() {
  const router = useRouter()
  // Sign in from the browser, not a server action: Supabase rate-limits sign-ins per client IP,
  // and from the server every visitor would share one IP (and one lockout).
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; redirecting?: boolean } | null, formData: FormData) => {
      const { error } = await createClient().auth.signInWithPassword({
        email: formData.get("email") as string,
        password: formData.get("password") as string,
      })
      if (error) return { error: error.message }
      router.push("/dashboard")
      return { redirecting: true }
    },
    null
  )
  const busy = pending || !!state?.redirecting

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
            top: "30%",
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
            top: "60%",
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
            <div className="text-[10px] text-white/60 mt-0.5">{card.co}</div>
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
          <p className="mt-4 text-sm text-white/50">AI-powered job application tracking</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm">
          <AuthHeading title="Welcome back" subtitle="Sign in to your account" />

          {state?.error && <AuthError message={state.error} />}

          <form action={formAction} className="mt-8 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" className="h-10" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" autoComplete="current-password" required placeholder="••••••••" className="h-10" />
            </div>
            <Button type="submit" disabled={busy} className="h-10 w-full font-semibold">
              {busy ? <Loader2 className="animate-spin" aria-hidden /> : null}
              {busy ? "Signing in…" : "Sign in"}
              {busy ? null : <ArrowRight aria-hidden />}
            </Button>
          </form>

          <GoogleSignIn />

          <p className="mt-6 text-center text-sm text-muted-fg">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-accent font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
