"use client"

import { useOptimistic, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { setApplicationResume } from "@/app/(app)/applications/actions"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ResumePicker({
  applicationId,
  currentResumeId,
  resumes,
}: {
  applicationId: string
  currentResumeId: string | null
  resumes: { id: string; label: string | null; filename: string }[]
}) {
  // Shows the choice at once; falls back to the server value if the action fails.
  const [value, setValue] = useOptimistic(currentResumeId)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  if (!resumes.length) {
    return (
      <Link href="/resumes" className="text-sm text-accent hover:underline">
        Upload a resume to use the AI tools &rarr;
      </Link>
    )
  }

  function change(resumeId: string) {
    startTransition(async () => {
      setValue(resumeId)
      const { error } = await setApplicationResume(applicationId, resumeId)
      if (error) return void toast.error(error)
      toast.success("Resume updated")
      // revalidatePath alone left the AI clients holding the old resume text.
      router.refresh()
    })
  }

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="resume-picker" className="text-muted-fg">
        Resume
      </Label>
      <Select value={value ?? undefined} onValueChange={change} disabled={pending}>
        <SelectTrigger id="resume-picker" size="sm" className="w-48 sm:w-56">
          <SelectValue placeholder="Choose a resume" />
        </SelectTrigger>
        <SelectContent>
          {resumes.map((r) => (
            <SelectItem key={r.id} value={r.id}>
              {r.label || r.filename}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
