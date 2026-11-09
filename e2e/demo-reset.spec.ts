import { test, expect } from "@playwright/test"
import { createClient } from "@supabase/supabase-js"
import { listAllKeys, resetDemoUser } from "@/lib/demo/reset"
import { BUCKET } from "@/lib/storage-keys"
import { SEED_APPLICATIONS, SEED_HERO_APP, SEED_RESUMES } from "@/lib/demo/seed-data"
import { admin, E2E_EMAIL, E2E_PASSWORD, resetForSpec } from "./fixtures"

let e2eId: string

test.beforeAll(async () => {
  e2eId = (await resetForSpec()).userId
})

async function countRowsNotOwnedBy(userId: string) {
  const { count, error } = await admin()
    .from("applications")
    .select("*", { count: "exact", head: true })
    .neq("user_id", userId)
  if (error) throw error
  return count
}

async function snapshot(userId: string) {
  const [apps, docs] = await Promise.all([
    admin().from("applications").select("id").eq("user_id", userId),
    admin().from("documents").select("s3_key").eq("user_id", userId),
  ])
  if (apps.error) throw apps.error
  if (docs.error) throw docs.error
  return {
    appIds: apps.data.map((a) => a.id).sort(),
    docKeys: docs.data.map((d) => d.s3_key).sort(),
  }
}

test("refuses a blank email", async () => {
  await expect(resetDemoUser(admin(), "  ")).rejects.toThrow(/email/i)
})

test("seeds every status, resumes with files, AI results, discovered jobs", async () => {
  const { userId } = await resetForSpec()
  const { data: apps } = await admin().from("applications").select("id, status, auto_discovered").eq("user_id", userId)
  expect(new Set(apps!.map((a) => a.status))).toEqual(
    new Set(["wishlist", "applied", "phone_screen", "interview", "offer", "rejected"])
  )
  expect(apps!.filter((a) => a.auto_discovered).length).toBeGreaterThanOrEqual(3)
  const { data: ai } = await admin()
    .from("ai_results")
    .select("type")
    .in("application_id", apps!.map((a) => a.id))
  expect(new Set(ai!.map((r) => r.type))).toEqual(new Set(["resume_optimize", "cover_letter"]))
  const keys = await listAllKeys(admin(), `resumes/${userId}`)
  expect(keys.filter((k) => k.endsWith(".pdf")).length).toBe(SEED_RESUMES.length)
  const { data: docs } = await admin().from("documents").select("s3_key").eq("user_id", userId)
  expect(docs!.length).toBe(SEED_RESUMES.length)
  for (const d of docs!) expect(keys).toContain(d.s3_key) // every row points at a real file, no leftovers
  // The demo opens the AI tools ready to run: the hero is linked to the first seeded resume.
  const { data: hero } = await admin()
    .from("applications")
    .select("resume_id")
    .eq("user_id", userId)
    .eq("company", SEED_HERO_APP.company)
    .eq("role", SEED_HERO_APP.role)
    .single()
  const { data: linked } = await admin().from("documents").select("label").eq("id", hero!.resume_id ?? "").maybeSingle()
  expect(linked?.label).toBe(SEED_RESUMES[0].label)
})

test("is idempotent and leaves other users untouched", async () => {
  const before = await countRowsNotOwnedBy(e2eId)
  await resetForSpec()
  await resetForSpec()
  expect(await countRowsNotOwnedBy(e2eId)).toBe(before)
  const { count } = await admin()
    .from("applications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", e2eId)
  expect(count).toBe(SEED_APPLICATIONS.length)
})

test("removes every old row even past the API row cap", async () => {
  const extra = Array.from({ length: 1001 }, (_, i) => ({ user_id: e2eId, company: `Bulk ${i}`, role: "Filler", status: "wishlist" }))
  const { error } = await admin().from("applications").insert(extra)
  expect(error).toBeNull()
  await resetForSpec()
  const { count } = await admin()
    .from("applications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", e2eId)
  expect(count).toBe(SEED_APPLICATIONS.length)
})

test("repairs a changed password, so login keeps working", async () => {
  // A throwaway user: changing the e2e user's password would revoke the saved login session.
  const email = `reset-pw-${Date.now()}@example.com`
  const anon = () =>
    createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: { persistSession: false },
    })
  const { userId } = await resetDemoUser(admin(), email, { password: E2E_PASSWORD })
  try {
    await admin().auth.admin.updateUserById(userId, { password: `${E2E_PASSWORD}-changed` })
    await resetDemoUser(admin(), email, { password: E2E_PASSWORD })
    const { error } = await anon().auth.signInWithPassword({ email, password: E2E_PASSWORD })
    expect(error).toBeNull()
  } finally {
    const keys = await listAllKeys(admin(), `resumes/${userId}`)
    if (keys.length) await admin().storage.from(BUCKET).remove(keys)
    await admin().auth.admin.deleteUser(userId)
  }
})

for (const failAt of ["uploads", "inserts"] as const) {
  test(`a failed ${failAt.slice(0, -1)} leaves the previous dataset intact`, async () => {
    await resetForSpec()
    const before = await snapshot(e2eId)
    const keysBefore = (await listAllKeys(admin(), `resumes/${e2eId}`)).sort()
    await expect(
      resetDemoUser(admin(), E2E_EMAIL, { password: E2E_PASSWORD, failAt } as never)
    ).rejects.toThrow()
    expect(await snapshot(e2eId)).toEqual(before)
    expect((await listAllKeys(admin(), `resumes/${e2eId}`)).sort()).toEqual(keysBefore) // this run's uploads removed
  })
}
