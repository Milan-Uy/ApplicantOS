import type { Page } from "@playwright/test"
import { SEED_AI_RESULTS } from "@/lib/demo/seed-data"
import type { ResumeOptimizeResult } from "@/types/database"
import { test, expect, admin, resetForSpec } from "./fixtures"

let userId: string

test.beforeAll(async () => {
  ;({ userId } = await resetForSpec())
})

// Later specs screenshot this user's data: don't leave edits behind.
test.afterAll(async () => {
  await resetForSpec()
})

async function open(page: Page, path: string) {
  await page.goto(path)
  await page.waitForLoadState("networkidle")
}

async function resumeId(label: string) {
  const { data, error } = await admin().from("documents").select("id").eq("user_id", userId).eq("label", label).single()
  if (error) throw error
  return data.id as string
}

// Each test sets its own resume link, so order doesn't matter (the picker test changes it).
async function linkResume(appId: string, label = "Frontend focus") {
  const { error } = await admin().from("applications").update({ resume_id: await resumeId(label) }).eq("id", appId)
  if (error) throw error
}

const toast = (page: Page, type: "success" | "error") => page.locator(`[data-sonner-toast][data-type="${type}"]`)
// The OS clipboard may hand back CRLF (Windows).
const clipboard = (page: Page) => page.evaluate(() => navigator.clipboard.readText()).then((t) => t.replace(/\r\n/g, "\n"))
const editor = (page: Page) => page.getByRole("textbox", { name: "Cover letter" })

test("picker switches resume", async ({ page, heroAppId }) => {
  await linkResume(heroAppId)
  await open(page, `/applications/${heroAppId}/resume`)
  const picker = page.getByRole("combobox", { name: "Resume" })
  await expect(picker).toHaveText("Frontend focus")
  await picker.click()
  await page.getByRole("option", { name: "Full-stack focus" }).click()
  await expect(toast(page, "success")).toContainText("Resume updated")

  // Without a reload, the next AI call must already send the new resume's text.
  await expect(picker).toBeEnabled()
  let sent = ""
  await page.route("**/api/ai/resume-optimize", async (route) => {
    sent = route.request().postDataJSON().resumeText
    await route.fulfill({ json: SEED_AI_RESULTS[0].result })
  })
  await page.getByRole("button", { name: "Re-analyze" }).click()
  await expect.poll(() => sent).toContain("Full-Stack Engineer")

  await page.reload()
  await expect(page.getByRole("combobox", { name: "Resume" })).toHaveText("Full-stack focus")
})

test("optimise shows staged progress then results", async ({ page, context, heroAppId }) => {
  await linkResume(heroAppId)
  await context.grantPermissions(["clipboard-read", "clipboard-write"])
  // Distinct from the seeded result, so the assertion proves the new one rendered.
  const seeded = SEED_AI_RESULTS[0].result as ResumeOptimizeResult
  const fresh: ResumeOptimizeResult = { ...seeded, matchScore: 91 }
  await page.route("**/api/ai/resume-optimize", async (route) => {
    await new Promise((r) => setTimeout(r, 1500))
    await route.fulfill({ json: fresh })
  })

  await open(page, `/applications/${heroAppId}/resume`)
  await page.getByRole("button", { name: "Re-analyze" }).click()
  const status = page.getByRole("status").filter({ hasText: "Reading the job description" })
  await expect(status).toBeVisible()
  await expect(page.getByText("91", { exact: true })).toBeVisible()
  await expect(status).toBeHidden()
  await expect(page.getByText(fresh.suggestions[0].rewritten)).toBeVisible()

  await page.getByRole("button", { name: "Copy rewrite 1" }).click()
  expect(await clipboard(page)).toBe(fresh.suggestions[0].rewritten)
  await page.getByRole("button", { name: "Copy all rewrites" }).click()
  expect(await clipboard(page)).toBe(
    fresh.suggestions.map((s) => s.rewritten).join("\n\n")
  )
})

test("cover letter streams and edits persist", async ({ page, heroAppId }) => {
  await linkResume(heroAppId)
  const letter = "Dear Hiring Team,\n\nStreamed letter body."
  await page.route("**/api/ai/cover-letter", (route) =>
    route.fulfill({ status: 200, contentType: "text/plain; charset=utf-8", body: letter })
  )

  await open(page, `/applications/${heroAppId}/cover-letter`)
  await expect(page.getByRole("button", { name: "Formal" })).toHaveAttribute("aria-pressed", "true")
  await page.getByRole("button", { name: "Regenerate" }).click()
  await expect(editor(page)).toHaveValue(letter)

  const save = page.getByRole("button", { name: "Save", exact: true })
  const edited = `${letter}\n\nEdited ${Date.now()}`
  await editor(page).fill(edited)
  await expect(save).toBeEnabled()
  await save.click()
  await expect(toast(page, "success")).toContainText("Cover letter saved")
  await page.reload()
  await expect(editor(page)).toHaveValue(edited)
})

test("stream failure keeps partial text", async ({ page, heroAppId }) => {
  await linkResume(heroAppId)
  await open(page, `/applications/${heroAppId}/cover-letter`)
  const saved = await editor(page).inputValue()
  expect(saved).not.toBe("")

  // page.route can't cut a body mid-stream: wrap fetch so the body errors after the first chunk.
  await page.addInitScript(() => {
    const real = window.fetch
    window.fetch = (input, init) => {
      if (!String(input instanceof Request ? input.url : input).includes("/api/ai/cover-letter")) return real(input, init)
      let pulls = 0
      const body = new ReadableStream<Uint8Array>({
        pull(c) {
          if (pulls++ === 0) c.enqueue(new TextEncoder().encode("Dear Hiring "))
          else c.error(new Error("drop"))
        },
      })
      return Promise.resolve(new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } }))
    }
  })
  await open(page, `/applications/${heroAppId}/cover-letter`)
  await page.getByRole("button", { name: "Regenerate" }).click()
  await expect(editor(page)).toHaveValue("Dear Hiring ")
  await expect(toast(page, "error")).toBeVisible()

  await page.reload()
  await expect(editor(page)).toHaveValue(saved)
})

test("edit link goes to edit", async ({ page, heroAppId }) => {
  for (const tool of ["resume", "cover-letter"]) {
    await open(page, `/applications/${heroAppId}/${tool}`)
    await expect(page.getByRole("link", { name: /Edit application/ })).toHaveAttribute(
      "href",
      `/applications/${heroAppId}/edit`
    )
  }
})

test("cover-letter route rejects non-string inputs that would dodge the size cap", async ({ page, heroAppId }) => {
  const res = await page.request.post("/api/ai/cover-letter", {
    data: { applicationId: heroAppId, jobDescription: "JD", resumeText: ["x".repeat(60 * 1024)] },
  })
  expect(res.status()).toBe(400)
})
