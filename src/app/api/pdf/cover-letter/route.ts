// src/app/api/pdf/cover-letter/route.ts
import { NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { randomUUID } from "crypto"
import { createClient } from "@/lib/supabase/server"
import { s3 } from "@/lib/s3"
import { CoverLetterPDF } from "@/lib/pdf/cover-letter-template"

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { applicationId, coverLetter } = await request.json()

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

  try {
    // Render PDF
    const pdfBuffer = await renderToBuffer(
      CoverLetterPDF({
        coverLetter,
        company: application.company,
        role: application.role,
      })
    )

    // Upload to S3
    const filename = `${application.company.toLowerCase().replace(/\s+/g, "-")}-cover-letter.pdf`
    const key = `cover_letters/${user.id}/${randomUUID()}/${filename}`

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
        Body: pdfBuffer,
        ContentType: "application/pdf",
      })
    )

    // Save document record
    await supabase.from("documents").insert({
      user_id: user.id,
      application_id: applicationId,
      type: "cover_letter",
      label: `Cover Letter - ${application.company}`,
      filename,
      s3_key: key,
      extracted_text: coverLetter,
    })

    // Generate download URL (1 hour expiry)
    const downloadUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
      }),
      { expiresIn: 3600 }
    )

    return NextResponse.json({ downloadUrl })
  } catch (error) {
    console.error("PDF generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    )
  }
}
