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
      // Judge the settled page: mid-fade text blends with the background and fails contrast at random.
      await page.evaluate(() =>
        Promise.all(
          document
            .getAnimations()
            .filter((a) => a.effect?.getTiming().iterations !== Infinity)
            .map((a) => a.finished.catch(() => {})),
        ),
      )
      const { violations } = await new AxeBuilder({ page }).analyze()
      const blocking = violations.filter((v) => v.impact === "serious" || v.impact === "critical")
      expect(blocking.map((v) => `${v.id}: ${v.help} → ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([])
    })
  })
}
