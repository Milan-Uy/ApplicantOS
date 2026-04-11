import { NextRequest, NextResponse } from "next/server"
import { timingSafeEqual } from "crypto"
import { createClient } from "@supabase/supabase-js"
import { resend } from "@/lib/resend"
import { InterviewReminderEmail } from "@/lib/email/interview-reminder"
import React from "react"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const expected = Buffer.from(`Bearer ${process.env.CRON_SECRET}`)
  const actual = Buffer.from(authHeader ?? "")
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Tomorrow's date in UTC as YYYY-MM-DD
  const tomorrow = new Date()
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split("T")[0]

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
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(
        app.user_id
      )
      if (userError || !userData.user?.email) {
        throw new Error(`No email for user ${app.user_id}`)
      }

      if (!app.interview_date) {
        throw new Error(`No interview_date for application ${app.id}`)
      }

      const interviewDate = new Date(app.interview_date + "T00:00:00Z").toLocaleDateString(
        "en-US",
        { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }
      )

      await resend.emails.send({
        from: "ApplicantOS <onboarding@resend.dev>",
        to: userData.user.email,
        subject: `Interview reminder: ${app.role} at ${app.company} tomorrow`,
        react: React.createElement(InterviewReminderEmail, {
          company: app.company,
          role: app.role,
          interviewDate,
          applicationUrl: `${appUrl}/applications/${app.id}`,
        }),
      })

      const { error: updateError } = await supabaseAdmin
        .from("applications")
        .update({ reminder_sent: true })
        .eq("id", app.id)

      if (updateError) {
        console.error(`Failed to mark reminder_sent for application ${app.id}:`, updateError)
        throw updateError
      }
    })
  )

  const sent = results.filter((r) => r.status === "fulfilled").length
  const failed = results.filter((r) => r.status === "rejected").length

  console.log(`Interview reminders: ${sent} sent, ${failed} failed`)
  return NextResponse.json({ sent, failed })
}
