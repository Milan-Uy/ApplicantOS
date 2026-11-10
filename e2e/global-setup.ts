import { chromium, type FullConfig } from "@playwright/test"
import { E2E_EMAIL, E2E_PASSWORD, resetForSpec } from "./fixtures"

export default async function globalSetup(config: FullConfig) {
  await resetForSpec()

  const browser = await chromium.launch()
  const page = await browser.newPage({ baseURL: config.projects[0].use.baseURL })
  await page.goto("/login")
  await page.fill('input[name="email"]', E2E_EMAIL)
  await page.fill('input[name="password"]', E2E_PASSWORD)
  await page.locator('form button[type="submit"]').first().click()
  // The first dev compile of /dashboard is slow.
  await page.waitForURL("**/dashboard", { timeout: 90_000 })
  await page.context().storageState({ path: "e2e/.auth/e2e.json" })
  await browser.close()
}
