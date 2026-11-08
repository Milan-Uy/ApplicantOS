"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Cpu } from "lucide-react"
import { cn } from "@/lib/utils"
import { NAV_ITEMS, isActive, navLinkClass } from "./nav-items"

export function Sidebar({ footer }: { footer: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-screen border-r border-border bg-card shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-6 h-16 border-b border-border">
        <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
          <Cpu className="w-4 h-4 text-primary-fg" />
        </div>
        <span className="text-base font-bold tracking-tight text-foreground">
          Applicant<span className="text-accent">OS</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 p-3 flex-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href)
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors duration-150",
                navLinkClass(active)
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-border">{footer}</div>
    </aside>
  )
}
