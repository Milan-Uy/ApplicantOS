// `[id]` is resolved at test time by the heroAppId fixture.
export const ROUTES: { name: string; path: string; public?: boolean }[] = [
  { name: "landing", path: "/", public: true },
  { name: "login", path: "/login", public: true },
  { name: "signup", path: "/signup", public: true },
  { name: "dashboard", path: "/dashboard" },
  { name: "applications", path: "/applications" },
  { name: "application-new", path: "/applications/new" },
  { name: "application-detail", path: "/applications/[id]" },
  { name: "application-edit", path: "/applications/[id]/edit" },
  { name: "application-resume", path: "/applications/[id]/resume" },
  { name: "application-cover-letter", path: "/applications/[id]/cover-letter" },
  { name: "resumes", path: "/resumes" },
  { name: "job-discovery", path: "/job-discovery" },
  { name: "settings", path: "/settings" },
]

// Each task appends the routes it brings to zero serious/critical axe violations.
export const AXE_ROUTES: string[] = [
  "dashboard",
  "settings",
  "applications",
  "application-new",
  "application-detail",
  "application-edit",
  "resumes",
]
