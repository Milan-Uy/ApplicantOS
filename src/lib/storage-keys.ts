// Pure helpers: no server-only import, so Playwright and the demo reset can use them.
export const BUCKET = "documents"

const slug = (s: string) =>
  s.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")

/** A storage-safe filename: ascii, lowercase, dashes, extension kept, at most 100 chars. */
export function safeFilename(name: string): string {
  const m = name.match(/^(.*)\.([^./\\]+)$/)
  const ext = m ? slug(m[2]).replace(/-/g, "").slice(0, 10) : ""
  const suffix = ext ? `.${ext}` : ""
  const stem = slug(m ? m[1] : name).slice(0, 100 - suffix.length).replace(/-+$/, "") || "file"
  return stem + suffix
}

/**
 * True only for a key inside `${prefix}/${userId}/` that cannot resolve elsewhere.
 * `%` is refused because storage-js does not encode paths and fetch resolves `%2e%2e` as `..`;
 * `?`/`#` would truncate the path.
 */
export function isOwnedKey(key: string, userId: string, prefix: "resumes" | "cover_letters"): boolean {
  if (!userId || /[\\%?#]|\/\//.test(key)) return false
  if (!key.startsWith(`${prefix}/${userId}/`)) return false
  return !key.split("/").some((s) => s === "." || s === "..")
}
