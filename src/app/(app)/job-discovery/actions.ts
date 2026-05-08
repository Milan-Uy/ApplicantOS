"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function saveKeywords(keywords: string[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const cleaned = [...new Set(keywords.map((k) => k.trim()).filter(Boolean))]
  const { error } = await supabase.from("job_discovery_settings").upsert(
    { user_id: user.id, keywords: cleaned, updated_at: new Date().toISOString() },
    { onConflict: "user_id" }
  )
  if (error) throw new Error(error.message)
  revalidatePath("/job-discovery")
}

export async function toggleEnabled(enabled: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase.from("job_discovery_settings").upsert(
    { user_id: user.id, enabled, updated_at: new Date().toISOString() },
    { onConflict: "user_id" }
  )
  if (error) throw new Error(error.message)
  revalidatePath("/job-discovery")
}

export async function dismissJob(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from("applications")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("auto_discovered", true)
  if (error) throw new Error(error.message)
  revalidatePath("/job-discovery")
}
