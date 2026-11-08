import { test, expect } from "./fixtures"
import { ROUTES } from "./routes"

const label = process.env.SHOTS ?? "current"

// Routes seen to scroll horizontally at 390 px; remove an entry when its task fixes it.
const OVERFLOWS_ON_MOBILE = new Set<string>([])

for (const route of ROUTES) {
  test.describe(route.name, () => {
    if (route.public) test.use({ storageState: { cookies: [], origins: [] } })

    test(`screenshot ${route.name}`, async ({ page, heroAppId }, testInfo) => {
      const project = testInfo.project.name
      const viewport = page.viewportSize()!
      if (project === "mobile" && OVERFLOWS_ON_MOBILE.has(route.name)) test.fail()

      await page.goto(route.path.replace("[id]", heroAppId))
      await page.waitForLoadState("networkidle")
      // Without this, a lost session silently screenshots the login page for every authed route.
      if (!route.public) expect(new URL(page.url()).pathname).not.toBe("/login")

      await page.screenshot({ fullPage: true, path: `screenshots/${label}/${project}/${route.name}.png` })
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width)
    })
  })
}
