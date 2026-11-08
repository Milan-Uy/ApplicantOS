<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md

**ApplicantOS** — AI-powered job application tracker and resume optimizer.

- `STATUS.md` — what's built, deferred, or dropped. Read before starting a feature.
- `ARCHITECTURE.md` — full architectural map: data flows, layers, integrations.
- `docs/spec.md`, `docs/design-plan.md` — product spec and design plan.

## Tech Stack

Next.js 16 (App Router) · React 19 · TypeScript (strict, `@/*` → `src/*`) · Tailwind CSS 4 · Supabase (Auth + Postgres + RLS) · Vercel AI SDK v6 (`ai` + `@ai-sdk/google`) on Gemini 2.5 Flash · Supabase Storage (private `documents` bucket, server-signed URLs) · `unpdf` + `mammoth` (text extraction) · `@react-pdf/renderer` (cover-letter PDF) · Resend + React Email · `@hello-pangea/dnd` · Zod 4 · n8n (external, job discovery)

## Commands

```bash
npm run dev     # Dev server on localhost:3000
npm run build   # Production build — run before declaring a change done
npm run lint    # ESLint — currently clean; keep it that way
npm test        # Playwright e2e (own dev server on :3100; resets the E2E_EMAIL user's data)
```

`e2e/` holds the Playwright suite. It runs against the real Supabase project as the `E2E_EMAIL` user (never `DEMO_EMAIL`) and writes screenshots to `screenshots/current/` (`SHOTS=before` for a named set). Mock AI calls with `page.route`; specs that mutate data call `resetForSpec()` in `beforeAll`.

**Shell:** quote paths containing `(app)`, `(auth)` or `[id]` — e.g. `cat "src/app/(app)/applications/[id]/page.tsx"` — or the shell treats them as subshells/globs.

## Environment

`.env.local` (gitignored, no example file) requires:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_GEMINI_API_KEY=
RESEND_API_KEY=
N8N_WEBHOOK_SECRET=
CRON_SECRET=
NEXT_PUBLIC_APP_URL=
DEMO_EMAIL=      # live demo account, reset by the demo cron
E2E_EMAIL=       # test-only account, must differ from DEMO_EMAIL
E2E_PASSWORD=
```

## Layout

- `src/app/(app)/` — authenticated pages: dashboard, applications (+ `[id]` detail, edit, resume, cover-letter), resumes, job-discovery, settings. Each route has `loading.tsx` and colocated `actions.ts` server actions.
- `src/app/(auth)/` — login, signup. `src/app/auth/callback/` — Supabase OAuth callback.
- `src/app/api/` — `ai/*` (Gemini), `upload` + `parse-resume` + `view-resume` (Storage), `pdf/cover-letter`, `cron/interview-reminder`, `webhooks/n8n/job-discovery`, `job-discovery/settings`.
- `src/lib/` — `supabase/` clients, `ai/` (prompts + calls), `storage.ts` + `storage-keys.ts`, `resend.ts`, `email/`, `pdf/`, `rate-limit.ts`, `utils.ts` (`cn()`).
- `src/components/ui/` — shadcn/ui (Radix) primitives; use them instead of raw `<button>`/`<input>` class strings. Add with `npx shadcn@latest add <name>`, then: import `cn` from `@/lib/utils` (not `cn`), revert any `globals.css`/`layout.tsx` edits, and swap `bg-accent`/`bg-secondary` for `bg-surface-2` (our accent/secondary are bright, shadcn's are subtle surfaces). `badge.tsx` and `skeleton.tsx` are custom — never `add` over them.
- `src/components/navigation/nav-items.ts` — `NAV_ITEMS`, `isActive`, shared by Sidebar and MobileNav.
- `src/types/database.ts` — hand-maintained DB types; update it alongside any schema change.

## Key Patterns

- **Auth:** `src/middleware.ts` → `lib/supabase/middleware.ts` refreshes the session and redirects unauthed users to `/login`, authed users on `/`, `/login`, `/signup` to `/dashboard`. Public paths: `/`, `/login`, `/signup`, `/auth/*`, `/api/cron/*`, `/api/webhooks/*`, `/api/job-discovery/*` — those API routes authenticate themselves with a bearer secret.
- **Supabase clients:** `lib/supabase/client.ts` in `"use client"` components, `lib/supabase/server.ts` in RSC, actions and user-facing routes. The service-role client is built inline only in the secret-guarded routes (cron, n8n webhook, job-discovery settings); keep it out of anything user-reachable. One exception: `storageAdmin()` (`lib/storage.ts`, service-role bucket handle) in user-facing routes, only after an `isOwnedKey` check.
- **Security (every user-facing route/action):** call `supabase.auth.getUser()` first. Add `.eq("user_id", user.id)` to every Supabase query and mutation (defense-in-depth over RLS). Check `isOwnedKey(key, user.id, "resumes" | "cover_letters")` before any Storage read/write — including keys read from your own `documents` row (RLS checks only `user_id`, not the key). Cap AI text inputs at 50 KB. Whitelist `application/pdf` + DOCX MIME on upload. Compare bearer secrets with `crypto.timingSafeEqual` after a length check.
- **Rate limiting:** `checkRateLimit(user.id, { limit: 10, windowMs: 60_000, bucket: "ai" })` right after auth in both AI routes (shared `"ai"` bucket), returning 429 + `Retry-After`. In-memory, single-instance only; swap the `Map` for Upstash Redis if it goes multi-instance.
- **Server actions:** mutate → `revalidatePath(...)` → `redirect(...)` where the page changes.
- **AI:** `lib/ai/resume-optimizer.ts` runs two `generateText` + `Output.object({ schema })` calls in parallel via `Promise.all`; `lib/ai/cover-letter.ts` uses plain `generateText`. Every call sets `maxRetries: 3`. Prompts live in `lib/ai/prompts/`.
- **Storage:** one private bucket `documents` (created by the demo reset). Keys are `resumes/{uid}/{uuid}/{safeFilename(name)}` and `cover_letters/{uid}/{uuid}/…`; `documents.s3_key` keeps its old name but holds the Storage path. The browser never gets a long-lived URL: the server signs per request (view 300 s, cover-letter download 3600 s). `safeFilename`/`isOwnedKey` live in `lib/storage-keys.ts` (pure, importable from tests).
- **Resume upload:** client → `POST /api/upload` (`{ key, token }` from `createSignedUploadUrl`) → browser `uploadToSignedUrl` → `POST /api/parse-resume` (extract text) → editable preview → save to `documents`.
- **Kanban:** `@hello-pangea/dnd` columns per status, React 19 `useOptimistic` seeded from the `applications` prop (reverts automatically on server error). Kanban is the default view; list view is a toggle.
- **Job discovery:** n8n reads a user's keywords from `GET /api/job-discovery/settings`, then posts matches to `POST /api/webhooks/n8n/job-discovery`, which dedupes by URL and inserts `applications` rows with `status: "wishlist"`, `source: "online_jobs_ph"`, `auto_discovered: true`.
- **Interview reminders:** Vercel Cron (`vercel.json`, daily 08:00 UTC) hits `/api/cron/interview-reminder` with `CRON_SECRET`, which emails via Resend.
- **Loading skeletons:** each `(app)` route's `loading.tsx` defines local `*Skeleton` sub-components mirroring the real layout, built from `components/ui/skeleton.tsx` (`animate-shimmer` keyframe in `globals.css`).
- **Enum display:** render enum strings like `source` with `.replace(/_/g, " ")`.

## Database Tables

- `applications` — core job data. `status`: `wishlist | applied | phone_screen | interview | offer | rejected`. `source`: `linkedin | indeed | referral | company_site | online_jobs_ph | other`. Has `salary_currency`, `salary_period`, `auto_discovered`; `company` is optional.
- `documents` — resumes + cover letters (Storage path in `s3_key` + extracted text).
- `ai_results` — stored AI outputs (JSONB), type `resume_optimize | cover_letter`.
- `job_discovery_settings` — per-user `enabled` + `keywords`, one row per user (upsert on `user_id`).

All tables have RLS: users can only access their own rows. (`notifications` exists in the types but the feature was dropped; leave it unused.)

## Design

Dark theme · Linear indigo `#5e6ad2` primary · Inter Variable with `cv01`/`ss03` · Linear-inspired tokens in `globals.css`.
