// src/app/api/pdf/cover-letter/route.tsx
import React from "react"
import { NextRequest, NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import { randomUUID } from "crypto"
import { createClient } from "@/lib/supabase/server"
import { storageAdmin } from "@/lib/storage"
import { safeFilename } from "@/lib/storage-keys"
import { CoverLetterPDF } from "@/lib/pdf/cover-letter-template"
import { logError } from "@/lib/log"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { applicationId, coverLetter } = (await request.json()) as {
    applicationId: string
    coverLetter: string
  }

  if (!applicationId || !coverLetter) {
    return NextResponse.json(
      { error: "applicationId and coverLetter are required" },
      { status: 400 }
    )
  }

  // Verify user owns this application
  const { data: application, error: appError } = await supabase
    .from("applications")
    .select("id, company, role")
    .eq("id", applicationId)
    .eq("user_id", user.id)
    .single()

  if (appError || !application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 })
  }

  const pdfElement = (
    <CoverLetterPDF
      coverLetter={coverLetter}
      company={application.company}
      role={application.role}
    />
  )

  try {
    // Render PDF
    const pdfBuffer = await renderToBuffer(pdfElement)

    // company is optional; fall back to the role
    const filename = safeFilename(`${application.company || application.role}-cover-letter.pdf`)
    const key = `cover_letters/${user.id}/${randomUUID()}/${filename}`
    const storage = storageAdmin()

    const { error: uploadError } = await storage.upload(key, pdfBuffer, { contentType: "application/pdf" })
    if (uploadError) throw uploadError

    // Save document record
    const { error: insertError } = await supabase.from("documents").insert({
      user_id: user.id,
      application_id: applicationId,
      type: "cover_letter",
      label: `Cover Letter - ${application.company} (${new Date().toLocaleDateString()})`,
      filename,
      s3_key: key,
      extracted_text: coverLetter,
    })

    if (insertError) {
      logError("api.pdf.cover-letter.document-insert", insertError, {
        userId: user.id,
        applicationId,
      })
      return NextResponse.json({ error: "Failed to save document record" }, { status: 500 })
    }

    // Generate download URL (1 hour expiry)
    const { data: signed, error: signError } = await storage.createSignedUrl(key, 3600, { download: filename })
    if (signError) throw signError

    return NextResponse.json({ downloadUrl: signed.signedUrl })
  } catch (error) {
    logError("api.pdf.cover-letter.generate", error, {
      userId: user.id,
      applicationId,
    })
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    )
  }
}
