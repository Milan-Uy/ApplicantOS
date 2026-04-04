export type ApplicationStatus =
  | "wishlist"
  | "applied"
  | "phone_screen"
  | "interview"
  | "offer"
  | "rejected"
  | "ghosted"

export type ApplicationSource =
  | "linkedin"
  | "indeed"
  | "referral"
  | "company_site"
  | "other"

export type DocumentType = "resume" | "cover_letter"

export type NotificationType = "follow_up" | "digest" | "system"

export type AIResultType = "resume_optimize" | "cover_letter"

export interface Application {
  id: string
  user_id: string
  company: string
  role: string
  url: string | null
  status: ApplicationStatus
  source: ApplicationSource | null
  salary_min: number | null
  salary_max: number | null
  location: string | null
  job_description: string | null
  notes: string | null
  contact_name: string | null
  contact_email: string | null
  resume_id: string | null
  interview_date: string | null
  applied_at: string | null
  follow_up_at: string | null
  reminder_sent: boolean
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  user_id: string
  application_id: string | null
  type: DocumentType
  label: string | null
  filename: string
  s3_key: string
  extracted_text: string | null
  created_at: string
}

export interface AIResult {
  id: string
  application_id: string
  type: AIResultType
  result: ResumeOptimizeResult | CoverLetterResult
  created_at: string
}

export interface ResumeOptimizeResult {
  matchScore: number
  missingKeywords: string[]
  suggestions: Array<{
    original: string
    rewritten: string
    reason: string
  }>
  summary: string
}

export interface CoverLetterResult {
  coverLetter: string
}

export interface Notification {
  id: string
  user_id: string
  application_id: string | null
  type: NotificationType
  title: string
  body: string | null
  read: boolean
  created_at: string
}
