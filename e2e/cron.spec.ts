import { test, expect } from "@playwright/test"
import { findUserId } from "@/lib/demo/reset"
import { SEED_APPLICATIONS } from "@/lib/demo/seed-data"
import { admin, E2E_EMAIL, resetForSpec } from "./fixtures"

// The test server runs with DEMO_EMAIL = E2E_EMAIL, so "the demo user" here is the e2e user.
const SECRET = process.env.CRON_SECRET!

let e2eId: string

test.beforeAll(async () => {
  e2eId = (await resetForSpec()).userId
})

test.afterAll(async () => {
  await resetForSpec() // undo the reminder test's interview date
})

test.describe("demo reset cron", () => {
  for (const [name, header] of [
    ["no auth header", undefined],
    ["Bearer undefined", "Bearer undefined"],
    ["a wrong secret of the same length", `Bearer ${"x".repeat(SECRET.length)}`],
  ] as const) {
    test(`rejects ${name}`, async ({ request }) => {
      const res = await request.get("/api/cron/demo-reset", {
        headers: header ? { authorization: header } : {},
      })
      expect(res.status()).toBe(401)
    })
  }

  test("resets the demo user with the right secret", async ({ request }) => {
    // A marker row proves the route really replaced the data, not that the last spec left it seeded.
    const { data: marker, error } = await admin()
      .from("applications")
      .insert({ user_id: e2eId, company: "Cron marker", role: "Filler", status: "wishlist" })
      .select("id")
      .single()
    expect(error).toBeNull()

    const res = await request.get("/api/cron/demo-reset", {
      headers: { authorization: `Bearer ${SECRET}` },
      timeout: 60_000,
    })
    expect(res.status()).toBe(200)
    expect(await res.json()).toEqual({ ok: true, userId: e2eId })

    const { count } = await admin()
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", e2eId)
    expect(count).toBe(SEED_APPLICATIONS.length)
    const { data: gone } = await admin().from("applications").select("id").eq("id", marker!.id)
    expect(gone).toEqual([])
  })
})

const tomorrow = () => new Date(Date.now() + 86_400_000).toISOString().slice(0, 10)

// The route is global: never let a test send or mark a real user's reminder.
async function skipIfOthersDueTomorrow() {
  const { count: others, error } = await admin()
    .from("applications")
    .select("*", { count: "exact", head: true })
    .eq("status", "interview")
    .eq("interview_date", tomorrow())
    .eq("reminder_sent", false)
    .neq("user_id", e2eId)
  expect(error).toBeNull()
  test.skip(others !== 0, "another user has a reminder due tomorrow; calling the cron would email them")
}

test("interview-reminder cron skips the demo user", async ({ request }) => {
  await skipIfOthersDueTomorrow()

  expect(await findUserId(admin(), E2E_EMAIL)).toBe(e2eId)
  const { data: app } = await admin()
    .from("applications")
    .update({ interview_date: tomorrow(), reminder_sent: false })
    .eq("user_id", e2eId)
    .eq("status", "interview")
    .select("id")
    .single()

  const res = await request.get("/api/cron/interview-reminder", {
    headers: { authorization: `Bearer ${SECRET}` },
  })
  expect(res.status()).toBe(200)
  expect(await res.json()).toEqual({ sent: 0, failed: 0 })
  const { data: after } = await admin().from("applications").select("reminder_sent").eq("id", app!.id).single()
  expect(after!.reminder_sent).toBe(false)
})

test("interview-reminder cron leaves a refused email unsent", async ({ request }) => {
  await skipIfOthersDueTomorrow()

  // Resend's onboarding sender refuses example.com (422), so the send fails without delivering anything.
  const { data: created, error: userError } = await admin().auth.admin.createUser({
    email: `reminder-${Date.now()}@example.com`,
    email_confirm: true,
  })
  expect(userError).toBeNull()
  const userId = created.user!.id
  try {
    const { data: app, error } = await admin()
      .from("applications")
      .insert({ user_id: userId, company: "Refusal Co", role: "Reminder probe", status: "interview", interview_date: tomorrow() })
      .select("id")
      .single()
    expect(error).toBeNull()

    const res = await request.get("/api/cron/interview-reminder", {
      headers: { authorization: `Bearer ${SECRET}` },
    })
    expect(res.status()).toBe(200)
    expect(await res.json()).toEqual({ sent: 0, failed: 1 })
    const { data: after } = await admin().from("applications").select("reminder_sent").eq("id", app!.id).single()
    expect(after!.reminder_sent).toBe(false)
  } finally {
    await admin().from("applications").delete().eq("user_id", userId)
    await admin().auth.admin.deleteUser(userId)
  }
})
