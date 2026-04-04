import Link from "next/link"
import { Kanban, FileText, Sparkles, Mail } from "lucide-react"

const features = [
  {
    icon: Kanban,
    title: "Application Tracker",
    description:
      "Organize every application with a drag-and-drop Kanban board and list view.",
  },
  {
    icon: FileText,
    title: "Resume Library",
    description:
      "Upload and manage multiple resume versions — pick the right one for each role.",
  },
  {
    icon: Sparkles,
    title: "AI Resume Optimizer",
    description:
      "Get a match score, missing keywords, and AI-rewritten bullet points tailored to the job.",
  },
  {
    icon: Mail,
    title: "AI Cover Letters",
    description:
      "Generate tailored cover letters from your resume and the job description in seconds.",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <span className="text-lg font-bold tracking-tight text-primary">
          ApplicantOS
        </span>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="px-4 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 rounded-lg bg-primary text-primary-fg text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 pt-24 pb-16 max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-balance">
          Land your next role,
          <br className="hidden sm:block" /> not lost in spreadsheets
        </h1>
        <p className="mt-4 text-lg text-muted-fg max-w-xl text-balance">
          Track every application, optimize your resume with AI, and generate
          tailored cover letters — all in one place.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/signup"
            className="px-6 py-3 rounded-lg bg-primary text-primary-fg text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Get Started — it&apos;s free
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-24 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-lg border border-border bg-card p-6 shadow-card"
            >
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mb-3">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-card-fg">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-fg">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer */}
      <section className="border-t border-border px-6 py-16 text-center">
        <h2 className="text-2xl font-bold">Ready to get organized?</h2>
        <p className="mt-2 text-muted-fg">
          Start tracking your job search in under a minute.
        </p>
        <Link
          href="/signup"
          className="inline-block mt-6 px-6 py-3 rounded-lg bg-primary text-primary-fg text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Create free account
        </Link>
      </section>
    </div>
  )
}
