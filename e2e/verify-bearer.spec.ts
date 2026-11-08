import { test, expect } from "@playwright/test"
import { verifyBearer } from "@/lib/verify-bearer"
import { isDemoUser } from "@/lib/demo/is-demo"

const req = (authorization?: string) =>
  new Request("http://x", { headers: authorization === undefined ? {} : { authorization } })

test("verifyBearer rejects an unset or blank secret", () => {
  expect(verifyBearer(req("Bearer undefined"), undefined)).toBe(false)
  expect(verifyBearer(req("Bearer "), "")).toBe(false)
  expect(verifyBearer(req("Bearer   "), "  ")).toBe(false)
})

test("verifyBearer accepts only the exact secret", () => {
  expect(verifyBearer(req("Bearer s3cret"), "s3cret")).toBe(true)
  expect(verifyBearer(req("Bearer s3creX"), "s3cret")).toBe(false)
  expect(verifyBearer(req("Bearer s3cretX"), "s3cret")).toBe(false)
  expect(verifyBearer(req(), "s3cret")).toBe(false)
})

test("isDemoUser compares case-insensitively and is false when DEMO_EMAIL is blank", () => {
  const saved = process.env.DEMO_EMAIL
  try {
    process.env.DEMO_EMAIL = "Demo@Example.com"
    expect(isDemoUser({ email: "demo@example.COM" })).toBe(true)
    expect(isDemoUser({ email: "other@example.com" })).toBe(false)
    expect(isDemoUser({ email: null })).toBe(false)
    process.env.DEMO_EMAIL = " "
    expect(isDemoUser({ email: " " })).toBe(false)
    expect(isDemoUser({})).toBe(false)
  } finally {
    process.env.DEMO_EMAIL = saved
  }
})
