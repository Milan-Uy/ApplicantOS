import type { Page } from "@playwright/test"
import { findUserId } from "@/lib/demo/reset"
import { test, expect, admin, resetForSpec, E2E_EMAIL } from "./fixtures"

test.beforeAll(async () => {
  await resetForSpec()
})

// Filling before hydration loses the input and submits natively; wait for the client bundle.
async function open(page: Page, path: string) {
  await page.goto(path)
  await page.waitForLoadState("networkidle")
}

const errorToast = (page: Page) => page.locator('[data-sonner-toast][data-type="error"]')

// Server actions POST to the page's own URL; only those are failed, the page GET goes through.
async function failActions(page: Page, path: string) {
  await page.route(`**${path}`, (route) =>
    route.request().method() === "POST" && route.request().headers()["next-action"]
      ? route.fulfill({ status: 500, body: "boom" })
      : route.continue()
  )
}

test("create lands on the new record", async ({ page }) => {
  const role = `Feedback Engineer ${Date.now()}`
  await open(page, "/applications/new")
  await page.getByLabel("Company").fill("Feedback Co")
  await page.getByLabel("Role").fill(role)
  // Radix Select submits through a hidden native select; prove its value reaches the row.
  await page.getByRole("combobox", { name: "Source" }).click()
  await page.getByRole("option", { name: "Referral" }).click()
  await page.getByRole("button", { name: "Save Application" }).click()
  // Generous: in `next dev` the detail route may compile on first visit.
  await expect(page).toHaveURL(/\/applications\/[0-9a-f-]{36}$/, { timeout: 30_000 })
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(role)
  await expect(page.getByRole("main")).toContainText(/referral/i)
})

test("failed create keeps every value", async ({ page }) => {
  await open(page, "/applications/new")
  await failActions(page, "/applications/new")
  const values: [string, string][] = [
    ["Company", "Kept Co"],
    ["Role *", "Kept Role"],
    ["Job Posting URL", "https://example.com/job"],
    ["Location", "Remote"],
    ["Contact Email", "jane@example.com"],
    ["Job Description", "Line one\nLine two"],
  ]
  for (const [label, value] of values) await page.getByLabel(label, { exact: true }).fill(value)
  const posted = page.waitForRequest((r) => r.method() === "POST" && !!r.headers()["next-action"])
  await page.getByRole("button", { name: "Save Application" }).click()
  await posted
  await expect(errorToast(page)).toBeVisible()
  for (const [label, value] of values) await expect(page.getByLabel(label, { exact: true })).toHaveValue(value)
  await expect(page).toHaveURL(/\/applications\/new$/)
})

test("failed edit keeps the typed value", async ({ page, heroAppId }) => {
  await open(page, `/applications/${heroAppId}/edit`)
  await failActions(page, `/applications/${heroAppId}/edit`)
  await page.getByLabel("Notes").fill("Edited notes that must survive")
  await page.getByRole("button", { name: "Save Changes" }).click()
  await expect(errorToast(page)).toBeVisible()
  await expect(page.getByLabel("Notes")).toHaveValue("Edited notes that must survive")
})

test("delete asks first", async ({ page, heroAppId }) => {
  await open(page, `/applications/${heroAppId}`)
  await page.getByRole("button", { name: "Delete Application" }).click()
  const dialog = page.getByRole("alertdialog")
  await expect(dialog).toBeVisible()
  await dialog.getByRole("button", { name: "Cancel" }).click()
  await expect(dialog).toBeHidden()
  await expect(page).toHaveURL(new RegExp(`/applications/${heroAppId}$`))
})

test("confirmed delete removes the record and says so", async ({ page }) => {
  const userId = (await findUserId(admin(), E2E_EMAIL))!
  const { data, error } = await admin()
    .from("applications")
    .insert({ user_id: userId, role: "Doomed Role", company: "Doomed Co", status: "wishlist" })
    .select("id")
    .single()
  if (error) throw error
  await open(page, `/applications/${data.id}`)
  await page.getByRole("button", { name: "Delete Application" }).click()
  await page.getByRole("alertdialog").getByRole("button", { name: "Delete" }).click()
  await expect(page).toHaveURL(/\/applications$/, { timeout: 30_000 })
  await expect(page.locator('[data-sonner-toast][data-type="success"]')).toBeVisible()
  const { count } = await admin().from("applications").select("*", { count: "exact", head: true }).eq("id", data.id)
  expect(count).toBe(0)
})

test("unknown id → not-found", async ({ page }) => {
  await open(page, "/applications/00000000-0000-0000-0000-000000000000")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/not found/i)
  await expect(page.getByRole("main").getByRole("link", { name: /applications/i })).toHaveAttribute("href", "/applications")
})

async function moveFirstWishlistCard(page: Page) {
  const card = page.locator('[data-rfd-droppable-id="wishlist"] a').first()
  const id = (await card.getAttribute("href"))!.split("/").pop()!
  await card.focus()
  await page.keyboard.press("Space")
  await page.keyboard.press("ArrowRight")
  await page.keyboard.press("Space")
  return id
}

test("kanban move persists", async ({ page }) => {
  await open(page, "/applications")
  const id = await moveFirstWishlistCard(page)
  await expect(page.locator(`[data-rfd-droppable-id="applied"] a[href="/applications/${id}"]`)).toBeVisible()
  await expect
    .poll(async () => (await admin().from("applications").select("status").eq("id", id).single()).data?.status)
    .toBe("applied")
})

test("failed kanban move toasts and puts the card back", async ({ page }) => {
  await open(page, "/applications")
  await failActions(page, "/applications")
  const id = await moveFirstWishlistCard(page)
  await expect(errorToast(page)).toContainText("Couldn't move card")
  await expect(page.locator(`[data-rfd-droppable-id="wishlist"] a[href="/applications/${id}"]`)).toBeVisible()
})
