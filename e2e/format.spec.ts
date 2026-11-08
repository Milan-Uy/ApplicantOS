import { test, expect } from "@playwright/test"
import { formatSalary } from "@/lib/format"

// Matches what the application detail page rendered before formatSalary existed.
test("formatSalary", () => {
  expect(formatSalary({ salary_min: 80000, salary_max: 100000, salary_currency: "USD", salary_period: "monthly" })).toBe("USD 80,000–100,000 /mo")
  expect(formatSalary({ salary_min: 50000, salary_max: null, salary_currency: "PHP", salary_period: "hourly" })).toBe("PHP 50,000+ /hr")
  expect(formatSalary({ salary_min: 140000, salary_max: 180000, salary_currency: null, salary_period: null })).toBe("140,000–180,000")
  expect(formatSalary({ salary_min: null, salary_max: 90000, salary_currency: "USD", salary_period: null })).toBeNull()
  expect(formatSalary({ salary_min: null, salary_max: null, salary_currency: null, salary_period: null })).toBeNull()
})
