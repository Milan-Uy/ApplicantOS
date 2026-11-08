import type {
  ApplicationSource,
  ApplicationStatus,
  CoverLetterResult,
  ResumeOptimizeResult,
} from "@/types/database"

// Dates are day offsets from reset time, never absolute, so the demo never goes stale.
export interface SeedApplication {
  company: string
  role: string
  status: ApplicationStatus
  source: ApplicationSource
  location?: string
  url?: string
  salary_min?: number
  salary_max?: number
  salary_currency?: "USD" | "PHP"
  salary_period?: "monthly" | "hourly"
  job_description?: string
  notes?: string
  contact_name?: string
  contact_email?: string
  auto_discovered?: boolean
  appliedDaysAgo?: number
  createdDaysAgo: number
  interviewInDays?: number
}

export interface SeedResume {
  label: string
  filename: string
  extracted_text: string
}

export const SEED_HERO_APP = {
  company: "Linear",
  role: "Product Engineer",
  status: "applied",
} as const satisfies Pick<SeedApplication, "company" | "role" | "status">

const LINEAR_JD = `Linear is building the issue tracker that modern software teams love to use. We are looking for a Product Engineer who cares deeply about craft and speed.

What you'll do
- Own features end to end, from the first sketch to the release note.
- Build fast, polished interfaces in React and TypeScript, backed by a real-time sync engine.
- Work with GraphQL APIs and PostgreSQL, and keep p95 interactions under 100 ms.
- Partner with design to ship keyboard-first workflows, and write the docs for them.

What we look for
- 4+ years building production web applications with React, TypeScript and Node.js.
- A sharp eye for UI detail: motion, typography, empty and error states.
- Experience with performance profiling, accessibility (WCAG 2.1 AA) and design systems.
- Comfortable working asynchronously in a remote, writing-heavy team.

Nice to have: experience with offline-first sync, Electron, or developer tooling.`

export const SEED_APPLICATIONS: SeedApplication[] = [
  {
    ...SEED_HERO_APP,
    source: "company_site",
    location: "Remote",
    url: "https://linear.app/careers",
    salary_min: 140000,
    salary_max: 180000,
    salary_currency: "USD",
    job_description: LINEAR_JD,
    notes: "Referred to the careers page by a former colleague. Emphasise the kanban drag-and-drop work.",
    appliedDaysAgo: 3,
    createdDaysAgo: 5,
  },
  {
    company: "Vercel",
    role: "Frontend Engineer, Dashboard",
    status: "applied",
    source: "linkedin",
    location: "Remote (APAC)",
    url: "https://vercel.com/careers",
    salary_min: 9000,
    salary_max: 12000,
    salary_currency: "USD",
    salary_period: "monthly",
    job_description: "Build the Vercel dashboard with Next.js App Router, React Server Components and a design system used by millions of developers.",
    appliedDaysAgo: 6,
    createdDaysAgo: 7,
  },
  {
    company: "Supabase",
    role: "Developer Experience Engineer",
    status: "phone_screen",
    source: "referral",
    location: "Remote",
    contact_name: "Jamie Cruz",
    contact_email: "jamie@example.com",
    job_description: "Improve the Supabase developer experience across docs, client libraries and the dashboard. TypeScript, Postgres and a love for writing.",
    notes: "Phone screen went well; next step is a take-home.",
    appliedDaysAgo: 12,
    createdDaysAgo: 14,
  },
  {
    company: "Stripe",
    role: "Software Engineer, Payments UI",
    status: "interview",
    source: "company_site",
    location: "Singapore (hybrid)",
    salary_min: 150000,
    salary_max: 200000,
    salary_currency: "USD",
    job_description: "Design and build the payment interfaces merchants embed on their sites. React, TypeScript, accessibility and rigorous testing.",
    notes: "Onsite loop: system design, frontend pairing, values.",
    appliedDaysAgo: 18,
    createdDaysAgo: 20,
    interviewInDays: 2,
  },
  {
    company: "Canva",
    role: "Senior Frontend Engineer",
    status: "offer",
    source: "linkedin",
    location: "Manila (hybrid)",
    salary_min: 250000,
    salary_max: 300000,
    salary_currency: "PHP",
    salary_period: "monthly",
    job_description: "Build collaborative editing features in Canva's editor. React, TypeScript, WebGL and performance at scale.",
    notes: "Offer received; deadline to respond in one week.",
    appliedDaysAgo: 30,
    createdDaysAgo: 32,
  },
  {
    company: "Atlassian",
    role: "Frontend Engineer, Jira",
    status: "rejected",
    source: "indeed",
    location: "Remote",
    job_description: "Ship features across Jira's web app using React, TypeScript and GraphQL.",
    notes: "Rejected after the technical round. Feedback: go deeper on state management trade-offs.",
    appliedDaysAgo: 25,
    createdDaysAgo: 27,
  },
  {
    company: "Raycast",
    role: "Full-Stack Engineer",
    status: "wishlist",
    source: "company_site",
    location: "Remote (EU/APAC)",
    url: "https://www.raycast.com/careers",
    job_description: "Build the Raycast store and backend services. TypeScript, React, Node.js and Swift interop.",
    createdDaysAgo: 2,
  },
  {
    company: "Remote Staffing Co.",
    role: "React Developer (Full-time, Remote)",
    status: "wishlist",
    source: "online_jobs_ph",
    location: "Remote (Philippines)",
    url: "https://www.onlinejobs.ph/jobseekers/job/demo-react-developer",
    salary_min: 80000,
    salary_max: 110000,
    salary_currency: "PHP",
    salary_period: "monthly",
    job_description: "Build and maintain React and Next.js client projects. Tailwind CSS, REST APIs, Git.",
    auto_discovered: true,
    createdDaysAgo: 1,
  },
  {
    company: "BrightPath Digital",
    role: "Next.js Frontend Developer",
    status: "wishlist",
    source: "online_jobs_ph",
    location: "Remote (Philippines)",
    url: "https://www.onlinejobs.ph/jobseekers/job/demo-nextjs-frontend",
    salary_min: 1200,
    salary_max: 1800,
    salary_currency: "USD",
    salary_period: "monthly",
    job_description: "Own the marketing site and customer portal built with Next.js App Router and TypeScript.",
    auto_discovered: true,
    createdDaysAgo: 2,
  },
  {
    company: "Northwind Labs",
    role: "TypeScript Engineer",
    status: "wishlist",
    source: "online_jobs_ph",
    location: "Remote (Philippines)",
    url: "https://www.onlinejobs.ph/jobseekers/job/demo-typescript-engineer",
    salary_min: 15,
    salary_max: 22,
    salary_currency: "USD",
    salary_period: "hourly",
    job_description: "Build internal tools with TypeScript, Node.js and PostgreSQL. Supabase experience is a plus.",
    auto_discovered: true,
    createdDaysAgo: 4,
  },
  {
    company: "Kalye Commerce",
    role: "Full-Stack Developer (React + Node)",
    status: "wishlist",
    source: "online_jobs_ph",
    location: "Remote (Philippines)",
    url: "https://www.onlinejobs.ph/jobseekers/job/demo-fullstack-react-node",
    salary_min: 90000,
    salary_max: 120000,
    salary_currency: "PHP",
    salary_period: "monthly",
    job_description: "Build e-commerce features end to end: React storefront, Node.js APIs, payments integrations.",
    auto_discovered: true,
    createdDaysAgo: 6,
  },
]

const FRONTEND_RESUME = `ALEX REYES
Frontend Engineer · Manila, Philippines · alex.reyes@example.com · github.com/alexreyes-demo

SUMMARY
Frontend engineer with five years of experience building fast, accessible web applications in React and TypeScript. I care about interface craft, performance budgets and shipping small increments that users notice.

EXPERIENCE

Senior Frontend Engineer, Tala (Remote) — 2022 to present
- Led the rebuild of the loan application flow in Next.js and TypeScript, cutting time-to-interactive from 4.1 s to 1.6 s on mid-range Android devices.
- Built a component library of 40+ accessible primitives on Radix UI, adopted by four product teams.
- Introduced Playwright end-to-end tests and visual regression checks, reducing production UI regressions by roughly 60%.
- Mentored three junior engineers through code review and weekly pairing sessions.

Frontend Engineer, Kumu (Manila) — 2020 to 2022
- Shipped real-time chat and gifting features for a live-streaming app with 10M+ users using React, WebSockets and Redux Toolkit.
- Profiled and fixed render bottlenecks in the stream viewer, raising frame rate on low-end devices from 30 to 55 fps.
- Worked with design to define motion and typography tokens for the web app.

Junior Web Developer, Freelance — 2019 to 2020
- Built marketing sites and small dashboards for local businesses with React, Node.js and PostgreSQL.

PROJECTS
ApplicantOS — AI-powered job application tracker. Next.js App Router, Supabase, Vercel AI SDK, drag-and-drop kanban, resume optimisation and streamed cover letters.

SKILLS
React, Next.js, TypeScript, JavaScript, Tailwind CSS, Radix UI, Node.js, PostgreSQL, Supabase, GraphQL, Playwright, Vitest, Web performance, Accessibility (WCAG 2.1), Figma.

EDUCATION
BS Computer Science, University of the Philippines Diliman — 2019`

const FULLSTACK_RESUME = `ALEX REYES
Full-Stack Engineer · Manila, Philippines · alex.reyes@example.com · linkedin.com/in/alexreyes-demo

SUMMARY
Full-stack engineer who ships product features end to end with TypeScript, React and Node.js on PostgreSQL. Comfortable owning a feature from database schema to release note, and at home in remote, writing-first teams.

EXPERIENCE

Senior Frontend Engineer, Tala (Remote) — 2022 to present
- Designed the API contract and Postgres schema for a new repayment reminders service, then built its Node.js workers and the React settings UI.
- Moved feature flags from a homegrown table to a typed SDK, removing 3,000 lines of conditional code.
- Ran the on-call rotation for the web platform; wrote runbooks that cut mean time to recovery in half.

Frontend Engineer, Kumu (Manila) — 2020 to 2022
- Built a moderation dashboard in React backed by a Node.js and Redis queue, handling 50k reports a day.
- Added structured logging and tracing to the web gateway, making slow requests diagnosable in minutes instead of hours.

Junior Web Developer, Freelance — 2019 to 2020
- Delivered booking and inventory systems for small businesses with Express, PostgreSQL and React.

PROJECTS
ApplicantOS — Next.js and Supabase job tracker with row-level security, server actions, scheduled jobs and AI features on Gemini.

SKILLS
TypeScript, Node.js, React, Next.js, PostgreSQL, Supabase, Redis, REST and GraphQL API design, AWS, Docker, CI/CD with GitHub Actions, Playwright, observability.

EDUCATION
BS Computer Science, University of the Philippines Diliman — 2019`

export const SEED_RESUMES: SeedResume[] = [
  { label: "Frontend focus", filename: "alex-reyes-frontend.pdf", extracted_text: FRONTEND_RESUME },
  { label: "Full-stack focus", filename: "alex-reyes-fullstack.pdf", extracted_text: FULLSTACK_RESUME },
]

const RESUME_OPTIMIZE: ResumeOptimizeResult = {
  matchScore: 78,
  missingKeywords: ["GraphQL", "real-time sync", "keyboard-first", "offline-first"],
  suggestions: [
    {
      original: "Led the rebuild of the loan application flow in Next.js and TypeScript, cutting time-to-interactive from 4.1 s to 1.6 s on mid-range Android devices.",
      rewritten: "Owned the loan application flow end to end in Next.js and TypeScript, cutting time-to-interactive from 4.1 s to 1.6 s and keeping p95 interactions under 100 ms.",
      reason: "Mirrors the role's end-to-end ownership and its explicit p95 latency target.",
    },
    {
      original: "Built a component library of 40+ accessible primitives on Radix UI, adopted by four product teams.",
      rewritten: "Built a WCAG 2.1 AA design system of 40+ keyboard-first primitives on Radix UI, adopted by four product teams.",
      reason: "Adds the accessibility standard and keyboard-first language the posting calls out.",
    },
    {
      original: "Shipped real-time chat and gifting features for a live-streaming app with 10M+ users using React, WebSockets and Redux Toolkit.",
      rewritten: "Shipped real-time sync for chat and gifting to 10M+ users with React and WebSockets, handling reconnects and optimistic updates.",
      reason: "Connects your WebSocket work to the real-time sync engine in the job description.",
    },
  ],
  summary: "Strong match on React, TypeScript, performance and design-system work. Close the gap by naming real-time sync and GraphQL experience explicitly and framing achievements as end-to-end ownership.",
}

const COVER_LETTER: CoverLetterResult = {
  coverLetter: `Dear Linear team,

I have used Linear every day for the last two years, and the thing that keeps me there is speed: every interaction feels instant. I would love to help build that feeling as your next Product Engineer.

At Tala I owned our loan application flow end to end, from the first sketch with design to the release note. Rebuilding it in Next.js and TypeScript cut time-to-interactive from 4.1 seconds to 1.6 on the mid-range phones our customers actually use. Along the way I built a library of 40+ accessible, keyboard-first primitives that four teams now ship with.

Before that, at Kumu, I built real-time chat and gifting for more than ten million users, which taught me how much care goes into optimistic updates, reconnects and sync that never surprises the user.

I write a lot, I work well asynchronously, and I sweat the details of motion, typography and empty states. I would be glad to talk about how I could contribute to Linear.

Best regards,
Alex Reyes`,
}

export const SEED_AI_RESULTS = [
  { type: "resume_optimize", result: RESUME_OPTIMIZE },
  { type: "cover_letter", result: COVER_LETTER },
] as const

export const SEED_DISCOVERY_KEYWORDS = ["react", "next.js", "typescript"]
