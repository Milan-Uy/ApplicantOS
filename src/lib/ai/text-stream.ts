import type { TextStreamPart, ToolSet } from "ai"

// toTextStreamResponse() drops error parts and ends the body cleanly; this errors the body instead,
// so the client sees a failed read and never mistakes partial text for a finished letter.
// onComplete (e.g. persisting) runs only after a "stop" finish on a body nobody cancelled; if it
// throws, the body errors, so a clean close always means it succeeded.
export function textStreamOrAbort(
  fullStream: AsyncIterable<TextStreamPart<ToolSet>>,
  onComplete?: (text: string) => Promise<void>
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  let cancelled = false
  return new ReadableStream({
    async start(controller) {
      try {
        let text = ""
        let finishReason: string | undefined
        for await (const part of fullStream) {
          if (cancelled) return
          if (part.type === "text-delta") {
            text += part.text
            controller.enqueue(encoder.encode(part.text))
          } else if (part.type === "error") throw part.error
          else if (part.type === "abort") throw new Error("Stream aborted")
          else if (part.type === "finish") finishReason = part.finishReason
        }
        if (finishReason !== "stop") throw new Error(`Stream finished with ${finishReason ?? "no finish part"}`)
        if (cancelled) return
        await onComplete?.(text)
        controller.close()
      } catch (e) {
        if (!cancelled) controller.error(e instanceof Error ? e : new Error(String(e)))
      }
    },
    cancel() {
      cancelled = true
    },
  })
}
