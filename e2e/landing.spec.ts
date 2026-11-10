import { randomUUID } from "node:crypto"
import { findUserId } from "@/lib/demo/reset"
import { test, expect, admin, E2E_EMAIL, E2E_PASSWORD } from "./fixtures"

test.use({ storageState: { cookies: [], origins: [] } })

async function setPassword(password: string) {
  const id = await findUserId(admin(), E2E_EMAIL)
  if (!id) throw new Error("e2e user not found")
  const { error } = await admin().auth.admin.updateUserById(id, { password })
  if (error) throw error
}

// Backup only: the password test restores in its own finally so later tests log in normally.
test.afterAll(async () => {
  await setPassword(E2E_PASSWORD)
})

test("Try the demo logs in", async ({ page }) => {
  await page.goto("/")
  await page.getByRole("button", { name: "Try the demo" }).click()
  await page.waitForURL("**/dashboard", { timeout: 5_000 })
})

test("demo login survives a password change", async ({ page }) => {
  await setPassword(randomUUID())
  try {
    await page.goto("/")
    await page.getByRole("button", { name: "Try the demo" }).click()
    await page.waitForURL("**/dashboard", { timeout: 5_000 })
  } finally {
    await setPassword(E2E_PASSWORD)
  }
})

test("login is quick", async ({ page }) => {
  await page.goto("/login")
  await page.waitForLoadState("networkidle")
  await page.getByLabel("Email").fill(E2E_EMAIL)
  await page.getByLabel("Password").fill(E2E_PASSWORD)
  await page.getByRole("button", { name: "Sign in", exact: true }).click()
  await page.waitForURL("**/dashboard", { timeout: 1_500 })
})

test("calm motion", async ({ page }) => {
  await page.goto("/")
  await page.waitForLoadState("networkidle")
  // An element with two animations reports a list, e.g. "1, infinite".
  const infinite = await page.evaluate(
    () =>
      [...document.querySelectorAll("*")].filter((el) => {
        const s = getComputedStyle(el)
        return s.animationName !== "none" && s.animationIterationCount.split(",").some((c) => c.trim() === "infinite")
      }).length,
  )
  expect(infinite).toBeLessThanOrEqual(2)
})

// The mobile project skips this file, and the landing root clips overflow, so scrollWidth alone can't catch a crushed layout.
test("landing reflows at phone width", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/")
  await page.waitForLoadState("networkidle")
  await expect(page.getByTestId("preview-sidebar")).toBeHidden()
  const tile = await page.getByRole("heading", { name: "Kanban-first tracker" }).locator("..").boundingBox()
  const grid = await page.getByTestId("bento").boundingBox()
  expect(tile!.width).toBeGreaterThanOrEqual(grid!.width - 1)
})
