# ApplicantOS — Implementation Status

> Last updated: 2026-04-06

## MVP Roadmap

| # | Increment | Status |
|---|-----------|--------|
| 1 | Landing page (hero, features, CTA) | ✅ Complete |
| 2 | Scaffold + Auth (Supabase — Google OAuth + email/password) | ✅ Complete |
| 3 | Application CRUD + list view | ✅ Complete |
| 4 | Kanban board (`@hello-pangea/dnd`) | ✅ Complete |
| 5 | Resume library + S3 upload + text extraction | ✅ Complete |
| 6 | AI Resume Optimizer (Vercel AI SDK `generateText` + `Output.object`) | ✅ Complete |
| 7 | AI Cover Letter Generator (text output) | ✅ Complete |

## Phase 2 (Deferred)

| Feature | Status |
|---------|--------|
| Dashboard stats + upcoming interviews | ✅ Complete |
| PDF export for cover letters | ✅ Complete |
| Interview reminder email (Resend + Vercel Cron) | ✅ Complete |
| In-app notification center | ❌ Dropped |

## Phase 3 (Deferred)

| Feature | Status |
|---------|--------|
| n8n automations (follow-up reminders, weekly digest) | ⬜ Not started |

## Infrastructure Setup

| Service | Status |
|---------|--------|
| Supabase project | ✅ Complete |
| Supabase Auth (Google OAuth) | ✅ Complete |
| Supabase DB schema + RLS | ✅ Complete |
| AWS IAM user (`applicantos-server`) | ✅ Complete |
| AWS S3 bucket | ✅ Complete |
| Google Gemini API key | ✅ Complete |
| Resend account + API key | ✅ Complete |
| `.env.local` filled | ✅ Complete |

---

## Status Key

| Symbol | Meaning |
|--------|---------|
| ⬜ | Not started |
| 🔄 | In progress |
| ✅ | Complete |
| ❌ | Blocked |
