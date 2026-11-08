import { LayoutDashboard, Briefcase, FileText, Search, Settings, type LucideIcon } from "lucide-react"

export const NAV_ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/applications", label: "Applications", icon: Briefcase },
  { href: "/resumes", label: "Resumes", icon: FileText },
  { href: "/job-discovery", label: "Job Discovery", icon: Search },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/")
}

export const navLinkClass = (active: boolean) =>
  active ? "bg-surface-2 text-foreground" : "text-muted-fg hover:bg-muted hover:text-foreground"
