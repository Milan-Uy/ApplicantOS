import { randomUUID } from "node:crypto"
import { findUserId } from "@/lib/demo/reset"
import { test, expect, admin, saveSession, E2E_EMAIL, E2E_PASSWORD } from "./fixtures"

test.use({ storageState: { cookies: [], origins: [] } })

async function setPassword(password: string) {
  const id = await findUserId(admin(), E2E_EMAIL)
  if (!id) throw new Error("e2e user not found")
  const { error } = await admin().auth.admin.updateUserById(id, { password })
  if (error) throw error
}

// A password change revokes every session of the user, including the saved one later specs start
// from, so restore the password (backup for the test's own finally) and save a fresh session.
test.afterAll(async ({ browser }, testInfo) => {
  await setPassword(E2E_PASSWORD)
  const context = await browser.newContext({ baseURL: testInfo.project.use.baseURL })
  await saveSession(await context.newPage())
  await context.close()
})

test("Try the demo logs in", async ({ page }) => {
  await page.goto("/")
  await page.getByRole("button", { name: "Try the demo" }).click()
  await page.waitForURL("**/dashboard", { timeout: 5_000 })
})

// Supabase rate-limits /verify per client IP; from the server every visitor would share one bucket.
test("demo login verifies from the visitor's browser", async ({ page }) => {
  await page.goto("/")
  const verify = page.waitForRequest((r) => r.url().includes("/auth/v1/verify"), { timeout: 5_000 })
  await page.getByRole("button", { name: "Try the demo" }).click()
  await verify
  await page.waitForURL("**/dashboard", { timeout: 5_000 })
})

// Each generateLink replaces the account's one token, so a second visitor can void the first's.
test("demo login survives a concurrent visitor", async ({ page }) => {
  let raced = false
  await page.route("**/auth/v1/verify**", async (route) => {
    if (!raced) {
      raced = true
      const { error } = await admin().auth.admin.generateLink({ type: "magiclink", email: E2E_EMAIL })
      if (error) throw error
    }
    await route.continue()
  })
  await page.goto("/")
  await page.getByRole("button", { name: "Try the demo" }).click()
  await page.waitForURL("**/dashboard", { timeout: 10_000 })
})

test("failed login keeps what was typed", async ({ page }) => {
  await page.goto("/login")
  await page.waitForLoadState("networkidle")
  await page.getByLabel("Email").fill(E2E_EMAIL)
  await page.getByLabel("Password").fill("not-the-password")
  await page.getByRole("button", { name: "Sign in", exact: true }).click()
  await expect(page.getByRole("alert")).toBeVisible()
  // React's automatic form-action reset lands after the error renders; nothing to wait on when it doesn't.
  await page.waitForTimeout(1_000)
  await expect(page.getByLabel("Email")).toHaveValue(E2E_EMAIL)
  await expect(page.getByLabel("Password")).toHaveValue("not-the-password")
})

// An existing address gets Supabase's anti-enumeration reply — no session, no error, no email sent —
// the same shape as a new signup awaiting confirmation.
test("signup that needs email confirmation says so", async ({ page }) => {
  await page.goto("/signup")
  await page.waitForLoadState("networkidle")
  await page.getByLabel("Full name").fill("E2E Signup")
  await page.getByLabel("Email").fill(E2E_EMAIL)
  await page.getByLabel("Password").fill(randomUUID())
  await page.getByRole("button", { name: "Create account" }).click()
  await expect(page.getByRole("status")).toContainText("Check your email")
  expect(new URL(page.url()).pathname).toBe("/signup")
})

// The n8n pipeline is retired (Job Discovery shows "Automation paused"); the landing must not claim it runs.
test("landing doesn't claim job discovery is running", async ({ page }) => {
  await page.goto("/")
  for (const claim of [/check daily/i, /last checked/i, /every morning/i]) await expect(page.getByText(claim)).toHaveCount(0)
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
