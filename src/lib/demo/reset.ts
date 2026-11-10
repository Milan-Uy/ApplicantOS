// No "server-only" import: Playwright imports this module directly.
import { randomUUID } from "crypto"
import { createElement, type ReactElement } from "react"
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { BUCKET } from "@/lib/storage-keys"
import { TextDocumentPDF } from "@/lib/pdf/text-document-template"
import {
  SEED_AI_RESULTS,
  SEED_APPLICATIONS,
  SEED_DISCOVERY_KEYWORDS,
  SEED_HERO_APP,
  SEED_RESUMES,
} from "@/lib/demo/seed-data"

const PDF = "application/pdf"
const DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const PAGE = 1000
const DAY = 86_400_000
// Longer than any Vercel function may run, so only a crashed run's lock ever goes stale.
const LOCK_TTL = 15 * 60_000

interface ResetOptions {
  password?: string
  // shortcut: test seam in prod code, remove if reset gains real transactions
  failAt?: "uploads" | "inserts"
}

/** The id of the one user with exactly this email (case-insensitive), null if none; throws on blank or ambiguous. */
export async function findUserId(admin: SupabaseClient, email: string): Promise<string | null> {
  const target = email.trim().toLowerCase()
  if (!target) throw new Error("Demo reset needs a non-blank email")
  const matches: string[] = []
  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: PAGE })
    if (error) throw error
    for (const u of data.users) if (u.email?.toLowerCase() === target) matches.push(u.id)
    if (data.users.length < PAGE) break
  }
  if (matches.length > 1) throw new Error(`Demo reset found ${matches.length} users with that email`)
  return matches[0] ?? null
}

/** Every object path under `prefix` (folders walked recursively), as full keys. */
export async function listAllKeys(admin: SupabaseClient, prefix: string): Promise<string[]> {
  const keys: string[] = []
  for (let offset = 0; ; offset += PAGE) {
    const { data, error } = await admin.storage.from(BUCKET).list(prefix, { limit: PAGE, offset })
    if (error) throw error
    for (const entry of data) {
      const path = `${prefix}/${entry.name}`
      if (entry.id === null) keys.push(...(await listAllKeys(admin, path)))
      else keys.push(path)
    }
    if (data.length < PAGE) break
  }
  return keys
}

/**
 * Replaces the user's data with the seed dataset. The new dataset is built before the old one is
 * removed, so a failure before the final deletes leaves the previous demo intact.
 * Overlapping resets of the same user are refused ("already running").
 * shortcut: no transaction — a crash between insert and delete leaves duplicates until the next reset.
 */
export async function resetDemoUser(
  admin: SupabaseClient,
  email: string,
  opts: ResetOptions = {}
): Promise<{ userId: string }> {
  const { password, failAt } = opts

  // 1. Resolve exactly one user.
  let userId = await findUserId(admin, email)
  if (!userId) {
    const { data, error } = await admin.auth.admin.createUser({ email: email.trim(), email_confirm: true, password })
    if (error) throw error
    userId = data.user.id
  } else if (password) {
    // Only repair a wrong password: setting it revokes the user's sessions (e.g. the e2e storage state).
    const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: { persistSession: false },
    })
    const { error } = await anon.auth.signInWithPassword({ email: email.trim(), password })
    if (error?.code === "invalid_credentials") {
      const { error: updateError } = await admin.auth.admin.updateUserById(userId, { password })
      if (updateError) throw updateError
    } else if (error) {
      throw error
    }
  }
  // A blank id would turn every prefix below into "resumes/" — every user's files.
  if (!UUID.test(userId)) throw new Error("Demo reset resolved an invalid user id")

  // 2. Bucket.
  const { error: bucketError } = await admin.storage.createBucket(BUCKET, {
    public: false,
    fileSizeLimit: "10MB",
    allowedMimeTypes: [PDF, DOCX],
  })
  if (bucketError && !/already exists/i.test(bucketError.message)) throw bucketError

  // 3. One reset per user at a time: overlapping runs would each delete the other's new rows.
  const lock = await acquireLock(admin, userId)
  try {
    // A visitor can enroll a factor on the shared account; drop it so demo login stays one click.
    const { data: mfa, error: mfaError } = await admin.auth.admin.mfa.listFactors({ userId })
    if (mfaError) throw mfaError
    for (const f of mfa.factors) await must(admin.auth.admin.mfa.deleteFactor({ id: f.id, userId }))

    await replaceDataset(admin, userId, failAt)
  } finally {
    await admin.storage.from(BUCKET).remove([lock])
  }
  return { userId }
}

/** Takes the user's reset lock: a Storage object uploaded with upsert: false fails if it already exists. */
async function acquireLock(admin: SupabaseClient, userId: string): Promise<string> {
  const key = `locks/demo-reset/${userId}`
  const storage = admin.storage.from(BUCKET)
  // The body is the start time; the content type only satisfies the bucket's PDF/DOCX whitelist.
  const take = () => storage.upload(key, new Date().toISOString(), { contentType: PDF, upsert: false })
  const taken = (error: { message: string } | null) => !!error && /already exists/i.test(error.message)

  let { error } = await take()
  if (taken(error)) {
    const { data } = await storage.download(key)
    const started = Date.parse((await data?.text()) ?? "")
    // A run killed by a function timeout never releases its lock.
    // shortcut: two runs taking over the same stale lock can both proceed; fine for one daily cron + rare manual runs.
    if (!(Date.now() - started < LOCK_TTL)) {
      await storage.remove([key])
      ;({ error } = await take())
    }
  }
  if (taken(error)) throw new Error("Demo reset already running")
  if (error) throw error
  return key
}

/** Steps 4-8: build the seed dataset beside the old one, then remove the old one. */
async function replaceDataset(admin: SupabaseClient, userId: string, failAt: ResetOptions["failAt"]) {
  const storage = admin.storage.from(BUCKET)

  // 4. Remember what is there now.
  const oldKeys = [
    ...(await listAllKeys(admin, `resumes/${userId}`)),
    ...(await listAllKeys(admin, `cover_letters/${userId}`)),
  ]

  // 5. Upload the new files under a fresh prefix.
  const runId = randomUUID()
  const uploaded: string[] = []
  const removeUploads = async () => {
    if (uploaded.length) await storage.remove(uploaded)
  }
  try {
    for (const r of SEED_RESUMES) {
      const [title, ...body] = r.extracted_text.split("\n")
      const doc = createElement(TextDocumentPDF, { title, body: body.join("\n").trim() })
      const pdf = await renderToBuffer(doc as unknown as ReactElement<DocumentProps>)
      const key = `resumes/${userId}/seed-${runId}/${r.filename}`
      const { error } = await storage.upload(key, pdf, { contentType: PDF })
      if (error) throw error
      uploaded.push(key)
      if (failAt === "uploads") throw new Error("failAt: uploads")
    }
  } catch (e) {
    await removeUploads()
    throw e
  }

  // 6. Insert the new rows next to the old ones.
  const now = Date.now()
  const daysAgo = (d: number) => new Date(now - d * DAY).toISOString()
  const appRows = SEED_APPLICATIONS.map(({ appliedDaysAgo, createdDaysAgo, interviewInDays, ...a }) => ({
    ...a,
    id: randomUUID(),
    user_id: userId,
    auto_discovered: a.auto_discovered ?? false,
    applied_at: appliedDaysAgo === undefined ? null : daysAgo(appliedDaysAgo),
    // date column, compared with YYYY-MM-DD by the interview-reminder cron
    interview_date: interviewInDays === undefined ? null : new Date(now + interviewInDays * DAY).toISOString().slice(0, 10),
    created_at: daysAgo(createdDaysAgo),
    updated_at: daysAgo(appliedDaysAgo ?? createdDaysAgo),
  }))
  const docRows = SEED_RESUMES.map((r, i) => ({
    id: randomUUID(),
    user_id: userId,
    type: "resume",
    label: r.label,
    filename: r.filename,
    s3_key: uploaded[i],
    extracted_text: r.extracted_text,
    created_at: daysAgo(30 + i),
  }))
  const hero = appRows.find((a) => a.company === SEED_HERO_APP.company && a.role === SEED_HERO_APP.role)!
  const aiRows = SEED_AI_RESULTS.map((r) => ({ id: randomUUID(), application_id: hero.id, ...r }))

  try {
    await must(admin.from("applications").insert(appRows))
    if (failAt === "inserts") throw new Error("failAt: inserts")
    await must(admin.from("documents").insert(docRows))
    // Linked after both inserts so the AI pages open ready to run.
    await must(
      admin.from("applications").update({ resume_id: docRows[0].id }).eq("id", hero.id).eq("user_id", userId)
    )
    await must(admin.from("ai_results").insert(aiRows))
    await must(
      admin
        .from("job_discovery_settings")
        .upsert({ user_id: userId, enabled: true, keywords: SEED_DISCOVERY_KEYWORDS }, { onConflict: "user_id" })
    )
  } catch (e) {
    // Best-effort rollback by this run's ids (ai_results cascade); the original error is what matters.
    await admin.from("documents").delete().in("id", docRows.map((r) => r.id)).eq("user_id", userId)
    await admin.from("applications").delete().in("id", appRows.map((r) => r.id)).eq("user_id", userId)
    await removeUploads()
    throw e
  }

  // 7. Delete every other row the user owns (applications cascade to ai_results, which has no user_id).
  // "All but the new ids" instead of a list of old ids: reads are capped at the API's max rows.
  // A failure here leaves old + new rows — duplicates, never an empty demo; the next reset cleans up.
  const notIn = (rows: { id: string }[]) => `(${rows.map((r) => r.id).join(",")})`
  await must(admin.from("documents").delete().eq("user_id", userId).not("id", "in", notIn(docRows)))
  await must(admin.from("applications").delete().eq("user_id", userId).not("id", "in", notIn(appRows)))

  // 8. Remove the old files.
  if (oldKeys.length) {
    const { error } = await storage.remove(oldKeys)
    if (error) throw error
  }
}

async function must(query: PromiseLike<{ error: unknown }>) {
  const { error } = await query
  if (error) throw error
}
