@AGENTS.md

# CLAUDE.md

**ApplicantOS** — AI-powered job application tracker and resume optimizer.

> See `STATUS.md` for current implementation progress.

## Tech Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui · Supabase (Auth + DB) · Vercel AI SDK (`ai` + `@ai-sdk/google`) + Gemini 2.5 Flash · AWS S3 (presigned URLs) · Resend (email) · `@hello-pangea/dnd` · `pdf-parse` + `mammoth` · `@react-pdf/renderer` (Phase 2) · n8n (Phase 3)

## Commands

```bash
npm run dev             # Dev server on localhost:3000
npm run build           # Production build
npm run lint            # ESLint
npx shadcn@latest add [component]  # Add shadcn/ui component
```

## Environment

`.env.local` requires:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_GEMINI_API_KEY=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET=
RESEND_API_KEY=
N8N_WEBHOOK_SECRET=
CRON_SECRET=
NEXT_PUBLIC_APP_URL=
```

## Architecture

```
src/
├── app/
│   ├── page.tsx                        # Landing page (public)
│   ├── layout.tsx                      # Root layout
│   ├── globals.css
│   ├── (app)/                          # Authenticated (middleware-protected)
│   │   ├── dashboard/page.tsx          # Stats, recent activity, upcoming interviews
│   │   ├── applications/
│   │   │   ├── page.tsx                # Kanban board + list view toggle
│   │   │   ├── actions.ts              # Server actions for applications
│   │   │   ├── new/page.tsx            # Add new application
│   │   │   └── [id]/
│   │   │       ├── page.tsx            # Application detail + notes
│   │   │       ├── edit/page.tsx       # Edit application
│   │   │       ├── resume/
│   │   │       │   ├── page.tsx        # AI resume optimization results
│   │   │       │   └── client.tsx
│   │   │       └── cover-letter/
│   │   │           ├── page.tsx        # AI cover letter generator
│   │   │           └── client.tsx
│   │   ├── resumes/
│   │   │   ├── page.tsx                # Resume library
│   │   │   └── actions.ts
│   │   ├── settings/page.tsx
│   │   └── layout.tsx                  # Sidebar nav
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── actions.ts
│   │   └── layout.tsx
│   ├── auth/callback/route.ts          # Supabase OAuth callback
│   └── api/
│       ├── ai/
│       │   ├── resume-optimize/route.ts
│       │   └── cover-letter/route.ts
│       ├── upload/route.ts             # Presigned S3 URL generation
│       └── parse-resume/route.ts       # Extract text from uploaded resume
├── components/
│   ├── ui/                             # shadcn/ui primitives
│   ├── applications/                   # KanbanBoard, ApplicationsView, DeleteApplicationButton
│   ├── resumes/                        # ResumeCard, ResumeUpload
│   └── navigation/                     # Sidebar, MobileNav
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   # Browser client ("use client" components)
│   │   ├── server.ts                   # Server client (RSC / actions)
│   │   └── middleware.ts               # Session refresh logic
│   ├── ai/
│   │   ├── prompts/                    # System prompts + few-shot examples
│   │   ├── resume-optimizer.ts         # generateObject() with Promise.all
│   │   └── cover-letter.ts            # generateText()
│   └── utils.ts                        # cn() helper
├── types/
│   └── database.ts                     # Supabase auto-generated types
└── middleware.ts                        # Auth guard entry point
```

## Key Patterns

- **Security (API routes):** Guard S3 keys with `s3Key.startsWith(\`resumes/${user.id}/\`)` before S3 reads/writes. Add `.eq("user_id", user.id)` to all Supabase mutations (defense-in-depth over RLS). Cap AI route text inputs at 50 KB. Whitelist `application/pdf` + DOCX MIME on upload. Use `crypto.timingSafeEqual` for cron secret comparison.
- **Auth flow:** Middleware redirects unauthed users to `/login`, authed to `/dashboard`. Root `/` shows landing page for unauthed, redirects to `/dashboard` for authed.
- **Supabase clients:** `client.ts` for browser, `server.ts` for RSC/actions. Cookie-based sessions.
- **Server actions:** Mutations use `revalidatePath` + `redirect` pattern.
- **Resume upload:** Client → `POST /api/upload` (get presigned URL) → upload direct to S3 → `POST /api/parse-resume` (extract text) → editable preview → save to DB.
- **AI:** Vercel AI SDK with Gemini 2.5 Flash. `generateObject()` with Zod schemas for resume optimizer (parallel via `Promise.all`), `generateText()` for cover letter.
- **Kanban:** `@hello-pangea/dnd` for drag-and-drop between status columns. Uses React 19 `useOptimistic` — `initialApps` prop auto-syncs, revert is automatic on server error.

## Database Tables

- `applications` — core job application data (status enum: `wishlist`, `applied`, `phone_screen`, `interview`, `offer`, `rejected`, `ghosted`)
- `documents` — resume + cover letter files (S3 key + extracted text)
- `ai_results` — stored AI optimization/generation results (JSONB)
- `notifications` — in-app notifications from n8n webhooks (Phase 3)

All tables have RLS enabled — users can only access their own rows.

## Known Lint Issues

`npm run lint` has 2 pre-existing errors in `app/api/pdf/cover-letter/route.tsx` and `lib/email/interview-reminder.tsx` — unrelated to app features, leave them.

## MVP Roadmap (7 Increments)

1. Landing page (hero, features, CTA)
2. Scaffold + Auth (Supabase — Google OAuth + email/password)
3. Application CRUD + list view
4. Kanban board (`@hello-pangea/dnd`)
5. Resume library + S3 upload + text extraction
6. AI Resume Optimizer (Vercel AI SDK `generateObject`)
7. AI Cover Letter Generator (text output)

**Phase 2 (deferred):** Dashboard stats · PDF export · Resend emails · notification center

**Phase 3 (deferred):** n8n automations (follow-up reminders, weekly digest)

## Design

Dark theme · Linear indigo (#5e6ad2) primary · Inter Variable with cv01/ss03 · Linear-inspired tokens
