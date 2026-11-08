"use client"

import { useRouter } from "next/navigation"
import { deleteApplication } from "@/app/(app)/applications/actions"
import { ConfirmDelete } from "@/components/ConfirmDelete"
import { Button } from "@/components/ui/button"

export function DeleteApplicationButton({ id }: { id: string }) {
  const router = useRouter()
  return (
    <ConfirmDelete
      title="Delete this application?"
      description="This removes the application and its AI results. It can't be undone."
      successMessage="Application deleted"
      onConfirm={async () => {
        await deleteApplication(id)
        router.push("/applications")
      }}
      trigger={
        <Button variant="destructive" size="lg">
          Delete Application
        </Button>
      }
    />
  )
}
