import type { Application } from "@/types/database"

const PERIOD_SUFFIX: Record<string, string> = { monthly: "/mo", hourly: "/hr" }

export function formatSalary(
  app: Pick<Application, "salary_min" | "salary_max" | "salary_currency" | "salary_period">
): string | null {
  if (!app.salary_min) return null
  const n = (v: number) => v.toLocaleString("en-US")
  const range = n(app.salary_min) + (app.salary_max ? `–${n(app.salary_max)}` : "+")
  return [app.salary_currency, range, app.salary_period && PERIOD_SUFFIX[app.salary_period]]
    .filter(Boolean)
    .join(" ")
}
