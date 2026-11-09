import { test, expect } from "@playwright/test"
import { readTextStream } from "@/lib/read-text-stream"

const enc = new TextEncoder()

test("calls onText with the accumulated text per chunk and resolves the full text", async () => {
  const body = new ReadableStream<Uint8Array>({
    start(c) {
      for (const s of ["Dear ", "Hiring ", "Team"]) c.enqueue(enc.encode(s))
      c.close()
    },
  })
  const seen: string[] = []
  const full = await readTextStream(new Response(body), (t) => seen.push(t))
  expect(seen).toEqual(["Dear ", "Dear Hiring ", "Dear Hiring Team"])
  expect(full).toBe("Dear Hiring Team")
})

test("rejects when the stream errors, after reporting the partial text", async () => {
  // error() discards still-queued chunks, so fail on the pull after "Dear " was read.
  let pulls = 0
  const body = new ReadableStream<Uint8Array>({
    pull(c) {
      if (pulls++ === 0) c.enqueue(enc.encode("Dear "))
      else c.error(new Error("drop"))
    },
  })
  const seen: string[] = []
  await expect(readTextStream(new Response(body), (t) => seen.push(t))).rejects.toThrow()
  expect(seen.at(-1)).toBe("Dear ")
})
