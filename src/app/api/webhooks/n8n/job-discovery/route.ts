import { NextRequest, NextResponse } from "next/server"
import { timingSafeEqual } from "crypto"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const expected = Buffer.from(`Bearer ${process.env.N8N_WEBHOOK_SECRET}`)
  const actual = Buffer.from(authHeader ?? "")
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { user_id, role, url, company, job_description } = body as Record<string, string>

  if (!user_id || !role || !url) {
    return NextResponse.json({ error: "Missing required fields: user_id, role, url" }, { status: 400 })
  }

  // Deduplicate by URL per user
  const { data: existing } = await supabaseAdmin
    .from("applications")
    .select("id")
    .eq("user_id", user_id)
    .eq("url", url)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ inserted: false, reason: "duplicate" })
  }

  const { error } = await supabaseAdmin.from("applications").insert({
    user_id,
    role,
    url,
    company: company ?? "",
    job_description: job_description ?? null,
    status: "wishlist",
    source: "online_jobs_ph",
    auto_discovered: true,
  })

  if (error) {
    console.error("Webhook insert error:", error)
    return NextResponse.json({ error: "Insert failed" }, { status: 500 })
  }

  return NextResponse.json({ inserted: true })
}
