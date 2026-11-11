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
  company: "PayMongo",
  role: "Product Engineer",
  status: "applied",
} as const satisfies Pick<SeedApplication, "company" | "role" | "status">

const HERO_JD = `PayMongo builds the payments platform Philippine businesses use to accept cards and e-wallets online. We are looking for a Product Engineer who cares deeply about craft and speed.

What you'll do
- Own features end to end, from the first sketch to the release note.
- Build fast, polished checkout and merchant dashboard interfaces in React and TypeScript.
- Work with GraphQL and REST APIs on PostgreSQL, and surface webhook events clearly to merchants.
- Partner with design on every flow, and write the developer docs for them.

What we look for
- 4+ years building production web applications with React, TypeScript and Node.js.
- A sharp eye for UI detail: motion, typography, empty and error states.
- Experience with performance profiling, accessibility (WCAG 2.1 AA) and design systems.
- Comfortable in a hybrid team between Makati and remote.

Nice to have: payments or PCI DSS experience, or developer tooling.`

// Philippine companies, salaries in PHP per month (the demo's audience is local).
export const SEED_APPLICATIONS: SeedApplication[] = [
  {
    ...SEED_HERO_APP,
    source: "company_site",
    location: "Makati (hybrid)",
    salary_min: 130000,
    salary_max: 170000,
    salary_currency: "PHP",
    salary_period: "monthly",
    job_description: HERO_JD,
    notes: "Referred to the careers page by a former colleague. Emphasise the kanban drag-and-drop work.",
    appliedDaysAgo: 3,
    createdDaysAgo: 5,
  },
  {
    company: "GCash",
    role: "Frontend Engineer, Dashboard",
    status: "applied",
    source: "linkedin",
    location: "Taguig (hybrid)",
    salary_min: 90000,
    salary_max: 130000,
    salary_currency: "PHP",
    salary_period: "monthly",
    job_description: "Build GCash's merchant and partner dashboards with Next.js App Router, React Server Components and a shared design system.",
    appliedDaysAgo: 6,
    createdDaysAgo: 7,
  },
  {
    company: "Maya",
    role: "Developer Experience Engineer",
    status: "phone_screen",
    source: "referral",
    location: "Mandaluyong (hybrid)",
    contact_name: "Jamie Cruz",
    contact_email: "jamie@example.com",
    job_description: "Improve the developer experience of Maya's payment APIs across docs, SDKs and the merchant dashboard. TypeScript, Postgres and a love for writing.",
    notes: "Phone screen went well; next step is a take-home.",
    appliedDaysAgo: 12,
    createdDaysAgo: 14,
  },
  {
    company: "Sprout Solutions",
    role: "Software Engineer, Payroll UI",
    status: "interview",
    source: "company_site",
    location: "Pasig (hybrid)",
    salary_min: 110000,
    salary_max: 150000,
    salary_currency: "PHP",
    salary_period: "monthly",
    job_description: "Design and build the payroll and HR interfaces Philippine businesses use every pay day. React, TypeScript, accessibility and rigorous testing.",
    notes: "Onsite loop: system design, frontend pairing, values.",
    appliedDaysAgo: 18,
    createdDaysAgo: 20,
    interviewInDays: 2,
  },
  {
    company: "Thinking Machines",
    role: "Senior Frontend Engineer",
    status: "offer",
    source: "linkedin",
    location: "Manila (hybrid)",
    salary_min: 180000,
    salary_max: 220000,
    salary_currency: "PHP",
    salary_period: "monthly",
    job_description: "Build data-heavy web apps and dashboards for clients across Southeast Asia. React, TypeScript, data visualisation and performance at scale.",
    notes: "Offer received; deadline to respond in one week.",
    appliedDaysAgo: 30,
    createdDaysAgo: 32,
  },
  {
    company: "Kalibrr",
    role: "Frontend Engineer, Job Marketplace",
    status: "rejected",
    source: "indeed",
    location: "Remote (Philippines)",
    job_description: "Ship features across Kalibrr's job marketplace using React, TypeScript and GraphQL.",
    notes: "Rejected after the technical round. Feedback: go deeper on state management trade-offs.",
    appliedDaysAgo: 25,
    createdDaysAgo: 27,
  },
  {
    company: "Angkas",
    role: "Full-Stack Engineer",
    status: "wishlist",
    source: "company_site",
    location: "Taguig (hybrid)",
    job_description: "Build Angkas's rider and partner web tools and backend services. TypeScript, React, Node.js and real-time location data.",
    createdDaysAgo: 2,
  },
  {
    company: "Bayanihan Digital",
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
    company: "Habagat Studio",
    role: "Next.js Frontend Developer",
    status: "wishlist",
    source: "online_jobs_ph",
    location: "Remote (Philippines)",
    url: "https://www.onlinejobs.ph/jobseekers/job/demo-nextjs-frontend",
    salary_min: 70000,
    salary_max: 95000,
    salary_currency: "PHP",
    salary_period: "monthly",
    job_description: "Own the marketing site and customer portal built with Next.js App Router and TypeScript.",
    auto_discovered: true,
    createdDaysAgo: 2,
  },
  {
    company: "Sampaguita Labs",
    role: "TypeScript Engineer",
    status: "wishlist",
    source: "online_jobs_ph",
    location: "Remote (Philippines)",
    url: "https://www.onlinejobs.ph/jobseekers/job/demo-typescript-engineer",
    salary_min: 85000,
    salary_max: 115000,
    salary_currency: "PHP",
    salary_period: "monthly",
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
  // Every rewrite only rephrases what FRONTEND_RESUME shows: it is the demo's proof that the optimizer never invents.
  missingKeywords: ["payments", "checkout flows", "webhooks", "PCI DSS", "developer tooling"],
  suggestions: [
    {
      original: "Led the rebuild of the loan application flow in Next.js and TypeScript, cutting time-to-interactive from 4.1 s to 1.6 s on mid-range Android devices.",
      rewritten: "Led the rebuild of the loan application flow in Next.js and TypeScript, a web performance win that cut time-to-interactive from 4.1 s to 1.6 s on mid-range Android devices.",
      reason: "Names the performance outcome the posting cares about, using only your own numbers.",
    },
    {
      original: "Built a component library of 40+ accessible primitives on Radix UI, adopted by four product teams.",
      rewritten: "Built a design-system component library of 40+ accessible primitives on Radix UI, adopted by four product teams.",
      reason: "Uses the posting's term 'design systems' for work the resume already shows.",
    },
    {
      original: "Worked with design to define motion and typography tokens for the web app.",
      rewritten: "Partnered with design to define motion and typography tokens for the web app.",
      reason: "Uses the posting's 'partner with design' and stronger verb; motion and typography match its UI-detail list.",
    },
    {
      original: "Built marketing sites and small dashboards for local businesses with React, Node.js and PostgreSQL.",
      rewritten: "Built production marketing sites and dashboards for [N] local businesses with React, Node.js and PostgreSQL.",
      reason: "Echoes 'production web applications'; [N] marks a number only you can fill in.",
    },
  ],
  summary: "Strong match on React, TypeScript, performance and accessible UI work. The gaps (payments, checkout flows, webhooks, PCI DSS) aren't in the resume; add them only if you have that experience.",
}

const COVER_LETTER: CoverLetterResult = {
  coverLetter: `PayMongo's focus on craft and speed is the kind of work I want to do next, and I would love to join as a Product Engineer.

At Tala I led the rebuild of our loan application flow in Next.js and TypeScript, cutting time-to-interactive from 4.1 seconds to 1.6 on mid-range Android devices. I also built a component library of 40+ accessible primitives on Radix UI that four product teams adopted, and introduced Playwright end-to-end and visual regression tests that cut production UI regressions by roughly 60%.

Before that, at Kumu, I shipped real-time chat and gifting with React and WebSockets for a live-streaming app with more than ten million users. I also profiled the stream viewer's render bottlenecks, raising frame rates on low-end devices from 30 to 55 fps, and worked with design on motion and typography tokens.

I would be glad to talk about how I could help PayMongo keep its checkout and merchant dashboards fast and polished.`,
}

export const SEED_AI_RESULTS = [
  { type: "resume_optimize", result: RESUME_OPTIMIZE },
  { type: "cover_letter", result: COVER_LETTER },
] as const

export const SEED_DISCOVERY_KEYWORDS = ["react", "next.js", "typescript"]
