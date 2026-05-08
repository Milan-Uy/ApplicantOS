import { NextRequest, NextResponse } from "next/server"
import { timingSafeEqual } from "crypto"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const expected = Buffer.from(`Bearer ${process.env.N8N_WEBHOOK_SECRET}`)
  const actual = Buffer.from(authHeader ?? "")
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = request.nextUrl.searchParams.get("user_id")
  if (!userId) {
    return NextResponse.json({ error: "Missing user_id" }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from("job_discovery_settings")
    .select("enabled, keywords")
    .eq("user_id", userId)
    .single()

  if (error && error.code !== "PGRST116") {
    console.error("Settings query error:", error)
    return NextResponse.json({ error: "Query failed" }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ enabled: false, keywords: [] })
  }

  return NextResponse.json({ enabled: data.enabled, keywords: data.keywords })
}
