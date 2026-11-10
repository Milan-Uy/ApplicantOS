import { test as base, type Page } from "@playwright/test"
import { createClient } from "@supabase/supabase-js"
import { findUserId, resetDemoUser } from "@/lib/demo/reset"
import { SEED_HERO_APP } from "@/lib/demo/seed-data"

export const E2E_EMAIL = process.env.E2E_EMAIL!
export const E2E_PASSWORD = process.env.E2E_PASSWORD!

export function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  })
}

export const STORAGE_STATE = "e2e/.auth/e2e.json"

/** Logs the e2e user in on `page` (needs a baseURL) and saves the session every authed spec starts from. */
export async function saveSession(page: Page) {
  await page.goto("/login")
  await page.fill('input[name="email"]', E2E_EMAIL)
  await page.fill('input[name="password"]', E2E_PASSWORD)
  await page.locator('form button[type="submit"]').first().click()
  // The first dev compile of /dashboard is slow.
  await page.waitForURL("**/dashboard", { timeout: 90_000 })
  await page.context().storageState({ path: STORAGE_STATE })
}

export function resetForSpec() {
  return resetDemoUser(admin(), E2E_EMAIL, { password: E2E_PASSWORD })
}

// Resolved per test, never at config load: every reset gives the seed rows new ids.
export const test = base.extend<{ heroAppId: string }>({
  heroAppId: async ({}, provide) => {
    const userId = await findUserId(admin(), E2E_EMAIL)
    if (!userId) throw new Error("e2e user not found; run a reset")
    const { data, error } = await admin()
      .from("applications")
      .select("id")
      .eq("user_id", userId)
      .eq("company", SEED_HERO_APP.company)
      .eq("role", SEED_HERO_APP.role)
      .single()
    if (error) throw error
    await provide(data.id)
  },
})

export { expect } from "@playwright/test"
