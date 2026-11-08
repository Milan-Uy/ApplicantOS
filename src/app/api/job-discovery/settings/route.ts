import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { verifyBearer } from "@/lib/verify-bearer"
import { logError } from "@/lib/log"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

export async function GET(request: NextRequest) {
  if (!verifyBearer(request, process.env.N8N_WEBHOOK_SECRET)) {
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
    logError("api.job-discovery.settings", error, { userId })
    return NextResponse.json({ error: "Query failed" }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ enabled: false, keywords: [] })
  }

  return NextResponse.json({ enabled: data.enabled, keywords: data.keywords })
}
