import { randomUUID } from "crypto"
import { test, expect } from "@playwright/test"
import { isOwnedKey, safeFilename } from "@/lib/storage-keys"
import { SEED_RESUMES } from "@/lib/demo/seed-data"

const uid = randomUUID()
const other = randomUUID()

test("safeFilename", () => {
  expect(safeFilename("Résumé (final) v2.pdf")).toBe("resume-final-v2.pdf")
  expect(safeFilename("../../etc/passwd.pdf")).toBe("etc-passwd.pdf")
  expect(safeFilename("a".repeat(300) + ".pdf").length).toBeLessThanOrEqual(100)
  expect(safeFilename("a".repeat(300) + ".pdf")).toMatch(/\.pdf$/)
  expect(safeFilename("???.docx")).toBe("file.docx")
  expect(safeFilename("")).toBe("file")
})

test("isOwnedKey", () => {
  expect(isOwnedKey(`resumes/${uid}/x/a.pdf`, uid, "resumes")).toBe(true)
  expect(isOwnedKey(`resumes/${uid}/../${other}/a.pdf`, uid, "resumes")).toBe(false)
  expect(isOwnedKey(`resumes/${other}/x/a.pdf`, uid, "resumes")).toBe(false)
  // fetch resolves %2e%2e as ".." — storage-js doesn't encode paths
  expect(isOwnedKey(`resumes/${uid}/%2e%2e/${other}/a.pdf`, uid, "resumes")).toBe(false)
  expect(isOwnedKey(`resumes/${uid}/x\\..\\a.pdf`, uid, "resumes")).toBe(false)
  expect(isOwnedKey(`resumes/${uid}//a.pdf`, uid, "resumes")).toBe(false)
  expect(isOwnedKey(`resumes/${uid}/a.pdf?x`, uid, "resumes")).toBe(false)
  expect(isOwnedKey(`resumes/${uid}/a.pdf`, uid, "cover_letters")).toBe(false)
  expect(isOwnedKey(`resumes//a.pdf`, "", "resumes")).toBe(false)
  // keys the demo reset writes must stay valid
  for (const r of SEED_RESUMES) expect(isOwnedKey(`resumes/${uid}/seed-${randomUUID()}/${r.filename}`, uid, "resumes")).toBe(true)
})
