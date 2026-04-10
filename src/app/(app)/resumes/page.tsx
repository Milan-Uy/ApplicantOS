import { createClient } from "@/lib/supabase/server"
import type { Document } from "@/types/database"
import { ResumeUpload } from "@/components/resumes/ResumeUpload"
import { ResumeCard } from "@/components/resumes/ResumeCard"

export default async function ResumesPage() {
  const supabase = await createClient()
  const { data: documents } = await supabase
    .from("documents")
    .select("*")
    .eq("type", "resume")
    .order("created_at", { ascending: false })

  const resumes = (documents ?? []) as Document[]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Resume Library</h1>
        <p className="text-sm text-muted-fg mt-0.5">
          {resumes.length} resume{resumes.length !== 1 ? "s" : ""} uploaded
        </p>
      </div>

      <ResumeUpload />

      {resumes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resumes.map((resume) => (
            <ResumeCard key={resume.id} document={resume} />
          ))}
        </div>
      )}
    </div>
  )
}
