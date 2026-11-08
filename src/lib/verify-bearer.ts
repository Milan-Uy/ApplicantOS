import { timingSafeEqual } from "crypto"

/** True only when `Authorization` is exactly `Bearer <secret>`; an unset or blank secret never matches. */
export function verifyBearer(request: Request, secret: string | undefined): boolean {
  if (!secret?.trim()) return false
  const expected = Buffer.from(`Bearer ${secret}`)
  const actual = Buffer.from(request.headers.get("authorization") ?? "")
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}
