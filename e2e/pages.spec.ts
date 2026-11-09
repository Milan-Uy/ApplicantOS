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
  // Name is required: fill both so the email change really reaches the server.
  await page.getByLabel("Name").fill(`Changed ${Date.now()}`)
  await page.getByLabel("Email").fill("someone-else@example.com")
  const submitted = page.waitForResponse(
    (r) => r.request().method() === "POST" && !!r.request().headers()["next-action"]
  )
  await page.getByRole("button", { name: "Save Changes" }).click()
  await submitted
  await expect(page.locator('[data-sonner-toast][data-type="error"]')).toContainText(DEMO_LOCKED)

  const { data } = await admin().auth.admin.getUserById((await findUserId(admin(), E2E_EMAIL))!)
  expect(data.user?.email).toBe(E2E_EMAIL)
  expect(data.user?.new_email ?? null).toBeNull()
  expect(data.user?.user_metadata?.full_name ?? null).toBeNull()
})

test("a dismissal pending across navigation can't come back to delete an undone job", async ({ page }) => {
  test.setTimeout(60_000)
  // Compile /applications first: a slow first visit would outlast the 5 s undo window.
  await open(page, "/applications")
  await open(page, "/job-discovery")
  const dismiss = page.getByRole("button", { name: "Dismiss Next.js Frontend Developer" })
  await dismiss.click()
  // Client-side navigation away and back while the first toast is still open.
  await page.getByRole("link", { name: "Applications" }).first().click()
  await page.waitForURL("**/applications")
  await page.getByRole("link", { name: "Job Discovery" }).first().click()
  await page.waitForURL("**/job-discovery")
  // waitForURL resolves on the loading skeleton; wait for the real cards.
  await expect(cards(page).first()).toBeVisible()
  // Still pending, so still hidden: it can't be dismissed a second time.
  await expect(dismiss).toHaveCount(0)
  await page.getByRole("button", { name: "Undo" }).click()
  await expect(dismiss).toBeVisible()
  await page.mouse.move(0, 0)
  await page.waitForTimeout(7_000)
  await open(page, "/job-discovery")
  await expect(dismiss).toBeVisible()
})

test("dismiss never deletes an application that moved past wishlist", async ({ page }) => {
  test.setTimeout(60_000)
  const userId = (await findUserId(admin(), E2E_EMAIL))!
  const row = async (role: string) =>
    (await admin().from("applications").select("id").eq("user_id", userId).eq("role", role).maybeSingle()).data

  // Already moved on before the page loaded: not listed as a discovery.
  const moved = await row("React Developer (Full-time, Remote)")
  await admin().from("applications").update({ status: "interview" }).eq("id", moved!.id)
  await open(page, "/job-discovery")
  await expect(page.getByRole("button", { name: "Dismiss React Developer (Full-time, Remote)" })).toHaveCount(0)

  // Moved on while the undo window was open: the delete must not touch it.
  const role = "Full-Stack Developer (React + Node)"
  const persisted = page.waitForResponse(
    (r) => r.request().method() === "POST" && !!r.request().headers()["next-action"],
    { timeout: 15_000 }
  )
  await page.getByRole("button", { name: `Dismiss ${role}` }).click()
  await admin().from("applications").update({ status: "applied" }).eq("id", (await row(role))!.id)
  await page.mouse.move(0, 0)
  await persisted
  expect(await row(role)).not.toBeNull()
})

test("job discovery uses tokens, not inline styles", () => {
  const dir = "src/app/(app)/job-discovery"
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".tsx"))) {
    const src = readFileSync(`${dir}/${f}`, "utf8")
    expect(src, f).not.toContain("style={{")
    expect(src, f).not.toContain("onMouseEnter")
  }
})
