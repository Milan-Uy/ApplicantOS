"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Settings,
  Cpu,
  Menu,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/applications", label: "Applications", icon: Briefcase },
  { href: "/resumes", label: "Resumes", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <div className="lg:hidden">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 h-14 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
            <Cpu className="w-3.5 h-3.5 text-primary-fg" />
          </div>
          <span className="text-sm font-bold tracking-tight text-foreground">
            Applicant<span className="text-primary">OS</span>
          </span>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Toggle menu"
        >
          {open ? (
            <X className="w-5 h-5 text-foreground" />
          ) : (
            <Menu className="w-5 h-5 text-foreground" />
          )}
        </button>
      </header>

      {/* Dropdown nav */}
      {open && (
        <nav className="border-b border-border bg-card px-4 py-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/")
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-fg hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>
      )}
    </div>
  )
}
