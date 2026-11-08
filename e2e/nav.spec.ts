import { test, expect, E2E_EMAIL } from "./fixtures"

test("exactly one nav link is current, and it is the page's", async ({ page }, testInfo) => {
  await page.goto("/resumes")
  if (testInfo.project.name === "mobile") {
    const toggle = page.getByRole("button", { name: "Toggle menu" })
    await expect(toggle).toHaveAttribute("aria-expanded", "false")
    await toggle.click()
    await expect(toggle).toHaveAttribute("aria-expanded", "true")
    const menuId = await toggle.getAttribute("aria-controls")
    await expect(page.locator(`#${menuId}`)).toBeVisible()
  }
  const current = page.locator('a[aria-current="page"]:visible')
  await expect(current).toHaveCount(1)
  await expect(current).toHaveText("Resumes")
})

test("sidebar footer shows the signed-in user", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "sidebar is desktop-only")
  await page.goto("/dashboard")
  await expect(page.locator("aside")).toContainText(E2E_EMAIL)
})
