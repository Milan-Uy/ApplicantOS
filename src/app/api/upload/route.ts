import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { randomUUID } from "crypto"
import { storageAdmin } from "@/lib/storage"
import { safeFilename } from "@/lib/storage-keys"
import { logError } from "@/lib/log"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { filename, contentType } = (await request.json()) as {
    filename: string
    contentType: string
  }

  if (!filename || !contentType) {
    return NextResponse.json(
      { error: "filename and contentType are required" },
      { status: 400 }
    )
  }

  const ALLOWED_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]
  if (!ALLOWED_TYPES.includes(contentType)) {
    return NextResponse.json({ error: "Unsupported file type. Use PDF or DOCX." }, { status: 400 })
  }

  const key = `resumes/${user.id}/${randomUUID()}/${safeFilename(filename)}`

  const { data, error } = await storageAdmin().createSignedUploadUrl(key)
  if (error) {
    logError("api.upload.sign", error, { userId: user.id })
    return NextResponse.json({ error: "Failed to get upload URL" }, { status: 500 })
  }

  return NextResponse.json({ key, token: data.token })
}
