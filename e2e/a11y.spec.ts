import AxeBuilder from "@axe-core/playwright"
import { test, expect } from "./fixtures"
import { AXE_ROUTES, ROUTES } from "./routes"

for (const name of AXE_ROUTES) {
  const route = ROUTES.find((r) => r.name === name)!
  test.describe(name, () => {
    if (route.public) test.use({ storageState: { cookies: [], origins: [] } })

    test(`axe ${name}`, async ({ page, heroAppId }) => {
      await page.goto(route.path.replace("[id]", heroAppId))
      await page.waitForLoadState("networkidle")
      const { violations } = await new AxeBuilder({ page }).analyze()
      const blocking = violations.filter((v) => v.impact === "serious" || v.impact === "critical")
      expect(blocking.map((v) => `${v.id}: ${v.help} → ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([])
    })
  })
}
