import { NextRequest, NextResponse } from "next/server"
import { GetObjectCommand } from "@aws-sdk/client-s3"
import { createClient } from "@/lib/supabase/server"
import { s3 } from "@/lib/s3"

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

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: s3Key,
  })

  const response = await s3.send(command)
  const bytes = await response.Body!.transformToByteArray()
  const buffer = Buffer.from(bytes)

  let text = ""

  if (contentType === "application/pdf") {
    const { extractText } = await import("unpdf")
    const { text: pages } = await extractText(buffer, { mergePages: true })
    text = pages
  } else if (
    contentType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const mammoth = await import("mammoth")
    const result = await mammoth.extractRawText({ buffer })
    text = result.value
  } else {
    return NextResponse.json(
      { error: "Unsupported file type. Use PDF or DOCX." },
      { status: 400 }
    )
  }

  return NextResponse.json({ text })
}
