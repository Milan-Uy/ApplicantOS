# ApplicantOS — Architectural Map

## Context

A thorough, optimized map of the ApplicantOS codebase: what it is, what it's built on, how each layer connects, and how automation and AI fit in. Intended as a reference document for orientation and onboarding.

---

## 1. What the App Is

**ApplicantOS** is an AI-powered job application tracker. A user uploads resumes, tracks applications through a Kanban-style pipeline (wishlist → applied → phone screen → interview → offer / rejected / ghosted), and uses Gemini-powered features to optimize their resume against a job description and generate tailored cover letters. Interview reminders are delivered by email via a cron-driven Resend job.

Single-tenant per user — every resource is scoped to a Supabase auth user via both RLS and explicit `.eq("user_id", user.id)` guards.

---

## 2. Tech Stack

### Runtime / framework
- **Next.js 16.2.2** — App Router. Server Components by default; Client Components where interactivity is required (`"use client"`). Route handlers for APIs, `middleware.ts` for auth edge.
- **React 19.2.4** — uses new primitives: `useOptimistic`, `useTransition`, `useActionState`.
- **TypeScript 5** strict, path alias `@/*` → `./src/*` ([tsconfig.json](tsconfig.json)).

### Data + auth
- **Supabase** — Postgres + Auth + RLS. Two SSR clients:
  - [src/lib/supabase/client.ts](src/lib/supabase/client.ts) — browser (`createBrowserClient`)
  - [src/lib/supabase/server.ts](src/lib/supabase/server.ts) — async server client reading cookies from `next/headers`
  - [src/lib/supabase/middleware.ts](src/lib/supabase/middleware.ts) — session refresh on every request
- **Service role client** — built ad-hoc inside the cron route only, never exposed to the app surface.

### AI
- **Vercel AI SDK `ai` v6.0.146** + **`@ai-sdk/google` v3.0.58** driving **Gemini 2.5 Flash** (`gemini-2.5-flash`).
- **Zod** for structured output schemas on the resume optimizer.

### Storage + docs
- **AWS S3** via `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` — presigned PUT/GET URLs only, nothing streamed through the server.
- **unpdf** for PDF text extraction, **mammoth** for DOCX, **@react-pdf/renderer** for generating cover-letter PDFs.

### Email
- **Resend v6** with a **React Email** template ([src/lib/email/interview-reminder.tsx](src/lib/email/interview-reminder.tsx)).

### UI / UX
- **Tailwind CSS 4** with CSS variables — Linear-inspired dark design tokens in [src/app/globals.css](src/app/globals.css) (primary indigo `#5e6ad2`, near-black surfaces, Inter variable with `cv01`/`ss03`).
- **shadcn/ui** primitives (Badge + Skeleton live in [src/components/ui/](src/components/ui/)).
- **class-variance-authority (CVA)** for the status Badge variants, **clsx** + **tailwind-merge** for the `cn()` helper.
- **@hello-pangea/dnd** — drag-and-drop for the Kanban (React-19-compatible fork of react-beautiful-dnd).
- **Sonner** — toast notifications.
- **lucide-react** — icons.

### Build / lint
- ESLint 9 with Next config. Two pre-existing lint errors in [app/api/pdf/cover-letter/route.tsx](src/app/api/pdf/cover-letter/route.tsx) and [lib/email/interview-reminder.tsx](src/lib/email/interview-reminder.tsx) are documented and intentionally left in place.

---

## 3. Route Map

### Public
- **`/`** — [src/app/page.tsx](src/app/page.tsx) — landing hero + feature grid + CTAs. Middleware redirects authed users to `/dashboard`.

### Auth (`src/app/(auth)/`)
- **`/login`** — [login/page.tsx](src/app/(auth)/login/page.tsx) — email/password form + Google OAuth button.
- **`/signup`** — [signup/page.tsx](src/app/(auth)/signup/page.tsx) — same plus `full_name` metadata.
- **[actions.ts](src/app/(auth)/actions.ts)** — server actions: `signIn`, `signUp`, `signInWithGoogle`, `signOut`.
- **`/auth/callback`** — [route.ts](src/app/auth/callback/route.ts) — exchanges OAuth code for session.

### Authenticated app (`src/app/(app)/`)
- **`/dashboard`** — [page.tsx](src/app/(app)/dashboard/page.tsx) — stats cards, upcoming interviews (next 5), source breakdown, recent apps. Single query, in-memory aggregation.
- **`/applications`** — [page.tsx](src/app/(app)/applications/page.tsx) — hosts `<ApplicationsView>`, which toggles between Kanban and List.
- **`/applications/new`** — [page.tsx](src/app/(app)/applications/new/page.tsx) — create form; pre-populates resume dropdown from user's documents.
- **`/applications/[id]`** — [page.tsx](src/app/(app)/applications/[id]/page.tsx) — detail view; action buttons to Edit, Optimize Resume, Cover Letter.
- **`/applications/[id]/edit`** — [page.tsx](src/app/(app)/applications/[id]/edit/page.tsx) — edit form with pre-filled values, date input normalization.
- **`/applications/[id]/resume`** — [page.tsx](src/app/(app)/applications/[id]/resume/page.tsx) + [client.tsx](src/app/(app)/applications/[id]/resume/client.tsx) — AI resume optimization UI.
- **`/applications/[id]/cover-letter`** — [page.tsx](src/app/(app)/applications/[id]/cover-letter/page.tsx) + [client.tsx](src/app/(app)/applications/[id]/cover-letter/client.tsx) — AI cover letter generation with PDF export.
- **`/resumes`** — [page.tsx](src/app/(app)/resumes/page.tsx) — upload widget + grid of `ResumeCard`s.
- **`/settings`** — [page.tsx](src/app/(app)/settings/page.tsx) — profile display + sign-out.

### API (`src/app/api/`)
- **`POST /api/upload`** — [route.ts](src/app/api/upload/route.ts) — returns presigned S3 URL. MIME-whitelisted (PDF/DOCX only), keyed as `resumes/{user.id}/{uuid}/{filename}`, 300s expiry.
- **`POST /api/parse-resume`** — [route.ts](src/app/api/parse-resume/route.ts) — downloads from S3, enforces `startsWith("resumes/{user.id}/")` + 10 MB cap, extracts text (`unpdf` / `mammoth`).
- **`POST /api/ai/resume-optimize`** — [route.ts](src/app/api/ai/resume-optimize/route.ts) — auth + app-ownership + 50 KB cap → `optimizeResume()` → stores result in `ai_results`.
- **`POST /api/ai/cover-letter`** — [route.ts](src/app/api/ai/cover-letter/route.ts) — same pattern → `generateCoverLetter()`.
- **`POST /api/pdf/cover-letter`** — [route.tsx](src/app/api/pdf/cover-letter/route.tsx) — `@react-pdf/renderer` → S3 upload → creates a `documents` row → presigned GET (1h) for download.
- **`GET /api/cron/interview-reminder`** — [route.ts](src/app/api/cron/interview-reminder/route.ts) — cron endpoint protected by `CRON_SECRET` using `crypto.timingSafeEqual`.

### Middleware
- [src/middleware.ts](src/middleware.ts) → delegates to [src/lib/supabase/middleware.ts](src/lib/supabase/middleware.ts).
- Public allowlist: `/`, `/login`, `/signup`, `/auth/*`, `/api/cron/*`.
- Unauth → `/login`; authed hitting `/`, `/login`, `/signup` → `/dashboard`.
- Refreshes Supabase auth cookies on every request.

---

## 4. Database Schema

Defined in [src/types/database.ts](src/types/database.ts). All tables have RLS `user_id = auth.uid()` policies; server actions add `.eq("user_id", user.id)` as defense-in-depth.

| Table | Purpose | Key columns |
|---|---|---|
| **applications** | Core tracking record | `id`, `user_id`, `company`, `role`, `url`, `status`, `source`, `salary_min/max`, `location`, `job_description`, `notes`, `contact_name/email`, `resume_id`, `interview_date`, `applied_at`, `follow_up_at`, `reminder_sent`, `created_at`, `updated_at` |
| **documents** | Resume + cover-letter files | `id`, `user_id`, `application_id?`, `type` (`resume`\|`cover_letter`), `label?`, `filename`, `s3_key`, `extracted_text?` |
| **ai_results** | Cached AI outputs (JSONB) | `id`, `application_id`, `type` (`resume_optimize`\|`cover_letter`), `result`, `created_at` |
| **notifications** | In-app reminders (Phase 3) | `id`, `user_id`, `application_id?`, `type` (`follow_up`\|`digest`\|`system`), `title`, `body?`, `read` |

### Enums
- **ApplicationStatus**: `wishlist` \| `applied` \| `phone_screen` \| `interview` \| `offer` \| `rejected` \| `ghosted`
- **ApplicationSource**: `linkedin` \| `indeed` \| `referral` \| `company_site` \| `other`

Note: `ghosted` is a valid status but is **not rendered as a Kanban column** — only in list/detail views.

---

## 5. Server Actions

All use `"use server"`, fetch the user via `supabase.auth.getUser()`, scope mutations to `user_id`, then `revalidatePath()` + optionally `redirect()`.

### [src/app/(auth)/actions.ts](src/app/(auth)/actions.ts)
`signIn` · `signUp` · `signInWithGoogle` · `signOut`.

### [src/app/(app)/applications/actions.ts](src/app/(app)/applications/actions.ts)
- `createApplication(formData)` — validates required company/role, coerces salary, inserts.
- `updateApplication(id, formData)` — bound id, full-field update.
- `updateApplicationStatus(id, status)` — narrow patch used by the Kanban drag handler.
- `deleteApplication(id)` — redirects to `/applications`.

### [src/app/(app)/resumes/actions.ts](src/app/(app)/resumes/actions.ts)
- `saveDocument(formData)` — **checks `s3Key.startsWith("resumes/{user.id}/")`** before inserting.
- `deleteDocument(id)`.

---

## 6. Kanban Implementation (the interesting UI)

[src/components/applications/KanbanBoard.tsx](src/components/applications/KanbanBoard.tsx)

```txt
initialApps (server) ─┐
                      ├─▶ useOptimistic ──▶ optimisticApps
drag event ───────────┘           │
                                  ▼
                 startTransition(updateApplicationStatus(id, newStatus))
                                  │
                                  ▼
                   server revalidatePath("/applications")
                                  │
                                  ▼
                 RSC refetch rehydrates initialApps
```

- Six drop columns (wishlist through rejected); ghosted omitted.
- `useOptimistic` updates the card's column instantly; `useTransition` runs the server action in the background. On server error, React's compensating update reverts the optimistic state. On success, server revalidation reconciles.
- Board is loaded via `next/dynamic` with `ssr: false` — avoids the cost of the DnD library on the server and keeps initial payload lean.

---

## 7. AI Integration

Model: **Gemini 2.5 Flash** wired through the Vercel AI SDK. `GOOGLE_GEMINI_API_KEY` is server-only.

### Resume Optimizer — [src/lib/ai/resume-optimizer.ts](src/lib/ai/resume-optimizer.ts)
Two structured calls fired in **`Promise.all`**, each using `generateText` with `Output.object()` + a Zod schema:

1. **Keyword Matcher** — schema `{ matchScore: 0..100, missingKeywords: string[] }`, prompt `KEYWORD_MATCHER_PROMPT` — extracts required skills from the JD, compares to the resume.
2. **Bullet Rewriter** — schema `{ suggestions: [{ original, rewritten, reason }] }`, prompt `BULLET_REWRITER_PROMPT` — rewrites 3–8 bullets with strong verbs and quantified impact.

A local helper composes a `summary` string from the match score tier. Full result shape is persisted in `ai_results.result` (JSONB).

### Cover Letter — [src/lib/ai/cover-letter.ts](src/lib/ai/cover-letter.ts)
Single `generateText` (no schema — plain text output). Inputs: `jobDescription`, `resumeText`, optional `whyThisRole`, optional `tone: "formal" | "conversational"`. Target: 3–4 paragraphs, 250–400 words, no placeholders/headers.

Both AI helpers pass `maxRetries: 3` to every `generateText` call. The Vercel AI SDK retries retryable errors (429, 5xx, network) with exponential backoff before throwing.

### Rate limiting — [src/lib/rate-limit.ts](src/lib/rate-limit.ts)
In-memory sliding-window limiter (no external dependency). Both AI routes share a single `"ai"` bucket: 10 requests per 60 seconds per user. Over-limit → 429 + `Retry-After` header. Single-instance (works on Vercel single-region MVP). Upgrade path: replace the module-level `Map` with Upstash Redis + `@upstash/ratelimit`.

### API flow (both AI routes)
```txt
client → POST /api/ai/...
  ├─ supabase.auth.getUser()         (401 if missing)
  ├─ checkRateLimit(user.id, ...)    (429 + Retry-After if exceeded)
  ├─ validate body + 50 KB size cap  (400 if over)
  ├─ verify application ownership    (.eq("user_id", user.id))
  ├─ call AI helper (maxRetries: 3, Promise.all for optimizer)
  ├─ insert into ai_results
  └─ return JSON result
```

Prompts live under [src/lib/ai/prompts/](src/lib/ai/prompts/).

---

## 8. File Upload Pipeline

```txt
 ┌──────────────┐  1. POST /api/upload {filename, contentType}
 │ ResumeUpload │───────────────────────────────▶ ┌─────────────┐
 │  (client)    │ ◀────────── {url, key} ──────── │ auth + MIME │
 └──────┬───────┘                                 │  whitelist  │
        │                                         └─────────────┘
        │ 2. PUT {url} (binary)      ┌────────┐
        └───────────────────────────▶│   S3   │
                                     └────────┘
        3. POST /api/parse-resume {s3Key, contentType}
        ┌──────────────────────────────────────────────┐
        │ auth + startsWith("resumes/{user.id}/") guard │
        │ S3 GET + 10 MB cap                           │
        │ unpdf (PDF) / mammoth (DOCX)                 │
        └──────────────────────────────────────────────┘
                          │
                          ▼
                     {text}
                          │
        4. user reviews label + extracted text
                          │
        5. saveDocument(formData) server action
                          │  (re-verifies s3Key ownership)
                          ▼
                   documents row inserted
```

Component state machine: `idle → uploading → parsing → review → saved`. Max 10 MB enforced on both ends (client in [ResumeUpload.tsx](src/components/resumes/ResumeUpload.tsx), server in `parse-resume`).

---

## 9. Automation & Scheduled Jobs

### Interview reminder cron — [src/app/api/cron/interview-reminder/route.ts](src/app/api/cron/interview-reminder/route.ts)

```txt
external scheduler (Vercel Cron / external service)
   │  GET /api/cron/interview-reminder
   │  Authorization: Bearer {CRON_SECRET}
   ▼
crypto.timingSafeEqual(actual, expected)   ← constant-time
   │
   ▼
supabaseAdmin (service role, persistSession:false)
   │
   └─ WHERE status='interview'
        AND interview_date = tomorrow_utc
        AND reminder_sent = false
   │
   ▼ Promise.allSettled over rows:
      • auth.admin.getUserById(user_id)   → email
      • resend.emails.send({ react: <InterviewReminderEmail/> })
      • UPDATE applications SET reminder_sent = true
   │
   ▼
{ sent: N, failed: M }
```

Email template is a React Email component with inline styles. `from: ApplicantOS <onboarding@resend.dev>` (Resend's sandbox sender — swap for a verified domain in production).

### Deferred (Phase 3)
- `N8N_WEBHOOK_SECRET` exists in env but is not yet consumed — the CLAUDE.md roadmap places n8n-driven follow-up reminders and weekly digests in Phase 3.

---

## 10. Security Model

Summarized from patterns observed across routes:

| Guard | Where | Purpose |
|---|---|---|
| `supabase.auth.getUser()` early-exit | Every API + action | 401 on missing session |
| `.eq("user_id", user.id)` on every mutation/read | All actions + routes | Defense-in-depth over RLS |
| `s3Key.startsWith("resumes/{user.id}/")` | [parse-resume/route.ts](src/app/api/parse-resume/route.ts), [resumes/actions.ts](src/app/(app)/resumes/actions.ts) | Prevent cross-tenant file access |
| MIME whitelist (PDF + DOCX only) | [upload/route.ts](src/app/api/upload/route.ts) | Reject non-document types |
| 50 KB input cap | Both AI routes | DoS + token-spend guard |
| Per-user rate limit (10 req/min) | Both AI routes | Abuse + Gemini quota protection |
| 10 MB file cap (client + server) | ResumeUpload + parse-resume | Memory safety |
| `crypto.timingSafeEqual` on `CRON_SECRET` | Interview cron | Timing-attack-resistant auth |
| Short presigned URL TTLs (PUT 300s, GET 3600s) | upload + pdf routes | Limit leaked-URL exposure |
| Service role key is read **only** inside the cron route | interview-reminder | Avoid leaking admin scope into app code |

---

## 11. Environment Variables

| Variable | Scope | Consumed by |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | public | both Supabase clients |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | both Supabase clients |
| `SUPABASE_SERVICE_ROLE_KEY` | server | cron route only |
| `GOOGLE_GEMINI_API_KEY` | server | AI SDK helpers |
| `AWS_REGION` / `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_S3_BUCKET` | server | [src/lib/s3.ts](src/lib/s3.ts), upload/parse/pdf routes |
| `RESEND_API_KEY` | server | [src/lib/resend.ts](src/lib/resend.ts) |
| `CRON_SECRET` | server | interview cron |
| `NEXT_PUBLIC_APP_URL` | public | OAuth callback URLs + email links |
| `N8N_WEBHOOK_SECRET` | server | defined, not yet used |

---

## 12. Styling & Design System

[src/app/globals.css](src/app/globals.css) defines Tailwind v4 CSS variables:

- **Color tokens** — primary `#5e6ad2` (indigo), secondary/accent `#7170ff` (violet), bg `#08090a`, fg `#f7f8f8`, muted text `#8a8f98`, borders `rgba(255,255,255,0.08)`.
- **Radius** — Linear-style scale: sm 2px → xl 12px.
- **Shadows** — ring-based (`0 0 0 1px` translucent white), never solid dark.
- **Animations** — `shimmer` (skeleton), `fade-in`.
- **Type** — Inter variable with OpenType features `cv01`, `ss03`.
- **Scheme** — dark-theme only (`color-scheme: dark`).

### Key components
- **Badge** — [src/components/ui/badge.tsx](src/components/ui/badge.tsx) — CVA variants per `ApplicationStatus` (indigo applied, amber phone screen, orange interview, green offer, red rejected, muted wishlist/ghosted).
- **Skeleton** — [src/components/ui/skeleton.tsx](src/components/ui/skeleton.tsx) — shimmer gradient used across all `loading.tsx` files (dashboard/applications/resumes/settings) on the current `feat/loading-skeletons` branch.

### Navigation
- **Sidebar** — [src/components/navigation/Sidebar.tsx](src/components/navigation/Sidebar.tsx) — 240px fixed, desktop-only, `usePathname()` highlights active route; account button routes to `/settings`.
- **MobileNav** — [src/components/navigation/MobileNav.tsx](src/components/navigation/MobileNav.tsx) — 56px top bar + collapsible drawer, auto-closes on nav.

---

## 13. Data Flow Patterns (summary)

| Pattern | Applied where |
|---|---|
| Server Components fetch, Client Components interact | Everywhere — defaults server |
| Server Actions for all mutations, `revalidatePath` + `redirect` | All actions.ts files |
| `useOptimistic` + `useTransition` for instant feedback | KanbanBoard |
| `next/dynamic` with `ssr: false` for heavy libs | KanbanBoard (DnD) |
| Presigned URL direct-to-S3 (no proxy) | Upload + PDF export |
| In-memory aggregation over one broad query | Dashboard stats |
| `Promise.all` for independent AI calls | Resume optimizer |
| `Promise.allSettled` for fan-out email sends | Interview cron |
| Dual supabase clients (browser vs. server) | `lib/supabase/` |
| Service-role client scoped to one file | Cron route only |

---

## 14. Known Gaps / Non-Goals

- **Token metering / per-user quotas** — no tracking of Gemini spend per user beyond the 10 req/min cap.
- **Email beyond interview reminders** — no welcome, follow-up, or status-change mails yet.
- **n8n integration** — env var declared, no code paths.
- **Cover letter PDF route** — lint errors are known and deliberately ignored per CLAUDE.md.
- **Real-time updates** — Supabase realtime is not used.

---

## 15. How to Verify End-to-End

Since this document is a map rather than a change, verification = make sure the map matches current state:

1. `npm run dev` → open `http://localhost:3000`.
2. Sign up via email or Google → confirm redirect to `/dashboard`.
3. Create an application at `/applications/new`, drag it across Kanban columns, confirm DB updates via Supabase dashboard or a follow-up refresh.
4. Upload a PDF + DOCX at `/resumes`; verify S3 key follows `resumes/{user_id}/...` and `extracted_text` is populated.
5. From an application with a `job_description` + linked resume, run Optimize Resume and Cover Letter; check `ai_results` rows appear.
6. Download a cover letter PDF — confirm a new `documents` row of type `cover_letter` and a fresh presigned GET URL.
7. (Optional) Hit `/api/cron/interview-reminder` with a matching `Authorization: Bearer $CRON_SECRET` header; confirm reminder email and `reminder_sent = true`.

---

## File Index (quick jump)

**Core**: [src/middleware.ts](src/middleware.ts) · [src/app/layout.tsx](src/app/layout.tsx) · [src/app/(app)/layout.tsx](src/app/(app)/layout.tsx) · [src/types/database.ts](src/types/database.ts) · [src/app/globals.css](src/app/globals.css)

**Supabase**: [client.ts](src/lib/supabase/client.ts) · [server.ts](src/lib/supabase/server.ts) · [middleware.ts](src/lib/supabase/middleware.ts)

**AI**: [resume-optimizer.ts](src/lib/ai/resume-optimizer.ts) · [cover-letter.ts](src/lib/ai/cover-letter.ts) · [prompts/](src/lib/ai/prompts/) · [rate-limit.ts](src/lib/rate-limit.ts)

**Integrations**: [s3.ts](src/lib/s3.ts) · [resend.ts](src/lib/resend.ts) · [email/interview-reminder.tsx](src/lib/email/interview-reminder.tsx) · [pdf/cover-letter-template.tsx](src/lib/pdf/cover-letter-template.tsx)

**Feature components**: [KanbanBoard.tsx](src/components/applications/KanbanBoard.tsx) · [ApplicationsView.tsx](src/components/applications/ApplicationsView.tsx) · [ResumeUpload.tsx](src/components/resumes/ResumeUpload.tsx) · [ResumeCard.tsx](src/components/resumes/ResumeCard.tsx)

**API routes**: [upload](src/app/api/upload/route.ts) · [parse-resume](src/app/api/parse-resume/route.ts) · [ai/resume-optimize](src/app/api/ai/resume-optimize/route.ts) · [ai/cover-letter](src/app/api/ai/cover-letter/route.ts) · [pdf/cover-letter](src/app/api/pdf/cover-letter/route.tsx) · [cron/interview-reminder](src/app/api/cron/interview-reminder/route.ts)
