import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AppNotFound() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto w-full flex flex-col items-center gap-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-foreground">Not found</h1>
      <p className="text-sm text-muted-fg max-w-sm">This record doesn&apos;t exist or was deleted.</p>
      <Button asChild>
        <Link href="/applications">Back to applications</Link>
      </Button>
    </div>
  )
}
