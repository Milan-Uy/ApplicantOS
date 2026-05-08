import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { JobDiscoverySettings } from "@/types/database"
import { JobDiscoveryClient } from "./client"

export default async function JobDiscoveryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  await supabase
    .from("job_discovery_settings")
    .upsert({ user_id: user.id }, { onConflict: "user_id", ignoreDuplicates: true })

  const { data: settingsRow } = await supabase
    .from("job_discovery_settings")
    .select("*")
    .eq("user_id", user.id)
    .single()

  const settings = settingsRow as JobDiscoverySettings

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: discoveries } = await supabase
    .from("applications")
    .select("id, role, company, url, created_at, status")
    .eq("user_id", user.id)
    .eq("auto_discovered", true)
    .gte("created_at", sevenDaysAgo.toISOString())
    .order("created_at", { ascending: false })

  return (
    <JobDiscoveryClient
      settings={settings}
      initialDiscovered={discoveries ?? []}
    />
  )
}
