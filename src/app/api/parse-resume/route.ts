import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { storageAdmin } from "@/lib/storage"
import { isOwnedKey } from "@/lib/storage-keys"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { s3Key, contentType } = (await request.json()) as {
    s3Key: string
    contentType: string
  }

  if (!s3Key || !contentType) {
    return NextResponse.json(
      { error: "s3Key and contentType are required" },
      { status: 400 }
    )
  }

  if (!isOwnedKey(s3Key, user.id, "resumes")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { data: blob, error } = await storageAdmin().download(s3Key)
  if (error || !blob) {
    return NextResponse.json({ error: "File unavailable" }, { status: 404 })
  }

  if (blob.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 400 })
  }

  let text = ""

  try {
    const bytes = new Uint8Array(await blob.arrayBuffer())

    if (contentType === "application/pdf") {
      const { extractText } = await import("unpdf")
      const { text: pages } = await extractText(bytes, { mergePages: true })
      text = pages
    } else if (
      contentType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const buffer = Buffer.from(bytes)
      const mammoth = await import("mammoth")
      const result = await mammoth.extractRawText({ buffer })
      text = result.value
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Use PDF or DOCX." },
        { status: 400 }
      )
    }
  } catch {
    return NextResponse.json({ error: "Failed to parse file" }, { status: 400 })
  }

  return NextResponse.json({ text })
}
