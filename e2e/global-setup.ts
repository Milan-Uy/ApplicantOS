import { chromium, type FullConfig } from "@playwright/test"
import { resetForSpec, saveSession } from "./fixtures"

export default async function globalSetup(config: FullConfig) {
  await resetForSpec()

  const browser = await chromium.launch()
  const page = await browser.newPage({ baseURL: config.projects[0].use.baseURL })
  await saveSession(page)
  await browser.close()
}
