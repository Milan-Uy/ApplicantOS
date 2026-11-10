import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { resetDemoUser } from "@/lib/demo/reset"
import { verifyBearer } from "@/lib/verify-bearer"
import { logError, logInfo } from "@/lib/log"

export async function GET(request: NextRequest) {
  if (!verifyBearer(request, process.env.CRON_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  })
  try {
    // No password: the demo signs in by magic link, so a changed password breaks nothing.
    const { userId } = await resetDemoUser(admin, process.env.DEMO_EMAIL ?? "")
    logInfo("api.cron.demo-reset", "completed", { userId })
    return NextResponse.json({ ok: true, userId })
  } catch (e) {
    logError("api.cron.demo-reset", e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
