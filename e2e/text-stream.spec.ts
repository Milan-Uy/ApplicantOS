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

// The client treats a fully read body as saved, so the route's async insert must finish before close.
test("the body closes only after an async onFinish settles", async () => {
  let persisted = false
  const model = new MockLanguageModelV3({
    doStream: async () => ({
      stream: convertArrayToReadableStream<LanguageModelV3StreamPart>([...head, { type: "text-end", id: "t" }, finish("stop")]),
    }),
  })
  const result = streamText({
    model,
    prompt: "x",
    onFinish: async () => {
      await new Promise((r) => setTimeout(r, 300))
      persisted = true
    },
  })
  await new Response(textStreamOrAbort(result.fullStream)).text()
  expect(persisted).toBe(true)
})
