import { Sidebar } from "@/components/navigation/Sidebar"
import { MobileNav } from "@/components/navigation/MobileNav"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <MobileNav />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
