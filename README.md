# ApplicantOS

> AI-powered job application tracker and resume optimizer.

**Live Demo:** https://applicant-os.vercel.app/

## Features

- **Kanban board** — drag-and-drop applications across status columns
- **Application tracking** — wishlist → applied → interview → offer/rejected
- **AI Resume Optimizer** — tailored suggestions powered by Gemini 2.5 Flash
- **AI Cover Letter Generator** — job-specific cover letters in seconds
- **Resume library** — upload, store, and parse resumes (PDF/DOCX) via AWS S3
- **Dashboard** — stats, recent activity, and upcoming interviews
- **Interview reminder emails** — automated via Resend + Vercel Cron
- **Auth** — Google OAuth + email/password via Supabase

## Tech Stack

Next.js 15 · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui · Supabase (Auth + DB) · Vercel AI SDK · Gemini 2.5 Flash · AWS S3 · Resend

## Environment Variables

Create a `.env.local` file with the following:

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

## Commands

```bash
npm run dev      # Dev server on localhost:3000
npm run build    # Production build
npm run lint     # ESLint
```
