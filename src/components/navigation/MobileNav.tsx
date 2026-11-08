"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Cpu, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NAV_ITEMS, isActive, navLinkClass } from "./nav-items"

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
            Applicant<span className="text-accent">OS</span>
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          {open ? (
            <X className="size-5 text-foreground" />
          ) : (
            <Menu className="size-5 text-foreground" />
          )}
        </Button>
      </header>

      {/* Dropdown nav — always rendered so aria-controls points at a real element */}
      <nav id="mobile-nav" hidden={!open} className="border-b border-border bg-card px-4 py-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href)
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                navLinkClass(active)
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
