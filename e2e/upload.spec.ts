import { randomUUID } from "crypto"
import { mkdir, writeFile } from "fs/promises"
import { createElement, type ReactElement } from "react"
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer"
import { createClient } from "@supabase/supabase-js"
import type { Page } from "@playwright/test"
import { BUCKET } from "@/lib/storage-keys"
import { TextDocumentPDF } from "@/lib/pdf/text-document-template"
import { test, expect, admin, resetForSpec, E2E_EMAIL, E2E_PASSWORD } from "./fixtures"

let userId: string

test.beforeAll(async () => {
  ;({ userId } = await resetForSpec())
})

// Later specs screenshot this user's data: don't leave test rows or missing files behind.
test.afterAll(async () => {
  await resetForSpec()
})

async function open(page: Page, path: string) {
  await page.goto(path)
  await page.waitForLoadState("networkidle")
}

// The card is the deepest div holding both its label and its View PDF button.
const card = (page: Page, label: string) =>
  page
    .locator("div")
    .filter({ has: page.getByText(label, { exact: true }) })
    .filter({ has: page.getByRole("button", { name: "View PDF" }) })
    .last()

const signedUrlPrefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/sign/${BUCKET}/resumes/`

test("upload, extract, save and view a PDF", async ({ page }) => {
  const marker = `UploadProbe${Date.now()}`
  const pdf = await renderToBuffer(
    createElement(TextDocumentPDF, { title: "Probe Resume", body: `${marker} built Postgres-backed job queues.` }) as unknown as ReactElement<DocumentProps>
  )
  await mkdir("test-results", { recursive: true })
  const path = `test-results/${marker}.pdf`
  await writeFile(path, pdf)

  await open(page, "/resumes")
  await page.locator('input[type="file"]').setInputFiles(path)
  await expect(page.locator("textarea")).toHaveValue(new RegExp(marker), { timeout: 30_000 })

  const label = `Probe ${marker}`
  await page.getByPlaceholder("e.g. Software Engineer Resume").fill(label)
  await page.getByRole("button", { name: "Save Resume" }).click()
  await expect(page.locator('[data-sonner-toast][data-type="success"]')).toContainText("Resume saved")

  await card(page, label).getByRole("button", { name: "View PDF" }).click()
  const iframe = page.getByRole("dialog").locator("iframe")
  await expect(iframe).toHaveAttribute("src", new RegExp(`^${signedUrlPrefix}${userId}/`))

  // Headless Chromium won't render the PDF; prove the URL serves it inline.
  const res = await page.request.get((await iframe.getAttribute("src"))!)
  expect(res.status()).toBe(200)
  expect(res.headers()["content-type"]).toContain("application/pdf")
  expect(res.headers()["content-disposition"] ?? "").not.toContain("attachment")
})

test("a missing file shows File unavailable, not a broken viewer", async ({ page }) => {
  const { data: doc, error } = await admin()
    .from("documents")
    .select("label, s3_key")
    .eq("user_id", userId)
    .eq("label", "Frontend focus")
    .single()
  if (error) throw error

  await open(page, "/resumes")
  const view = card(page, doc.label!).getByRole("button", { name: "View PDF" })
  await view.click()
  await expect(page.getByRole("dialog").locator("iframe")).toHaveAttribute("src", new RegExp(`^${signedUrlPrefix}`))
  await page.getByRole("dialog").getByRole("button", { name: "Close" }).click()
  await expect(page.getByRole("dialog")).toBeHidden()

  await admin().storage.from(BUCKET).remove([doc.s3_key])
  const response = page.waitForResponse((r) => r.url().includes("/api/view-resume"))
  await view.click()
  expect((await response).status()).toBe(404)
  await expect(page.locator('[data-sonner-toast][data-type="error"]')).toContainText("File unavailable")
  await expect(page.getByRole("dialog")).toBeHidden()
})

test("a forged row pointing at another user's key gets no signed URL", async ({ page }) => {
  // The user's own RLS-bound client: RLS on documents checks user_id, not the key.
  const asUser = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  })
  const { error: signInError } = await asUser.auth.signInWithPassword({ email: E2E_EMAIL, password: E2E_PASSWORD })
  if (signInError) throw signInError
  const { data: forged, error } = await asUser
    .from("documents")
    .insert({ user_id: userId, type: "resume", filename: "a.pdf", s3_key: `resumes/${randomUUID()}/x/a.pdf` })
    .select("id")
    .single()
  if (error) throw error

  const res = await page.request.get(`/api/view-resume?documentId=${forged.id}`)
  expect(res.status()).toBe(403)
  expect(await res.json()).not.toHaveProperty("url")
})

test("cover letter PDF uploads and returns a download URL", async ({ page, heroAppId }) => {
  const res = await page.request.post("/api/pdf/cover-letter", {
    data: { applicationId: heroAppId, coverLetter: "Dear Hiring Team,\n\nI would love to join." },
  })
  expect(res.status()).toBe(200)
  const { downloadUrl } = await res.json()
  expect(downloadUrl).toContain(`/storage/v1/object/sign/${BUCKET}/cover_letters/${userId}/`)

  const file = await page.request.get(downloadUrl)
  expect(file.status()).toBe(200)
  expect(file.headers()["content-type"]).toContain("application/pdf")
  expect(file.headers()["content-disposition"]).toContain("attachment")
})
