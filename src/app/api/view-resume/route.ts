import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { storageAdmin } from "@/lib/storage"
import { isOwnedKey } from "@/lib/storage-keys"

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

  // Owning the row doesn't prove owning the key: RLS on documents checks only user_id, and the
  // service-role client below bypasses Storage RLS.
  if (!isOwnedKey(document.s3_key, user.id, "resumes")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { data, error } = await storageAdmin().createSignedUrl(document.s3_key, 300)
  if (error || !data) {
    return NextResponse.json({ error: "File unavailable" }, { status: 404 })
  }

  return NextResponse.json({ url: data.signedUrl })
}
