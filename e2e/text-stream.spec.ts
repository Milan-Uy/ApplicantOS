import { test, expect } from "@playwright/test"
import { streamText, type FinishReason } from "ai"
import { MockLanguageModelV3, convertArrayToReadableStream } from "ai/test"
import type { LanguageModelV3StreamPart } from "@ai-sdk/provider"
import { textStreamOrAbort } from "@/lib/ai/text-stream"

const usage = {
  inputTokens: { total: 1, noCache: 1, cacheRead: 0, cacheWrite: 0 },
  outputTokens: { total: 1, text: 1, reasoning: 0 },
}
const head: LanguageModelV3StreamPart[] = [
  { type: "stream-start", warnings: [] },
  { type: "text-start", id: "t" },
  { type: "text-delta", id: "t", delta: "Dear Hiring " },
]
const finish = (unified: "stop" | "length" | "content-filter"): LanguageModelV3StreamPart => ({
  type: "finish",
  finishReason: { unified, raw: unified },
  usage,
})

function run(parts: LanguageModelV3StreamPart[]) {
  let finishReason: FinishReason | undefined
  const model = new MockLanguageModelV3({ doStream: async () => ({ stream: convertArrayToReadableStream(parts) }) })
  const result = streamText({ model, prompt: "x", maxRetries: 0, onFinish: (e) => void (finishReason = e.finishReason) })
  const res = new Response(textStreamOrAbort(result.fullStream))
  return { res, finishReason: () => finishReason }
}

test("a provider error mid-stream aborts the body and onFinish sees error", async () => {
  const { res, finishReason } = run([...head, { type: "error", error: new Error("provider dropped") }])
  await expect(res.text()).rejects.toThrow()
  await expect.poll(finishReason).toBe("error")
})

for (const reason of ["length", "content-filter"] as const) {
  test(`finish with ${reason} aborts the body`, async () => {
    const { res } = run([...head, { type: "text-end", id: "t" }, finish(reason)])
    await expect(res.text()).rejects.toThrow()
  })
}

test("finish with stop ends the body normally", async () => {
  const { res, finishReason } = run([
    ...head,
    { type: "text-delta", id: "t", delta: "Team" },
    { type: "text-end", id: "t" },
    finish("stop"),
  ])
  expect(await res.text()).toBe("Dear Hiring Team")
  expect(finishReason()).toBe("stop")
})

const stopParts = [...head, { type: "text-delta", id: "t", delta: "Team" }, { type: "text-end", id: "t" }, finish("stop")] as LanguageModelV3StreamPart[]

function stream(parts: LanguageModelV3StreamPart[] | ReadableStream<LanguageModelV3StreamPart>) {
  const model = new MockLanguageModelV3({
    doStream: async () => ({ stream: Array.isArray(parts) ? convertArrayToReadableStream(parts) : parts }),
  })
  return streamText({ model, prompt: "x", maxRetries: 0 }).fullStream
}

// The client treats a fully read body as saved, so the save must finish before the body closes.
test("onComplete gets the full text and settles before the body closes", async () => {
  let saved: string | undefined
  const body = textStreamOrAbort(stream(stopParts), async (text) => {
    await new Promise((r) => setTimeout(r, 300))
    saved = text
  })
  expect(await new Response(body).text()).toBe("Dear Hiring Team")
  expect(saved).toBe("Dear Hiring Team")
})

test("a failing onComplete aborts the body", async () => {
  const body = textStreamOrAbort(stream(stopParts), async () => {
    throw new Error("insert failed")
  })
  await expect(new Response(body).text()).rejects.toThrow()
})

test("a cancelled body never calls onComplete, even if the model finishes", async () => {
  let release!: () => void
  const gate = new Promise<void>((r) => (release = r))
  const model = new ReadableStream<LanguageModelV3StreamPart>({
    async start(c) {
      for (const p of [...head, { type: "text-delta", id: "t", delta: "Team" }] as LanguageModelV3StreamPart[]) c.enqueue(p)
      await gate
      c.enqueue({ type: "text-end", id: "t" })
      c.enqueue(finish("stop"))
      c.close()
    },
  })
  let completed = false
  const reader = textStreamOrAbort(stream(model), async () => void (completed = true)).getReader()
  await reader.read()
  // Let the remaining text buffer first, so only text-end and finish arrive after the cancel.
  await new Promise((r) => setTimeout(r, 200))
  await reader.cancel()
  release()
  await new Promise((r) => setTimeout(r, 300))
  expect(completed).toBe(false)
})
