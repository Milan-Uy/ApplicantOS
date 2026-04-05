# Phase 2: PDF Export + Interview Reminder Email Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete Phase 2 by adding a PDF download button to the cover letter page and an automated interview reminder email sent 1 day before the interview via Vercel Cron + Resend.

**Architecture:** PDF download wires up the existing `/api/pdf/cover-letter` route to a button in the cover letter client. Email uses Resend with a React email template; a Vercel Cron job at 8am UTC queries for applications with `status = 'interview'` and `interview_date = tomorrow`, sends reminders, and marks `reminder_sent = true` to avoid duplicates. The `interview_date` and `reminder_sent` fields already exist in the DB schema.

**Tech Stack:** Next.js 15 App Router · React 19 · TypeScript · Resend (`resend` npm package) · Vercel Cron · Supabase (service role client for cron query) · Tailwind CSS 4 · shadcn/ui

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `src/app/(app)/applications/[id]/cover-letter/client.tsx` | Modify | Add `handleDownload` + Download PDF button |
| `src/lib/resend.ts` | Create | Resend client singleton |
| `src/lib/email/interview-reminder.tsx` | Create | React email template for interview reminder |
| `src/app/api/cron/interview-reminder/route.ts` | Create | Cron handler: query → send → mark sent |
| `vercel.json` | Create | Vercel Cron schedule config |
| `src/types/database.ts` | No change | `interview_date` + `reminder_sent` already exist |
| `STATUS.md` | Modify | Mark Phase 2 complete |

---

## Task 4: PDF Download Button

**Files:**
- Modify: `src/app/(app)/applications/[id]/cover-letter/client.tsx`

The `downloading` and `downloadError` state already exist. Add `handleDownload` and the button UI next to the existing Copy button.

- [ ] **Step 1: Add `handleDownload` to `client.tsx`**

Insert after the `handleCopy` function (line ~72):

```tsx
async function handleDownload() {
  if (!coverLetter) return
  setDownloading(true)
  setDownloadError(null)

  try {
    const res = await fetch("/api/pdf/cover-letter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId, coverLetter }),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || "Failed to generate PDF")
    }

    const { downloadUrl } = await res.json()
    window.open(downloadUrl, "_blank")
  } catch (err) {
    setDownloadError(err instanceof Error ? err.message : "Something went wrong")
  } finally {
    setDownloading(false)
  }
}
```

- [ ] **Step 2: Add Download PDF button next to Copy button**

In the `{coverLetter && ...}` block, replace the header `<div className="flex items-center justify-between mb-3">` contents:

```tsx
<div className="flex items-center justify-between mb-3">
  <h2 className="text-sm font-medium text-muted-foreground">
    Generated Cover Letter
  </h2>
  <div className="flex items-center gap-2">
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="px-3 py-1.5 rounded-md text-xs font-medium bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {downloading ? "Generating PDF..." : "Download PDF"}
    </button>
    <button
      onClick={handleCopy}
      className="px-3 py-1.5 rounded-md text-xs font-medium bg-muted text-muted-foreground hover:text-foreground transition-colors"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  </div>
</div>
{downloadError && (
  <p className="text-xs text-destructive mb-2">{downloadError}</p>
)}
```

- [ ] **Step 3: Verify in browser**

Run `npm run dev`, navigate to any application with a generated cover letter, click "Download PDF", confirm PDF opens in new tab.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(app\)/applications/\[id\]/cover-letter/client.tsx
git commit -m "feat: add download PDF button to cover letter page"
```

---

## Task 5: Resend Client Setup

**Files:**
- Create: `src/lib/resend.ts`

- [ ] **Step 1: Install resend**

```bash
npm install resend
```

Expected: `resend` added to `package.json` dependencies.

- [ ] **Step 2: Add `RESEND_API_KEY` to `.env.local`**

Add to `.env.local`:

```env
RESEND_API_KEY=re_your_key_here
CRON_SECRET=your_random_secret_here
```

`CRON_SECRET` can be any random string (e.g. `openssl rand -hex 32`). It protects the cron endpoint from unauthorized calls.

- [ ] **Step 3: Create `src/lib/resend.ts`**

```ts
import { Resend } from "resend"

export const resend = new Resend(process.env.RESEND_API_KEY!)
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/resend.ts package.json package-lock.json
git commit -m "feat: add Resend client"
```

---

## Task 6: Interview Reminder Email Template

**Files:**
- Create: `src/lib/email/interview-reminder.tsx`

This is a plain React component (not `@react-email/components`) since we're just sending HTML via Resend's `react` option.

- [ ] **Step 1: Create `src/lib/email/interview-reminder.tsx`**

```tsx
import React from "react"

interface Props {
  company: string
  role: string
  interviewDate: string // e.g. "Monday, April 7, 2026"
  applicationUrl: string
}

export function InterviewReminderEmail({
  company,
  role,
  interviewDate,
  applicationUrl,
}: Props) {
  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 560, margin: "0 auto", color: "#0C4A6E" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
        Interview tomorrow: {role} at {company}
      </h1>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: "#374151" }}>
        Your interview for <strong>{role}</strong> at <strong>{company}</strong> is scheduled
        for <strong>{interviewDate}</strong>.
      </p>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: "#374151" }}>
        Make sure you're prepared — review the job description, your tailored resume, and cover letter.
      </p>
      <a
        href={applicationUrl}
        style={{
          display: "inline-block",
          marginTop: 16,
          padding: "10px 20px",
          backgroundColor: "#0369A1",
          color: "#fff",
          borderRadius: 8,
          textDecoration: "none",
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        View Application
      </a>
      <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 32 }}>
        You received this reminder because you have an interview scheduled in ApplicantOS.
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/email/interview-reminder.tsx
git commit -m "feat: add interview reminder email template"
```

---

## Task 7: Cron API Route

**Files:**
- Create: `src/app/api/cron/interview-reminder/route.ts`

This route is called by Vercel Cron daily at 8am UTC. It:
1. Verifies the `Authorization: Bearer <CRON_SECRET>` header
2. Queries `applications` where `status = 'interview'`, `interview_date = tomorrow (UTC)`, `reminder_sent = false`
3. Joins user emails via `auth.users` using the service role client
4. Sends each user a reminder email via Resend
5. Marks `reminder_sent = true` on each application

- [ ] **Step 1: Create `src/app/api/cron/interview-reminder/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { resend } from "@/lib/resend"
import { InterviewReminderEmail } from "@/lib/email/interview-reminder"
import React from "react"

// Use service role to query all users' applications and auth.users emails
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Tomorrow's date in UTC, formatted as YYYY-MM-DD
  const tomorrow = new Date()
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split("T")[0]

  // Query applications due tomorrow
  const { data: applications, error } = await supabaseAdmin
    .from("applications")
    .select("id, user_id, company, role, interview_date")
    .eq("status", "interview")
    .eq("interview_date", tomorrowStr)
    .eq("reminder_sent", false)

  if (error) {
    console.error("Cron query error:", error)
    return NextResponse.json({ error: "Query failed" }, { status: 500 })
  }

  if (!applications || applications.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://applicantos.app"

  const results = await Promise.allSettled(
    applications.map(async (app) => {
      // Fetch user email from auth.users
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(
        app.user_id
      )
      if (userError || !userData.user?.email) {
        throw new Error(`No email for user ${app.user_id}`)
      }

      const interviewDate = new Date(app.interview_date + "T00:00:00Z").toLocaleDateString(
        "en-US",
        { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }
      )

      await resend.emails.send({
        from: "ApplicantOS <reminders@applicantos.app>",
        to: userData.user.email,
        subject: `Interview reminder: ${app.role} at ${app.company} tomorrow`,
        react: React.createElement(InterviewReminderEmail, {
          company: app.company,
          role: app.role,
          interviewDate,
          applicationUrl: `${appUrl}/applications/${app.id}`,
        }),
      })

      // Mark reminder sent
      await supabaseAdmin
        .from("applications")
        .update({ reminder_sent: true })
        .eq("id", app.id)
    })
  )

  const sent = results.filter((r) => r.status === "fulfilled").length
  const failed = results.filter((r) => r.status === "rejected").length

  console.log(`Interview reminders: ${sent} sent, ${failed} failed`)
  return NextResponse.json({ sent, failed })
}
```

- [ ] **Step 2: Add `NEXT_PUBLIC_APP_URL` to `.env.local`**

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

(Set to production URL in Vercel env vars when deploying.)

- [ ] **Step 3: Test locally with curl**

```bash
curl -H "Authorization: Bearer your_cron_secret" http://localhost:3000/api/cron/interview-reminder
```

Expected: `{"sent":0}` (or sent count if you have a matching application).

- [ ] **Step 4: Commit**

```bash
git add src/app/api/cron/interview-reminder/route.ts
git commit -m "feat: add interview reminder cron route"
```

---

## Task 8: Vercel Cron Config

**Files:**
- Create: `vercel.json`

- [ ] **Step 1: Create `vercel.json`**

```json
{
  "crons": [
    {
      "path": "/api/cron/interview-reminder",
      "schedule": "0 8 * * *"
    }
  ]
}
```

This runs at 8:00 AM UTC every day. Vercel passes `Authorization: Bearer <CRON_SECRET>` automatically when `CRON_SECRET` is set in Vercel environment variables.

> **Note:** Vercel free tier allows 1 cron job — this uses it.

- [ ] **Step 2: Commit**

```bash
git add vercel.json
git commit -m "feat: configure Vercel Cron for interview reminders"
```

---

## Task 9: Update STATUS.md

**Files:**
- Modify: `STATUS.md`

- [ ] **Step 1: Update STATUS.md**

Replace the Phase 2 table with:

```markdown
## Phase 2

| Feature | Status |
|---------|--------|
| Dashboard stats + upcoming interviews | ⬜ Not started |
| PDF export for cover letters | ✅ Complete |
| Interview reminder email (Resend + Vercel Cron) | ✅ Complete |
| In-app notification center | ❌ Dropped |
```

Update the Infrastructure section:

```markdown
| Resend account + API key | ✅ Complete |
```

Update the last updated date to today's date.

- [ ] **Step 2: Commit**

```bash
git add STATUS.md
git commit -m "docs: update STATUS.md for Phase 2 completion"
```

---

## Self-Review Notes

- `interview_date` and `reminder_sent` already exist in `src/types/database.ts` and the DB schema — no migration needed.
- `NEXT_PUBLIC_APP_URL` is new — must be added to `.env.local` and Vercel env vars.
- `CRON_SECRET` must be set in Vercel env vars for the cron auth header to work in production.
- Resend `from` address (`reminders@applicantos.app`) requires the domain to be verified in the Resend dashboard before production use. For testing, Resend provides a sandbox sender.
- Task 4 can be done independently of Tasks 5–9 and merged first if desired.
