"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function saveDocument(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const label = formData.get("label") as string
  const filename = formData.get("filename") as string
  const s3Key = formData.get("s3Key") as string
  const extractedText = formData.get("extractedText") as string

  if (!s3Key.startsWith(`resumes/${user.id}/`)) {
    throw new Error("Forbidden")
  }

  const { error } = await supabase.from("documents").insert({
    user_id: user.id,
    type: "resume" as const,
    label: label || null,
    filename,
    s3_key: s3Key,
    extracted_text: extractedText || null,
  })

  if (error) throw new Error(error.message)

  revalidatePath("/resumes")
}

export async function deleteDocument(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) throw new Error(error.message)

  revalidatePath("/resumes")
}
