import { NextRequest, NextResponse } from "next/server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { createClient } from "@/lib/supabase/server"
import { randomUUID } from "crypto"

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

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

  const key = `resumes/${user.id}/${randomUUID()}/${filename}`

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    ContentType: contentType,
  })

  const url = await getSignedUrl(s3, command, { expiresIn: 300 })

  return NextResponse.json({ url, key })
}
