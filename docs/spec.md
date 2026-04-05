# AI Job Application Tracker — Spec

## Overview

A full-stack web app that helps job seekers track every application (status, notes, contacts, deadlines) and provides AI-powered resume optimization and cover letter generation. Built on free-tier infrastructure.

**Project:** New standalone repo (separate from IronIQ).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4, shadcn/ui |
| Backend | Next.js API Routes + Server Actions, Node.js |
| AI | Vercel AI SDK (`ai` + `@ai-sdk/google`), Gemini 2.5 Flash (free tier) |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (Google + GitHub OAuth, email/password) |
| Storage | AWS S3 (resume/cover letter PDFs) via presigned URLs |
| Email | Resend (follow-up reminders, weekly digest) |
| Automation | n8n (self-hosted — Oracle Cloud free tier or Railway) |
| PDF Export | `@react-pdf/renderer` (server-side, no headless browser) |
| Drag & Drop | `@hello-pangea/dnd` (maintained fork of react-beautiful-dnd) |
| Resume Parsing | `pdf-parse` (PDF) + `mammoth` (DOCX) with editable preview |
| State Management | React built-ins (useState, useContext, Server Components) |
| Hosting | Vercel (free tier) |

---

## Core Features

### 1. Job Application Tracker (CRUD)

**Data model — `applications` table:**

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | PK |
| user_id | uuid | FK to auth.users |
| company | text | Company name |
| role | text | Job title |
| url | text | Job posting URL |
| status | enum | `wishlist`, `applied`, `phone_screen`, `interview`, `offer`, `rejected`, `ghosted` |
| source | text | Where the job was found: `linkedin`, `indeed`, `referral`, `company_site`, `other` |
| salary_min | int | Salary range low |
| salary_max | int | Salary range high |
| location | text | Location / remote |
| job_description | text | Full JD text (for AI features) |
| notes | text | Free-form notes |
| contact_name | text | Recruiter / hiring manager |
| contact_email | text | Contact email |
| resume_id | uuid | FK to documents (which resume version used) |
| interview_date | timestamptz | Scheduled interview date/time |
| applied_at | timestamptz | Date applied |
| follow_up_at | timestamptz | Next follow-up date |
| reminder_sent | boolean | Whether follow-up reminder was sent |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**UI:**
- Kanban board view (drag-and-drop between status columns via `@hello-pangea/dnd`)
- Table/list view with sorting and filtering
- Dashboard with stats: total apps, response rate, interviews scheduled, upcoming interview dates, offers
- Source breakdown: which channels produce the most interviews

### 2. Resume Library

Users upload and manage multiple resume versions (e.g., "Frontend Focus", "Fullstack", "Leadership"). When creating an application, they select which resume to use. The AI optimizer works against the selected version.

**Upload flow (presigned S3 URLs):**
1. Client calls `POST /api/upload` → server generates presigned S3 upload URL
2. Client uploads file directly to S3 (bypasses Vercel size limits)
3. Server fetches file from S3, extracts text via `pdf-parse` (PDF) or `mammoth` (DOCX)
4. Client shows extracted text in an editable textarea for user review/correction
5. User confirms → server saves document record + clean text to DB

### 3. AI Resume Optimizer

**Trigger:** User selects an application with a JD and a linked resume.

**Vercel AI SDK pipeline (`Promise.all` + `generateObject`):**
- **Call A — Keyword Matcher:** `generateObject()` with Zod schema — extracts required skills/keywords from JD, compares against resume text, produces match score (0-100) + list of missing keywords
- **Call B — Bullet Rewriter:** `generateObject()` with Zod schema — for each resume bullet point, suggests a rewrite that better matches the JD language and requirements

Both calls run in parallel via `Promise.all()`. Output validated with Zod schemas.

**Endpoint:** `POST /api/ai/resume-optimize`

```typescript
// Input
{ resumeText: string, jobDescription: string }

// Output
{
  matchScore: number          // 0-100
  missingKeywords: string[]
  suggestions: Array<{
    original: string
    rewritten: string
    reason: string
  }>
  summary: string
}
```

### 4. AI Cover Letter Generator

**Trigger:** User clicks "Generate Cover Letter" on an application.

**Vercel AI SDK pipeline (`generateText`):**
1. Single `generateText()` call with a system prompt that includes parsed JD context, resume text, and user's notes
2. System prompt instructs the model to extract company/role/requirements and generate a tailored letter
3. PDF rendering via `@react-pdf/renderer` server-side → upload to S3 (Phase 2)

**Endpoint:** `POST /api/ai/cover-letter`

```typescript
// Input
{ jobDescription: string, resumeText: string, whyThisRole?: string, tone?: "formal" | "conversational" }

// Output
{ coverLetter: string, pdfUrl: string }
```

### 5. n8n Automations

| Workflow | Trigger | Action | Details |
|----------|---------|--------|---------|
| **Follow-up reminder** | Hourly poll | Email via Resend + in-app notification | Queries Supabase for applications where `follow_up_at <= now()` and `reminder_sent = false`. Sends personalized email ("Time to follow up with {company} about your {role} application"). Sets `reminder_sent = true`. Inserts row into `notifications` table. |
| **Weekly job search digest** | Every Monday 9:00 AM | Email summary via Resend | Queries each user's past-week activity: new apps submitted, status changes, upcoming follow-ups/interviews. Formats HTML email with stats ("You applied to 5 roles this week, 2 moved to interview stage"). |

**n8n integration points:**
- **Supabase REST API** — reads/writes application data using service role key
- **Resend** — sends formatted HTML emails (React Email templates)
- **Webhook endpoint** (`POST /api/webhooks/n8n`) — receives callbacks for in-app notifications, secured with `N8N_WEBHOOK_SECRET`

---

## Pages & Routes

```
src/app/
├── page.tsx                            # Landing page (public — hero, features, CTA)
├── (app)/                          # Authenticated (middleware-protected)
│   ├── dashboard/page.tsx          # Stats, recent activity, upcoming interviews
│   ├── applications/
│   │   ├── page.tsx                # Kanban board (default) + list view toggle
│   │   ├── new/page.tsx            # Add new application (select resume, paste JD)
│   │   └── [id]/
│   │       ├── page.tsx            # Application detail + notes
│   │       ├── resume/page.tsx     # AI resume optimization results
│   │       └── cover-letter/page.tsx # AI cover letter generator
│   ├── resumes/page.tsx            # Resume library (upload, manage versions)
│   ├── settings/page.tsx           # Profile, notification preferences
│   └── layout.tsx                  # Sidebar nav
├── (auth)/
│   ├── login/page.tsx
│   └── signup/page.tsx
├── auth/callback/route.ts          # Supabase OAuth callback
└── api/
    ├── ai/
    │   ├── resume-optimize/route.ts
    │   └── cover-letter/route.ts
    ├── upload/route.ts              # Presigned S3 URL generation
    ├── webhooks/n8n/route.ts        # n8n webhook receiver
    └── parse-resume/route.ts        # Extract text from uploaded resume
```

---

## Database Schema

```sql
-- Users managed by Supabase Auth (auth.users)

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id UUID,  -- nullable; set when linked to a specific application
  type TEXT NOT NULL CHECK (type IN ('resume', 'cover_letter')),
  label TEXT,            -- user-defined label, e.g. "Frontend Focus"
  filename TEXT NOT NULL,
  s3_key TEXT NOT NULL,
  extracted_text TEXT,   -- parsed text content for AI processing
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  url TEXT,
  status TEXT NOT NULL DEFAULT 'wishlist'
    CHECK (status IN ('wishlist','applied','phone_screen','interview','offer','rejected','ghosted')),
  source TEXT CHECK (source IN ('linkedin','indeed','referral','company_site','other')),
  salary_min INT,
  salary_max INT,
  location TEXT,
  job_description TEXT,
  notes TEXT,
  contact_name TEXT,
  contact_email TEXT,
  resume_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  interview_date TIMESTAMPTZ,
  applied_at TIMESTAMPTZ,
  follow_up_at TIMESTAMPTZ,
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add FK after both tables exist
ALTER TABLE documents ADD CONSTRAINT fk_documents_application
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE SET NULL;

CREATE TABLE ai_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('resume_optimize', 'cover_letter')),
  result JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('follow_up', 'digest', 'system')),
  title TEXT NOT NULL,
  body TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_applications_user ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(user_id, status);
CREATE INDEX idx_applications_followup ON applications(follow_up_at) WHERE reminder_sent = false;
CREATE INDEX idx_documents_user ON documents(user_id);
CREATE INDEX idx_ai_results_app ON ai_results(application_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE read = false;

-- RLS
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users CRUD own applications" ON applications
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users CRUD own documents" ON documents
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users read own AI results" ON ai_results
  FOR ALL USING (application_id IN (SELECT id FROM applications WHERE user_id = auth.uid()));
CREATE POLICY "Users read own notifications" ON notifications
  FOR ALL USING (auth.uid() = user_id);
```

---

## AI Architecture

```
Vercel AI SDK Pipeline
├── Model: google('gemini-1.5-flash') via @ai-sdk/google
│   └── Free tier: 15 RPM, 1M tokens/day
├── Prompts: stored in src/lib/ai/prompts/ (system prompts + few-shot examples)
├── Functions:
│   ├── Resume Optimizer (Promise.all)
│   │   ├── generateObject() → Keyword Matcher (match score + missing keywords)
│   │   └── generateObject() → Bullet Rewriter (suggested rewrites with reasons)
│   └── Cover Letter
│       └── generateText() → JD context + resume + user intent → formatted letter
└── Schema Validation: Zod schemas for all structured output
```

---

## External Service Limits (Free Tier)

| Service | Usage | Free Tier Limit |
|---------|-------|-----------------|
| AWS S3 | Resume + cover letter PDF storage | 5 GB, 20K GET, 2K PUT/month |
| Resend | Follow-up reminders + weekly digest | 100/day, 3K/month |

---

## Phased Roadmap

### Phase 1 — MVP

1. Landing page (hero, features, CTA)
2. Supabase Auth (Google OAuth + email/password)
3. Application CRUD with Kanban board + list view
4. Source tracking (LinkedIn, Indeed, referral, etc.)
5. Resume library (upload, manage versions, text extraction with editable preview)
6. AI Resume Optimizer (match score, missing keywords, bullet rewrites)
7. AI Cover Letter Generator (text only — no PDF export yet)

### Phase 2 — Polish + Automation

7. Dashboard with stats + upcoming interviews
8. PDF export for cover letters (`@react-pdf/renderer` → S3)
9. n8n: Follow-up reminders + weekly job search digest
10. In-app notification center

### Phase 3 — Intelligence + Expansion

11. Company research page (tech stack, Glassdoor, recent news — AI-summarized)
12. Contacts/networking tracker (link people to applications)
13. Salary analytics dashboard
14. Calendar view for interview dates

### Phase 4 — Platform

15. AI Interview Prep (generate tailored questions from JD)
16. Chrome extension to auto-import job postings from LinkedIn/Indeed
17. Mobile-responsive redesign / PWA

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI
GOOGLE_GEMINI_API_KEY=

# AWS
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET=
RESEND_API_KEY=

# n8n
N8N_WEBHOOK_SECRET=
```
