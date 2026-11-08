import { Suspense } from "react"
import Link from "next/link"
import { Sidebar } from "@/components/navigation/Sidebar"
import { MobileNav } from "@/components/navigation/MobileNav"
import { createClient } from "@/lib/supabase/server"

// Suspended so the getUser() round trip never blocks navigation or hides the pages' loading.tsx.
async function SidebarUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const name: string = user?.user_metadata?.full_name ?? ""
  const email = user?.email ?? ""

  return (
    <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors">
      <div className="w-7 h-7 shrink-0 rounded-full bg-surface-3 flex items-center justify-center text-xs font-semibold text-foreground">
        {(name || email || "?").charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0">
        {name && <p className="text-sm font-medium text-foreground truncate">{name}</p>}
        <p className="text-xs text-muted-fg truncate">{email}</p>
      </div>
    </Link>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar
        footer={
          <Suspense fallback={<div className="h-12" />}>
            <SidebarUser />
          </Suspense>
        }
      />
      <div className="flex-1 min-w-0 flex flex-col">
        <MobileNav />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
