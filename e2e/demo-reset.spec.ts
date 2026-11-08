import { test, expect } from "@playwright/test"
import { listAllKeys, resetDemoUser } from "@/lib/demo/reset"
import { SEED_APPLICATIONS, SEED_RESUMES } from "@/lib/demo/seed-data"
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
