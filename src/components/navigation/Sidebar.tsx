"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Briefcase, FileText, Settings, Cpu } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/applications", label: "Applications", icon: Briefcase },
  { href: "/resumes", label: "Resumes", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-screen border-r border-border bg-card shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-6 h-16 border-b border-border">
        <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
          <Cpu className="w-4 h-4 text-primary-fg" />
        </div>
        <span className="text-base font-bold tracking-tight text-foreground">
          Applicant<span className="text-primary">OS</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 p-3 flex-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors duration-150",
                active
                  ? "bg-white/[0.05] text-foreground"
                  : "text-muted-fg hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-white/[0.08] flex items-center justify-center text-xs font-semibold text-foreground">
            U
          </div>
          <span className="text-sm font-medium text-muted-fg truncate">
            Account
          </span>
        </div>
      </div>
    </aside>
  )
}
