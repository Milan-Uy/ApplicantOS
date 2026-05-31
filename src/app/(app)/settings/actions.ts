"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Unauthorized" }
  }

  const fullName = ((formData.get("full_name") as string) ?? "").trim()
  const email = ((formData.get("email") as string) ?? "").trim()

  if (!fullName) {
    return { error: "Name cannot be empty" }
  }
  if (!email) {
    return { error: "Email cannot be empty" }
  }

  const currentName = user.user_metadata?.full_name ?? ""
  const currentEmail = user.email ?? ""

  const updates: {
    data?: { full_name: string }
    email?: string
  } = {}

  if (fullName !== currentName) {
    updates.data = { full_name: fullName }
  }
  if (email !== currentEmail) {
    updates.email = email
  }

  if (Object.keys(updates).length === 0) {
    return { success: true, message: "No changes to save" }
  }

  const { error } = await supabase.auth.updateUser(updates)
  if (error) {
    return { error: error.message }
  }

  revalidatePath("/settings")

  const emailChanged = "email" in updates
  return {
    success: true,
    message: emailChanged
      ? "Saved. Check your new email for a confirmation link."
      : "Profile updated.",
  }
}
