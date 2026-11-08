import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-bold text-foreground">Page not found</h1>
      <p className="text-sm text-muted-fg max-w-sm">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <Button asChild>
        <Link href="/">Go home</Link>
      </Button>
    </main>
  )
}
