import { NextRequest, NextResponse } from "next/server"
import { GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { createClient } from "@/lib/supabase/server"
import { s3 } from "@/lib/s3"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const documentId = request.nextUrl.searchParams.get("documentId")
  if (!documentId) {
    return NextResponse.json({ error: "documentId is required" }, { status: 400 })
  }

  const { data: document } = await supabase
    .from("documents")
    .select("s3_key")
    .eq("id", documentId)
    .eq("user_id", user.id)
    .single()

  if (!document) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: document.s3_key,
  })

  const url = await getSignedUrl(s3, command, { expiresIn: 300 })

  return NextResponse.json({ url })
}
