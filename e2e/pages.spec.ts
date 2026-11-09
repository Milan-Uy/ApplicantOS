import { readdirSync, readFileSync } from "node:fs"
import type { Page } from "@playwright/test"
import { findUserId } from "@/lib/demo/reset"
import { test, expect, admin, resetForSpec, E2E_EMAIL } from "./fixtures"

const DEMO_LOCKED = "Profile changes are disabled for the demo account"

test.beforeAll(async () => {
  await resetForSpec()
})

// Restore the profile before the reset: resets find the user by email.
test.afterAll(async () => {
  const id = await findUserId(admin(), E2E_EMAIL)
  if (id) await admin().auth.admin.updateUserById(id, { email: E2E_EMAIL, user_metadata: { full_name: null } })
  await resetForSpec()
})

async function open(page: Page, path: string) {
  await page.goto(path)
  await page.waitForLoadState("networkidle")
}

const cards = (page: Page) => page.getByRole("button", { name: /^Dismiss / })

test("job discovery is honest", async ({ page }) => {
  await open(page, "/job-discovery")
  await expect(page.getByText("Automation paused")).toBeVisible()
  await expect(page.getByText("Next run")).toHaveCount(0)
  await expect(page.getByText("Ready", { exact: true })).toHaveCount(0)
  expect(await cards(page).count()).toBeGreaterThanOrEqual(3)
})

test("dismiss is undoable", async ({ page }) => {
  test.setTimeout(60_000)
  await open(page, "/job-discovery")
  const role = "TypeScript Engineer"
  const dismiss = page.getByRole("button", { name: `Dismiss ${role}` })

  await dismiss.click()
  await expect(dismiss).toHaveCount(0)
  await page.getByRole("button", { name: "Undo" }).click()
  await expect(dismiss).toBeVisible()
  // Undo is the only way the toast closed; nothing should have been deleted.
  await page.waitForTimeout(500)
  await open(page, "/job-discovery")
  await expect(dismiss).toBeVisible()

  const persisted = page.waitForResponse(
    (r) => r.request().method() === "POST" && !!r.request().headers()["next-action"],
    { timeout: 15_000 }
  )
  await dismiss.click()
  // Sonner pauses its timer while the pointer is over the toaster.
  await page.mouse.move(0, 0)
  await expect(page.getByRole("button", { name: "Undo" })).toHaveCount(0, { timeout: 15_000 })
  await persisted
  await open(page, "/job-discovery")
  await expect(dismiss).toHaveCount(0)
})

test("demo profile is locked", async ({ page }) => {
  await open(page, "/settings")
  const name = page.getByLabel("Name")
  const before = await name.inputValue()
  await name.fill(`Changed ${Date.now()}`)
  await page.getByRole("button", { name: "Save Changes" }).click()
  await expect(page.locator('[data-sonner-toast][data-type="error"]')).toContainText(DEMO_LOCKED)

  // Email: the change that would let a visitor take the demo account.
  await page.getByLabel("Email").fill("someone-else@example.com")
  await page.getByRole("button", { name: "Save Changes" }).click()
  await expect(page.locator('[data-sonner-toast][data-type="error"]').last()).toContainText(DEMO_LOCKED)

  await open(page, "/settings")
  await expect(page.getByLabel("Name")).toHaveValue(before)
  await expect(page.getByLabel("Email")).toHaveValue(E2E_EMAIL)
})

test("job discovery uses tokens, not inline styles", () => {
  const dir = "src/app/(app)/job-discovery"
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".tsx"))) {
    const src = readFileSync(`${dir}/${f}`, "utf8")
    expect(src, f).not.toContain("style={{")
    expect(src, f).not.toContain("onMouseEnter")
  }
})
