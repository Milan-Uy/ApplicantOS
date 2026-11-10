# UI/UX Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make ApplicantOS a consistent, demo-ready portfolio app: shared shadcn primitives, complete feedback states, a polished job → resume → cover letter → kanban flow, working storage, and a self-resetting demo account.

**Architecture:** Eight increments, one branch + PR each (`ui/<n>-<slug>` off `master`). Task 1 builds a Playwright harness on a seeded demo user so every later task is verified end to end. Foundations (Task 2–3) land before any page work so pages are rebuilt once. AI calls are mocked in tests with `page.route`; everything else runs against the real Supabase project.

**Tech Stack:** Next.js 16 App Router · React 19 · Tailwind 4 · shadcn/ui + Radix · Supabase (Auth, Postgres, Storage) · Vercel AI SDK v6 · `@react-pdf/renderer` · sonner · `@playwright/test` + `@axe-core/playwright`

**Spec:** `docs/superpowers/specs/2026-11-07-ui-ux-overhaul-design.md`

## Global Constraints

- Read the relevant guide in `node_modules/next/dist/docs/` before using any Next.js API (Next 16 differs from training data) — notably `error.tsx`, `not-found.tsx`, server actions, route handlers.
- Dark-only. Primary `#5e6ad2`. Font Inter Variable with `cv01`, `ss03`. No light-mode tokens.
- Every user-facing route/action keeps the AGENTS.md security patterns: `getUser()` first, `.eq("user_id", user.id)` on every query, prefix-guard every storage key, 50 KB cap on AI text inputs, PDF + DOCX MIME whitelist, `timingSafeEqual` for bearer secrets.
- AI routes keep `checkRateLimit(user.id, { limit: 10, windowMs: 60_000, bucket: "ai" })` and `maxRetries: 3`.
- No DB schema changes. `documents.s3_key` keeps its name (now holds a Supabase Storage path).
- Each task ends with: `npx playwright test` green, `npm run lint` clean, `npm run build` succeeds, screenshots refreshed.
- axe: zero `serious`/`critical` violations on every route listed in `AXE_ROUTES`.
- At 390 px wide no route scrolls horizontally (`document.documentElement.scrollWidth <= 390`).
- New env vars: `DEMO_EMAIL` (live demo user), `E2E_EMAIL`, `E2E_PASSWORD` (test-only user, never the demo user). Removed (Task 4): `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET`.
- Tests never touch the live demo user. Playwright starts its own dev server on port 3100 with `DEMO_EMAIL=$E2E_EMAIL`, so inside tests the e2e user *is* "the demo user".
- Every bearer-secret check goes through `verifyBearer` (Task 1), which rejects a blank/unset secret.
- Shell: quote paths containing `(app)`, `(auth)`, `[id]`.

## Review Focus

1. **Demo reset blast radius** — a blank email or a lookup bug must never delete another user's rows or files; a failure mid-reset must not leave the demo empty. Expected: reset throws before any delete unless it resolved exactly one user with that exact email, and builds the new dataset before removing the old. (Tests in Task 1.)
2. **Demo account sabotage** — a visitor changes the demo email in Settings or the password via the Supabase client directly, breaking one-click login for everyone. Expected: profile updates are refused for the demo user; demo login needs no password, so a changed password breaks nothing. (Tests in Tasks 6 and 7.)
3. **Hostile or odd filenames** — `Résumé (final) v2.pdf`, `../../x.pdf`, a 300-char name. Expected: stored under a sanitised name inside `resumes/{uid}/`, never outside it. (Test in Task 4.)
4. **Failed create/edit loses the form** — a server error on a 17-field form. Expected: toast with the error, every typed value still in place. (Test in Task 3.)
5. **Cover-letter stream dies mid-way** — network drop or model error after partial text. The AI SDK's `toTextStreamResponse()` hides provider errors (HTTP 200, clean EOF, `onFinish` with `finishReason: "error"` — reproduced on `ai@6.0.146`). Expected: the HTTP body aborts, partial text stays in the editor, an error toast shows, nothing is persisted. (Tests in Task 5.)

Also pinned: interview-reminder cron skips the demo user (Task 8) — otherwise it emails `DEMO_EMAIL` daily. Unset `CRON_SECRET` must not open any cron route (Task 1 `verifyBearer`).

**Live gate (not testable in code):** a visitor must not be able to move the demo account to an address they control. Supabase only requires old-mailbox approval when email auto-confirm is off **and** "Secure email change" is on. During Task 7, in the Supabase dashboard: (1) Auth → "Confirm email" is enabled, (2) "Secure email change" is enabled, (3) live check — signed in as the e2e user, call `supabase.auth.updateUser({ email: "<a mailbox you control>" })` from the browser console, confirm only from the new mailbox, then `admin.getUserById` still shows the original email. Record all three in the PR.

---

### Task 1: Test harness + demo data reset

**Files:**
- Create: `playwright.config.ts`, `e2e/global-setup.ts`, `e2e/routes.ts`, `e2e/screens.spec.ts`, `e2e/a11y.spec.ts`, `e2e/demo-reset.spec.ts`
- Create: `src/lib/demo/seed-data.ts`, `src/lib/demo/reset.ts`, `src/lib/demo/is-demo.ts`, `src/lib/pdf/text-document-template.tsx`, `src/lib/verify-bearer.ts`, `e2e/verify-bearer.spec.ts`, `e2e/fixtures.ts`
- Modify: `src/app/api/cron/interview-reminder/route.ts`, `src/app/api/webhooks/n8n/job-discovery/route.ts`, `src/app/api/job-discovery/settings/route.ts` (switch to `verifyBearer`)
- Create: `src/lib/storage-keys.ts` (constants only in this task: `BUCKET = "documents"`)
- Modify: `package.json` (devDeps `@playwright/test`, `@axe-core/playwright`; script `"test": "playwright test"`), `.gitignore` (`/e2e/.auth`, `/test-results`, `/playwright-report`, `/screenshots/current`)

**Interfaces:**
- Produces: `resetDemoUser(admin: SupabaseClient, email: string, opts?: { password?: string }): Promise<{ userId: string }>` — `src/lib/demo/reset.ts`, no `server-only` import (Playwright imports it). Cron passes `DEMO_EMAIL` and no password (demo login is passwordless, Task 7); tests pass `E2E_EMAIL` + `E2E_PASSWORD`.
- Produces: `isDemoUser(user: { email?: string | null }): boolean` — case-insensitive compare with `process.env.DEMO_EMAIL`; `false` when the env var is unset/blank.
- Produces: `verifyBearer(request: Request, secret: string | undefined): boolean` — `false` when `secret` is unset or blank; otherwise length check + `timingSafeEqual` of `Authorization` against `Bearer ${secret}`.
- Produces: `ROUTES: { name: string; path: string }[]` and `AXE_ROUTES: string[]` (route names) in `e2e/routes.ts`. `[id]` in a path is a placeholder; the `heroAppId` fixture in `e2e/fixtures.ts` resolves it at test time by looking up `SEED_HERO_APP` (export from `seed-data.ts`, company `"Linear"`, role `"Product Engineer"`, status `"applied"`) for the e2e user — never at config load, because resets change ids.
- Produces: `resetForSpec()` in `e2e/fixtures.ts` — `resetDemoUser(admin(), E2E_EMAIL, { password: E2E_PASSWORD })`; every spec that mutates data calls it in `test.beforeAll`.
- Produces: storage state `e2e/.auth/e2e.json` (logged-in e2e user).

- [ ] **Step 1: Install and configure Playwright**
  `npm i -D @playwright/test @axe-core/playwright && npx playwright install chromium`. Load env with `process.loadEnvFile(".env.local")` at the top of the config. Config: `workers: 1`, `fullyParallel: false` (one shared server-side user — isolation by serial execution plus per-spec reset); `webServer: { command: "npx next dev -p 3100", url: "http://localhost:3100", reuseExistingServer: false, env: { DEMO_EMAIL: process.env.E2E_EMAIL! } }`; `use.baseURL: "http://localhost:3100"`; `globalSetup: "./e2e/global-setup.ts"`. Projects: `desktop` (1440×900, all specs) and `mobile` (390×844, `testMatch` only `screens`, `a11y`, `nav` — the read-only specs), both with `storageState: "e2e/.auth/e2e.json"`. Fail fast in the config if `E2E_EMAIL` is blank or equals `DEMO_EMAIL`.

- [ ] **Step 2: Write the failing reset-safety tests** (`e2e/demo-reset.spec.ts`, no page fixture)

```ts
test("refuses a blank email", async () => {
  await expect(resetDemoUser(admin(), "  ")).rejects.toThrow(/email/i)
})
test("seeds every status, resumes with files, AI results, discovered jobs", async () => {
  const { userId } = await resetForSpec()
  const { data: apps } = await admin().from("applications").select("status, auto_discovered").eq("user_id", userId)
  expect(new Set(apps!.map(a => a.status))).toEqual(new Set(["wishlist","applied","phone_screen","interview","offer","rejected"]))
  expect(apps!.filter(a => a.auto_discovered).length).toBeGreaterThanOrEqual(3)
  const keys = await listAllKeys(admin(), `resumes/${userId}`)
  expect(keys.filter(k => k.endsWith(".pdf")).length).toBe(SEED_RESUMES.length)
  const { data: docs } = await admin().from("documents").select("s3_key").eq("user_id", userId)
  for (const d of docs!) expect(keys).toContain(d.s3_key)    // every row points at a real file, no leftovers
})
test("is idempotent and leaves other users untouched", async () => {
  const before = await countRowsNotOwnedBy(e2eId)   // helper in the spec: count(applications) where user_id != e2e user
  await resetForSpec(); await resetForSpec()
  expect(await countRowsNotOwnedBy(e2eId)).toBe(before)
  const { count } = await admin().from("applications").select("*", { count: "exact", head: true }).eq("user_id", e2eId)
  expect(count).toBe(SEED_APPLICATIONS.length)
})
test("a failed upload leaves the previous dataset intact", async () => {
  await resetForSpec()
  const before = await snapshot(e2eId)               // helper: sorted application ids + document s3_keys
  await expect(resetDemoUser(admin(), E2E_EMAIL, { password: E2E_PASSWORD, failAt: "uploads" } as never)).rejects.toThrow()
  expect(await snapshot(e2eId)).toEqual(before)
})
test("a failed insert leaves the previous dataset intact", async () => {
  await resetForSpec()
  const before = await snapshot(e2eId)
  await expect(resetDemoUser(admin(), E2E_EMAIL, { password: E2E_PASSWORD, failAt: "inserts" } as never)).rejects.toThrow()
  expect(await snapshot(e2eId)).toEqual(before)
})
```

`failAt: "uploads" | "inserts"` is a test-only hook on `opts` that throws right after the first upload / first insert (`shortcut: test seam in prod code, remove if reset gains real transactions`).

`e2e/verify-bearer.spec.ts`: `verifyBearer(req("Bearer undefined"), undefined)` → `false`; `verifyBearer(req("Bearer "), "")` → `false`; `verifyBearer(req("Bearer s3cret"), "s3cret")` → `true`; `verifyBearer(req("Bearer s3creX"), "s3cret")` → `false`; no header → `false`.

- [ ] **Step 3: Run — expect FAIL** (`npx playwright test e2e/demo-reset.spec.ts` → "Cannot find module '@/lib/demo/reset'").

- [ ] **Step 4: Implement `seed-data.ts`, `text-document-template.tsx`, `reset.ts`, `is-demo.ts`**
  - `seed-data.ts`: pure data, exported as `SEED_APPLICATIONS`, `SEED_RESUMES`, `SEED_AI_RESULTS`, `SEED_HERO_APP`. ~10 applications covering all six statuses (one `interview` with `interview_date` = now + 2 days, two `offer`/`rejected`), 2 resumes (`label`, `filename`, `extracted_text` ≥ 1,500 chars of realistic content), 1 `resume_optimize` and 1 `cover_letter` `ai_results` on `SEED_HERO_APP`, 4 `auto_discovered: true` wishlist rows with `source: "online_jobs_ph"`. All dates are offsets in days from reset time, never absolute.
  - `TextDocumentPDF({ title, body }: { title: string; body: string })` — one-page-flow `@react-pdf/renderer` document; used to render each seeded resume's `extracted_text` into its PDF.
  - `resetDemoUser` order — build the new dataset before destroying the old, so any failure before step 5 leaves the previous demo intact:
    1. Assert `email` non-blank. Find exactly one user with that exact (case-insensitive) email via `admin.auth.admin.listUsers`; create with `email_confirm: true` if none; throw if more than one. If `opts.password` is set, set it.
    2. `createBucket(BUCKET, { public: false, fileSizeLimit: "10MB", allowedMimeTypes: [pdf, docx] })`, ignoring "already exists".
    3. List existing objects under `resumes/{id}/` and `cover_letters/{id}/` (remember them as `oldKeys`).
    4. Render every seed resume PDF and upload under a fresh prefix `resumes/{id}/seed-{runId}/…`; any upload error → remove what this run uploaded and throw.
    5. Record the user's current row ids (`oldAppIds`, `oldDocIds`). **Insert** the seed rows (new ids) pointing at the new keys, and upsert `job_discovery_settings` (`onConflict: "user_id"`). An insert error → delete the rows this run inserted, remove this run's uploads, throw (old dataset untouched).
    6. Delete old rows by id: `documents` `.in("id", oldDocIds)`, `applications` `.in("id", oldAppIds)` (cascades `ai_results` — that table has no `user_id`), each also `.eq("user_id", id)`. A failure here leaves old + new rows (duplicates, never empty); the next reset cleans them.
    7. Remove `oldKeys`. Return `{ userId }`.
    `shortcut: no transaction — a crash between 5 and 6 leaves duplicates until the next reset; serialise overlapping resets (cron + manual) with a lock row if that ever happens`.
  - `listAllKeys(admin: SupabaseClient, prefix: string): Promise<string[]>` (exported from `reset.ts`) — recursive, paginated `storage.list` walk returning leaf object paths only (entries with `id === null` are folders: recurse). Used for `oldKeys` and in tests.
  - `admin()` in tests = `createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })`.

- [ ] **Step 5: Run — expect PASS.**

- [ ] **Step 6: Global setup, routes, screenshots, axe**
  - `global-setup.ts`: `resetForSpec()`, then log in through `/login` with `E2E_EMAIL`/`E2E_PASSWORD` and save `e2e/.auth/e2e.json`.
  - `routes.ts`: every route — `/`, `/login`, `/signup`, `/dashboard`, `/applications`, `/applications/new`, `/applications/[id]`, `/applications/[id]/edit`, `/applications/[id]/resume`, `/applications/[id]/cover-letter`, `/resumes`, `/job-discovery`, `/settings`. Public routes run with empty storage state. `AXE_ROUTES` starts empty; each later task appends the routes it fixes.
  - `screens.spec.ts`: per route per project, `page.screenshot({ fullPage: true, path: \`screenshots/${label}/${project}/${name}.png\` })` where `label = process.env.SHOTS ?? "current"`; plus `expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width)` — mark known-failing routes with `test.fail()` and a `// fixed in Task N` comment.
  - `a11y.spec.ts`: for each name in `AXE_ROUTES`, `new AxeBuilder({ page }).analyze()` → no violation with impact `serious` or `critical`.

- [ ] **Step 7: Baseline** — `SHOTS=before npx playwright test e2e/screens.spec.ts`; commit `screenshots/before/` (the portfolio "before").

- [ ] **Step 8: Bearer checks** — switch the three existing secret-guarded routes to `verifyBearer(request, process.env.CRON_SECRET | N8N_WEBHOOK_SECRET)`; run `e2e/verify-bearer.spec.ts` → PASS.

- [ ] **Step 9: Commit** — `git commit -m "test: add Playwright harness, demo data reset, shared bearer check"`; add `DEMO_EMAIL`, `E2E_EMAIL`, `E2E_PASSWORD` to AGENTS.md env block and `npm test` to Commands.

---

### Task 2: Foundations — shadcn primitives, tokens, navigation

**Files:**
- Create: `components.json`, `src/components/ui/{button,input,textarea,select,card,dialog,alert-dialog,switch,tabs,label,tooltip}.tsx`, `src/components/navigation/nav-items.ts`
- Modify: `src/app/globals.css`, `src/components/ui/badge.tsx`, `src/components/navigation/{Sidebar,MobileNav}.tsx`, `src/app/(app)/dashboard/page.tsx` (drop stray `pb-24`)

**Interfaces:**
- Produces: shadcn components with their stock exports (`Button` with variants `default | secondary | outline | ghost | destructive | link`, sizes `sm | default | lg | icon`; `AlertDialog*`; `Select*`, etc.). Every later task uses these instead of raw `<button>`/`<input>` class strings.
- Produces: `NAV_ITEMS: { href: string; label: string; icon: LucideIcon }[]` and `isActive(pathname: string, href: string): boolean` in `nav-items.ts`.

- [ ] **Step 1: Init shadcn** — `npx shadcn@latest init` (Tailwind v4, `src/components/ui`, alias `@/components`), then `npx shadcn@latest add button input textarea select card dialog alert-dialog switch tabs label tooltip`. Restore `globals.css` from git and keep only what init needs that is new (the `tw-animate-css` import).

- [ ] **Step 2: Map tokens** — in `@theme`, add aliases so shadcn classes resolve to existing values: `--color-primary-foreground: var(--color-primary-fg)` (same for secondary, destructive, card, muted → `--color-muted-foreground: var(--color-muted-fg)`), `--color-popover: var(--color-surface-2)`, `--color-popover-foreground: var(--color-foreground)`. **Collision:** shadcn uses `accent` as a subtle hover surface; ours is bright `#7170ff`. In generated components replace `bg-accent`/`text-accent-foreground`/`hover:bg-accent` with `bg-surface-2`/`text-foreground`/`hover:bg-surface-2`. Leave `--color-accent` untouched.

- [ ] **Step 3: Focus + contrast** — global `:focus-visible { outline: 2px solid var(--color-ring); outline-offset: 2px }` for `a, button, [role=button], [tabindex]`. Raise `--color-fg-subtle` to the darkest grey with ≥ 4.5:1 contrast on both `#08090a` and `#0f1011`. Replace hex values in `badge.tsx` variants with tokens.

- [ ] **Step 4: Navigation** — Sidebar and MobileNav both import `NAV_ITEMS`/`isActive`; one active style for both (`bg-surface-2 text-foreground`, plus `aria-current="page"`). MobileNav toggle gets `aria-expanded` and `aria-controls`. Sidebar footer shows the user's name/email instead of the hardcoded "U / Account" (pass from `(app)/layout.tsx`).

- [ ] **Step 5: Test** — add to `e2e/nav.spec.ts`: on `/resumes`, exactly one nav link has `aria-current="page"` and its text is "Resumes" (desktop and mobile project; mobile opens the menu first). Run, expect PASS. Append `dashboard`, `settings` to `AXE_ROUTES` and fix until a11y passes for them.

- [ ] **Step 6: Verify + commit** — full suite, lint, build, `SHOTS=current` screenshots. `git commit -m "feat(ui): adopt shadcn primitives, map tokens, unify navigation"`.

---

### Task 3: Feedback system + shared application form

**Files:**
- Create: `src/app/error.tsx`, `src/app/not-found.tsx`, `src/app/(app)/error.tsx`, `src/app/(app)/not-found.tsx`, `src/components/EmptyState.tsx`, `src/components/StatCard.tsx`, `src/components/ConfirmDelete.tsx`, `src/components/applications/ApplicationForm.tsx`, `src/lib/format.ts`, `e2e/format.spec.ts`, `e2e/feedback.spec.ts`
- Create: `loading.tsx` for `applications/new`, `applications/[id]`, `applications/[id]/edit`, `applications/[id]/resume`, `applications/[id]/cover-letter`
- Modify: `src/app/(app)/applications/actions.ts`, `applications/new/page.tsx`, `applications/[id]/edit/page.tsx` (both become thin wrappers), `DeleteApplicationButton.tsx`, `ResumeCard.tsx`, `ApplicationsView.tsx`, `KanbanBoard.tsx`, `applications/[id]/page.tsx`, `dashboard/page.tsx`
- Delete: `applications/new/submit-button.tsx` (folded into `ApplicationForm`)

**Interfaces:**
- Consumes: Task 2 primitives.
- Produces: `createApplication(formData: FormData): Promise<{ error: string } | void>` — redirects to `/applications/${newId}` on success (insert with `.select("id").single()`); returns `{ error }` instead of throwing on DB error. `updateApplication(id, formData)` same contract, redirects to `/applications/${id}`.
- Produces: `<ApplicationForm mode="create" | "edit" initial?: Partial<Application> resumes: { id: string; label: string | null; filename: string }[] />` — submits via `onSubmit` + `startTransition` (not the `action` prop, so React does not reset fields), toasts `result.error`.
- Produces: `formatSalary(app: Pick<Application, "salary_min" | "salary_max" | "salary_currency" | "salary_period">): string | null` in `src/lib/format.ts`.
- Produces: `<EmptyState icon title description action? />`, `<StatCard label value hint? />`, `<ConfirmDelete title description onConfirm: () => Promise<void> trigger />` (AlertDialog; disables confirm while pending; toasts success/failure).

- [ ] **Step 1: Failing unit test** (`e2e/format.spec.ts`)

```ts
expect(formatSalary({ salary_min: 80000, salary_max: 100000, salary_currency: "USD", salary_period: "year" })).toBe("$80,000 – $100,000 / yr")
expect(formatSalary({ salary_min: 50000, salary_max: null, salary_currency: "PHP", salary_period: "month" })).toBe("₱50,000+ / mo")
expect(formatSalary({ salary_min: null, salary_max: null, salary_currency: null, salary_period: null })).toBeNull()
```
  Before writing it, read the two existing salary formatters (Kanban, detail page) and make these expectations match current output where it differs only cosmetically; the shared function must render what the detail page renders today.

- [ ] **Step 2: Failing e2e** (`e2e/feedback.spec.ts`)
  - "create lands on the new record": fill company/role on `/applications/new`, submit → URL matches `/applications/[0-9a-f-]{36}$` and heading shows the role.
  - "failed create keeps every value" (Review Focus 4): `page.route` the action POST to `/applications/new` → `fulfill({ status: 500 })`; fill 6 fields incl. textarea; submit → toast visible, all 6 values unchanged.
  - "delete asks first": on `/applications/[id]`, click Delete → `role="alertdialog"` visible; Cancel → still on page.
  - "unknown id → not-found": `/applications/00000000-0000-0000-0000-000000000000` shows the `(app)` not-found with a link to `/applications`.

- [ ] **Step 3: Run — expect FAIL.**

- [ ] **Step 4: Implement** the interfaces above. Every in-place mutation (kanban move, delete, resume save/delete, settings save) shows `toast.success`/`toast.error`; Kanban `useOptimistic` failure shows `toast.error("Couldn't move card")`. Detail page calls `notFound()` when the row is missing instead of redirecting. Redirect-style successes (create, edit) show no toast — the destination page is the feedback. `error.tsx` files offer "Try again" + link home; check the Next 16 docs for the `error.tsx` props.

- [ ] **Step 5: Run — expect PASS.** Append `applications`, `applications-new`, `application-detail`, `application-edit` to `AXE_ROUTES`; fix until green.

- [ ] **Step 6: Verify + commit** — `git commit -m "feat(ui): feedback system, shared application form, empty and error states"`.

---

### Task 4: Supabase Storage replaces S3

**Files:**
- Create: `src/lib/storage.ts` (`import "server-only"`), `e2e/storage-keys.spec.ts`, `e2e/upload.spec.ts`
- Modify: `src/lib/storage-keys.ts`, `src/app/api/upload/route.ts`, `src/app/api/parse-resume/route.ts`, `src/app/api/view-resume/route.ts`, `src/app/api/pdf/cover-letter/route.tsx`, `src/components/resumes/ResumeUpload.tsx`, `src/components/resumes/ResumeCard.tsx`, `src/app/(app)/resumes/actions.ts`
- Delete: `src/lib/s3.ts`; uninstall `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`

**Interfaces:**
- Produces (`storage-keys.ts`, pure): `BUCKET = "documents"`; `safeFilename(name: string): string` (NFKD → strip diacritics → lowercase → `[^a-z0-9.-]+` → `-`, collapse dashes, keep extension, max 100 chars, fallback `"file"`); `isOwnedKey(key: string, userId: string, prefix: "resumes" | "cover_letters"): boolean` (true only if key starts with `${prefix}/${userId}/` and has no `..`, `//`, or `\` segment).
- Produces (`storage.ts`): `storageAdmin()` → service-role `SupabaseClient` storage bucket handle.
- Produces: `POST /api/upload` → `{ key: string; token: string }`; client uploads with browser client `storage.from(BUCKET).uploadToSignedUrl(key, token, file, { contentType: file.type })`.
- Produces: `GET /api/view-resume` → `{ url }` or `404 { error: "File unavailable" }` when the object is missing.

- [ ] **Step 1: Failing unit tests** (`e2e/storage-keys.spec.ts`, Review Focus 3)

```ts
expect(safeFilename("Résumé (final) v2.pdf")).toBe("resume-final-v2.pdf")
expect(safeFilename("../../etc/passwd.pdf")).toBe("etc-passwd.pdf")
expect(safeFilename("a".repeat(300) + ".pdf").length).toBeLessThanOrEqual(100)
expect(isOwnedKey(`resumes/${uid}/x/a.pdf`, uid, "resumes")).toBe(true)
expect(isOwnedKey(`resumes/${uid}/../${other}/a.pdf`, uid, "resumes")).toBe(false)
expect(isOwnedKey(`resumes/${other}/x/a.pdf`, uid, "resumes")).toBe(false)
```

- [ ] **Step 2: Failing e2e** (`e2e/upload.spec.ts`): on `/resumes`, upload a PDF rendered from `TextDocumentPDF` in the test (write to `test-results/`) → review step shows text containing the rendered body → Save → new card appears with toast; "View PDF" opens a dialog whose iframe `src` is a Supabase signed URL. Second test: a seeded document whose object was removed via `admin().storage.remove` → clicking "View PDF" shows "File unavailable" (no broken iframe). Third test (forged row): as the e2e user, insert a `documents` row through the **browser** Supabase client (`page.evaluate`) whose `s3_key` is `resumes/<another-user-uuid>/x/a.pdf` → `GET /api/view-resume?documentId=<that id>` returns 403 and no signed URL.

- [ ] **Step 3: Run — expect FAIL.**

- [ ] **Step 4: Implement.** Upload route: same auth + MIME whitelist, key `resumes/${user.id}/${randomUUID()}/${safeFilename(filename)}`, `createSignedUploadUrl(key)`. Parse route: `isOwnedKey` guard, `download(key)`, reject `blob.size > 10 MB`, rest unchanged. View route: after the row-ownership query, `isOwnedKey(document.s3_key, user.id, "resumes")` else 403 (row ownership does not prove key ownership — RLS on `documents` checks only `user_id`, and the service-role client bypasses Storage RLS); then `createSignedUrl(document.s3_key, 300)`. PDF route: `upload(key, pdfBuffer, { contentType: "application/pdf" })` under `cover_letters/${user.id}/…`, then `createSignedUrl(key, 3600, { download: filename })`. `saveDocument`: replace the `startsWith` check with `isOwnedKey`. PDF iframe gets `title`; ResumeCard's PDF modal uses `Dialog`.

- [ ] **Step 5: Run — expect PASS.** Append `resumes` to `AXE_ROUTES`.

- [ ] **Step 6: Docs + commit** — AGENTS.md: storage section (bucket `documents`, server-signed URLs, `isOwnedKey`), remove AWS env vars and S3 from the stack line. `git commit -m "feat(storage): move resume and cover letter files to Supabase Storage"`.

---

### Task 5: Demo flow — resume picker, staged AI progress, streamed cover letter

**Files:**
- Create: `src/components/applications/ResumePicker.tsx`, `src/app/(app)/applications/[id]/cover-letter/actions.ts`, `src/lib/read-text-stream.ts`, `src/lib/ai/text-stream.ts`, `e2e/read-text-stream.spec.ts`, `e2e/text-stream.spec.ts`, `e2e/ai-flow.spec.ts`
- Modify: `src/lib/ai/cover-letter.ts`, `src/app/api/ai/cover-letter/route.ts`, `applications/[id]/resume/{page,client}.tsx`, `applications/[id]/cover-letter/{page,client}.tsx`, `src/app/(app)/applications/actions.ts`

**Interfaces:**
- Produces: `setApplicationResume(applicationId: string, resumeId: string): Promise<{ error?: string }>` in `applications/actions.ts` — verifies both rows belong to `user.id` (document `type = "resume"`), updates `applications.resume_id`, `revalidatePath` of both AI pages.
- Produces: `<ResumePicker applicationId currentResumeId resumes />` — `Select`; on change calls `setApplicationResume`, toasts, `router.refresh()`. Empty list → link to `/resumes`.
- Produces: `streamCoverLetter(params) : StreamTextResult` replaces `generateCoverLetter` in `lib/ai/cover-letter.ts` (same params; `streamText` with `maxRetries: 3`).
- Produces: `textStreamOrAbort(fullStream: AsyncIterable<TextStreamPart<ToolSet>>): ReadableStream<Uint8Array>` in `src/lib/ai/text-stream.ts` — enqueues encoded `text-delta` parts; calls `controller.error(...)` — so the HTTP body aborts instead of ending cleanly — on an `error` part, a thrown iterator, a `finish` part whose `finishReason !== "stop"` (`length`, `content-filter`, `error`, …), or the iterator ending without any `finish` part. Closes normally only after `finish` with `stop`. Do **not** use `toTextStreamResponse()`: it drops error parts and ends the body normally (verified on `ai@6.0.146`).
- Produces: `POST /api/ai/cover-letter` → `new Response(textStreamOrAbort(result.fullStream), { headers: { "content-type": "text/plain; charset=utf-8" } })`; validation/rate-limit errors stay JSON with the same status codes. Persists `ai_results` in `onFinish` only when `finishReason === "stop"`.
- Produces: `readTextStream(res: Response, onText: (full: string) => void): Promise<string>` — reads `res.body` with `TextDecoder`, calls `onText` with the accumulated text per chunk, resolves the full text, rejects if the stream errors.
- Produces: `saveCoverLetter(applicationId: string, coverLetter: string): Promise<{ error?: string }>` — ownership check, 50 KB cap, updates the latest `cover_letter` `ai_results` row's `result` (inserts if none).

- [ ] **Step 1: Failing unit tests** (`e2e/read-text-stream.spec.ts`): a `Response` over a `ReadableStream` enqueuing `"Dear "`, `"Hiring "`, `"Team"` → `onText` called with `"Dear "`, `"Dear Hiring "`, `"Dear Hiring Team"`; resolves `"Dear Hiring Team"`. A stream that enqueues `"Dear "` then `controller.error(new Error("drop"))` → rejects, and the last `onText` value was `"Dear "`.

  `e2e/text-stream.spec.ts` (server side, the real SDK failure path): `streamText` with `MockLanguageModelV3` from `ai/test` whose `doStream` emits `stream-start`, `text-start`, `text-delta "Dear Hiring "`, then `{ type: "error", error: new Error("provider dropped") }`; pipe `textStreamOrAbort(result.fullStream)` into `new Response(...)` → `await res.text()` **rejects**; and a spy `onFinish` sees `finishReason === "error"` (so the route's `=== "stop"` guard skips persistence). Same partial text, then a `finish` part with `finishReason: "length"` and no error part → `res.text()` **rejects** (repeat for `"content-filter"`). Happy path (`finish` part with reason `stop`) → `res.text()` resolves `"Dear Hiring Team"`.

- [ ] **Step 2: Failing e2e** (`e2e/ai-flow.spec.ts`, AI endpoints mocked with `page.route`)
  - "picker switches resume": on `/applications/[id]/resume` choose the second seeded resume → toast; reload → picker shows it.
  - "optimise shows staged progress then results": route returns the seeded `ResumeOptimizeResult` after 1.5 s delay → progress region (`role="status"`) visible with stage text, then score + suggestions; "Copy" on a suggestion puts its `rewritten` text on the clipboard (grant `clipboard-read`).
  - "cover letter streams and edits persist": route fulfils `text/plain` body → editor contains it; edit text, click Save → toast; reload → edited text present.
  - "stream failure keeps partial text" (Review Focus 5): `page.route` can't cut a body mid-stream, so `page.addInitScript` wraps `window.fetch`: for `/api/ai/cover-letter` it returns `new Response(stream)` where the stream enqueues `"Dear Hiring "` then calls `controller.error(new Error("drop"))` → editor contains `"Dear Hiring "`, `toast.error` visible, reload shows the previously saved letter, not the partial one.
  - "edit link goes to edit": the AI pages' "Edit application" link has `href` `/applications/[id]/edit`.

- [ ] **Step 3: Run — expect FAIL.**

- [ ] **Step 4: Implement.** Resume client: replace "Analyzing…" with a skeleton of the results layout plus `role="status"` text cycling `"Reading the job description" → "Matching keywords" → "Rewriting bullet points"` on 2 s timers, holding the last stage until the response arrives. Copy buttons per suggestion and "Copy all rewrites". Cover-letter client: stream into the editor via `readTextStream`; Generate disabled while streaming; "Save" (enabled when dirty) calls `saveCoverLetter`; tone buttons get `aria-pressed`. Both AI pages render `ResumePicker` in the header.

- [ ] **Step 5: Run — expect PASS.** Append `application-resume`, `application-cover-letter` to `AXE_ROUTES`.

- [ ] **Step 6: Commit** — `git commit -m "feat(ai): resume picker, staged optimise progress, streamed and saved cover letters"`.

---

### Task 6: Job Discovery rebuild + remaining app pages

**Files:**
- Modify: `src/app/(app)/job-discovery/{page,client}.tsx` (split `client.tsx` into `KeywordsEditor.tsx`, `DiscoveredJobCard.tsx` beside it), `src/app/(app)/dashboard/page.tsx`, `src/app/(app)/resumes/page.tsx`, `src/app/(app)/settings/{page,actions,profile-form}.tsx`
- Create: `e2e/pages.spec.ts`

**Interfaces:**
- Consumes: `StatCard`, `EmptyState`, `isDemoUser`, Task 2 primitives.
- Produces: `updateProfile` returns `{ error: "Profile changes are disabled for the demo account" }` when `isDemoUser(user)`.

- [ ] **Step 1: Failing e2e** (`e2e/pages.spec.ts`)
  - "job discovery is honest": `/job-discovery` shows text "Automation paused"; no text "Next run" or "Ready"; ≥ 3 discovered cards.
  - "dismiss is undoable": click Dismiss on a card → card gone + toast with "Undo"; click Undo → card back; reload → card still there. Dismiss again, wait for the toast to close → reload → card gone.
  - "demo profile is locked" (Review Focus 2): on `/settings` change email, Save → error toast with the demo message; reload → email unchanged.
  - grep check in the same spec via `fs`: `job-discovery/*.tsx` contains no `style={{` and no `onMouseEnter`.

- [ ] **Step 2: Run — expect FAIL.**

- [ ] **Step 3: Implement.** Job Discovery: Tailwind + primitives only; remove the enable `Switch`, "Ready" and "Next run" copy, and the manual-trigger empty-state text; add a callout "Automation paused — the n8n pipeline that fed this page has been retired; showing previously discovered jobs." Keyword editor stays functional (labelled input, chips are buttons with `aria-label="Remove {keyword}"`). Dismiss: optimistic hide, `toast("Job dismissed", { action: { label: "Undo" }, duration: 5000 })`; call `dismissJob(id)` in the toast's `onAutoClose`/`onDismiss` unless undone. Dashboard/resumes/settings: `StatCard`, `EmptyState`, `Card`, `Button` throughout; settings labels use `Label htmlFor`.

- [ ] **Step 4: Run — expect PASS.** Append `job-discovery` to `AXE_ROUTES`.

- [ ] **Step 5: Commit** — `git commit -m "feat(ui): rebuild job discovery on primitives with paused state; polish remaining pages"`.

---

### Task 7: Landing + auth

**Files:**
- Modify: `src/app/page.tsx` (split sections into `src/components/landing/*.tsx` as you go), `src/app/(auth)/{login,signup}/page.tsx`, `src/app/(auth)/actions.ts`, `src/app/globals.css` (remove unused keyframes)
- Create: `e2e/landing.spec.ts`

**Interfaces:**
- Produces: `signInAsDemo(): Promise<{ error: string } | void>` in `(auth)/actions.ts` — passwordless, so a visitor changing the demo password via `auth.updateUser` breaks nothing: service-role `admin.auth.admin.generateLink({ type: "magiclink", email: DEMO_EMAIL })` → take `properties.hashed_token` → cookie-bound server client (`lib/supabase/server.ts`) `auth.verifyOtp({ token_hash, type: "email" })` (check current supabase-js docs for the exact `type`) → `redirect("/dashboard")`. Returns `{ error }` if `DEMO_EMAIL` is blank or either call fails. No email is sent.

- [ ] **Step 1: Failing e2e** (`e2e/landing.spec.ts`, empty storage state)
  - "Try the demo logs in": click "Try the demo" on `/` → URL `/dashboard` within 5 s.
  - "demo login survives a password change" (Review Focus 2): `admin().auth.admin.updateUserById(e2eId, { password: randomUUID() })`, then click "Try the demo" → `/dashboard`. `afterAll` restores `E2E_PASSWORD`.
  - "login is quick": log in on `/login` with `E2E_EMAIL`/`E2E_PASSWORD` → `/dashboard` within 1.5 s of clicking submit.
  - "calm motion": on `/`, count elements whose computed `animation-iteration-count` is `infinite` → ≤ 2.
  - Remove the `test.fail()` markers on `/`, `/login`, `/signup` in `screens.spec.ts` (390 px no horizontal scroll must now pass).

- [ ] **Step 2: Run — expect FAIL.**

- [ ] **Step 3: Implement.** Landing: responsive grid (bento collapses to one column < `md`), preview sidebar hidden < `md`, nav padding responsive; inline `style` objects → Tailwind/tokens except genuinely computed values; keep at most two infinite animations (keep the hero glow and one other), keep `prefers-reduced-motion` override. "Try the demo" button beside "Get Started", calling `signInAsDemo` with pending state. Login: redirect immediately after success (keep at most a 400 ms success state). Auth forms use primitives with `Label htmlFor`.

- [ ] **Step 4: Run — expect PASS.** Append `landing`, `login`, `signup` to `AXE_ROUTES`.

- [ ] **Step 5: Commit** — `git commit -m "feat(landing): responsive calmer landing, quick login, one-click demo"`.

---

### Task 8: Demo reset cron, manual reset, wrap-up

**Files:**
- Create: `src/app/api/cron/demo-reset/route.ts`, `scripts/demo-reset.mjs`, `e2e/cron.spec.ts`
- Modify: `vercel.json`, `src/lib/supabase/middleware.ts` (only if `/api/cron/*` isn't already public — it is; verify), `src/app/api/cron/interview-reminder/route.ts`, `package.json` (`"demo:reset": "node --env-file=.env.local scripts/demo-reset.mjs"`), `AGENTS.md`, `STATUS.md`

**Interfaces:**
- Consumes: `resetDemoUser`, `isDemoUser`.
- Produces: `GET /api/cron/demo-reset` — `verifyBearer(request, process.env.CRON_SECRET)` else 401; `resetDemoUser(admin, process.env.DEMO_EMAIL!)` (no password); returns `{ ok: true, userId }`, or `500 { ok: false }` with the error logged if reset throws.

- [ ] **Step 1: Failing e2e** (`e2e/cron.spec.ts`, `request` fixture; the test server's `DEMO_EMAIL` is the e2e user): no auth header → 401; `Bearer undefined` → 401; wrong secret of the same length → 401; correct secret → 200 `{ ok: true }` and the e2e user's application count equals `SEED_APPLICATIONS.length`.

- [ ] **Step 2: Run — expect FAIL.**

- [ ] **Step 3: Implement.** Route as above. `vercel.json` adds `{ "path": "/api/cron/demo-reset", "schedule": "0 7 * * *" }` (before the 08:00 reminder run). `scripts/demo-reset.mjs`: exit non-zero if `CRON_SECRET` is blank, then `fetch(\`${process.env.NEXT_PUBLIC_APP_URL}/api/cron/demo-reset\`, { headers: { authorization: \`Bearer ${process.env.CRON_SECRET}\` } })`, prints the JSON, exits non-zero on non-200. Interview-reminder: skip users where `isDemoUser` is true.

- [ ] **Step 4: Run — expect PASS.**

- [ ] **Step 5: Final verification** — full suite (desktop + mobile), `AXE_ROUTES` now contains every route in `ROUTES`, no `test.fail()` left in `screens.spec.ts`, lint, build. `SHOTS=after npx playwright test e2e/screens.spec.ts`; copy the desktop + mobile shots of landing, dashboard, applications, application-resume, application-cover-letter, job-discovery into `docs/screenshots/`.

- [ ] **Step 6: Docs + commit** — AGENTS.md: demo account (env vars, `npm run demo:reset`, daily cron, `isDemoUser` guards), testing (`npm test`, AI mocked via `page.route`, `AXE_ROUTES`), remove "No test suite exists yet". STATUS.md: mark storage migration, demo account, UI overhaul complete; Job Discovery "paused (n8n retired)". `git commit -m "feat(demo): daily demo reset cron and manual reset; docs"`.

---

## Click-count targets (done criterion)

| Flow | Before | After |
|------|--------|-------|
| Add application, see it | New → fill → Submit → (lands on list) → click card = 3 clicks + form | New → fill → Submit = 2 clicks + form |
| Change resume used by AI | Edit → resume select → Save → back to AI page = 4+ clicks | Picker on AI page = 1 change |
| Keep an edited cover letter | Impossible (edits lost) | Save = 1 click |

## Review log

- Review diff r1 2026-11-08, Codex (Task 1, ui/1-test-harness): revise; 3 fixed, 0 rejected, 0 deferred. Session 01a1bb7f-adc8-76f2-970b-7bdab9282123.
- Review diff r1 2026-11-09, Codex (Task 4, ui/4-storage): revise; 1 fixed (control chars in storage keys bypassed isOwnedKey -> allowlist), 0 rejected, 1 deferred (overlapping demo resets, pre-existing, Task 8). Session 01a1bc03-54ea-7821-9349-c6f62e9edff4.
- Review did not run 2026-11-09 (Task 4 r2): Codex usage limit; re-run on 614d599 after reset.
- Review diff r2 2026-11-09, Codex gpt-6.1-sol (Task 4, ui/4-storage @ 614d599): approve; 1 fixed (minor: PDF dialog close now restores focus to View PDF), 0 rejected, 0 deferred. Session 01a1beca-06bb-78b1-bc4a-c782bbf140f2.
- Review did not run 2026-11-09 (Tasks 2+3, diff 44af363..4f20af2, after merge): Codex usage limit hit mid-review, resets 3:11 AM. Session 01a1bc05-c723-7a22-81ca-f6faa3c9bd04.
- Review diff r1 2026-11-09, Codex gpt-6.1-sol (Tasks 2+3, 44af363..4f20af2, after merge): revise; 2 fixed, 0 rejected, 1 deferred. Session 01a1beca-3d3a-7fd3-806c-29f9436aae2d.
- Review diff r1 2026-11-09, Codex gpt-6.1-sol (Task 5, ui/5-demo-flow @ 46bed82): revise; 3 fixed (save failure looked saved; cancelled stream still persisted; Save/Regenerate race), 0 rejected, 0 deferred. Session 01a1bf0a-1682-7f03-b7fa-0e7026cba9a5.
- Review diff r2 2026-11-09, Codex gpt-6.1-sol (Task 5, ui/5-demo-flow @ c1d13f3): revise; 2 fixed (resume switch mid-request; 50 KB cap bypass via tone and array input, pre-existing), 1 rejected (disconnect during insert saves the complete requested letter, re-graded minor), 0 deferred. Session 01a1bf16-c3ec-7ae1-8d0c-74f25300dcd5.
- Review diff r1 2026-11-09, Codex (Task 6, ui/6-job-discovery @ 1579790): revise; 3 fixed (pending dismissal resurrected after navigation; dismiss deleted non-wishlist applications, pre-existing; demo-lock test never submitted the email), 0 rejected, 0 deferred. Session 01a1c013-f94f-7aa0-8802-514d88b46a7a.
- Review r2 skipped 2026-11-09 (Task 6): r1 left no blocker/major after disposition; all 3 fixes small and each covered by a RED→GREEN test. An r2 attempt on e10c227 was killed by low memory first.
- Review diff r1 2026-11-10, Codex gpt-6.1-sol (Task 7, ui/7-landing-auth @ dcd4a66): revise; 1 fixed (server-side demo verify shared one per-IP Supabase bucket -> browser verifies), 0 rejected, 2 deferred/gated (F1 live email-takeover gate; F3 pre-existing signup-with-confirmation lands on /login silently). Session 01a1c52f-d36d-74e2-967a-efd01bc555dd.
- Review diff r2 2026-11-10, Codex gpt-6.1-sol (Task 7, ui/7-landing-auth @ e38f20b): revise; 2 fixed (concurrent demo logins voided each other's token -> retry with a fresh token; minor: failed login cleared the fields), 0 rejected, 0 deferred (r1 F1 gate and F3 defer still stand). Session 01a1c551-8570-7e52-81e8-e29e8c4af82d.
- Review diff r1 2026-11-10, Codex gpt-6.1-sol (Task 8, ui/8-demo-reset @ 96ab44c): revise; 1 fixed (reset lock failed open on an unreadable lock and took over stale locks non-atomically -> slot-keyed locks), 2 rejected (reminder-test preflight race re-graded minor: worst case is a real user's correct reminder sent early; live email-takeover gate already run 2026-11-10 on PR #24), 0 deferred. Session 01a1c591-1efc-7ab2-aa74-466dafb753b1.
- Review diff r2 2026-11-10, Codex gpt-6.1-sol (Task 8, ui/8-demo-reset @ 4342063): revise; 0 fixed, 0 rejected, 1 deferred (pre-existing: interview-reminder ignores Resend's error result and marks the reminder sent). Session 01a1c5af-46cf-74b3-86da-39a2562c2f57.
