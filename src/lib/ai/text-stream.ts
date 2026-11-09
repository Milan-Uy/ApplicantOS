import type { TextStreamPart, ToolSet } from "ai"

// toTextStreamResponse() drops error parts and ends the body cleanly; this errors the body instead,
// so the client sees a failed read and never mistakes partial text for a finished letter.
export function textStreamOrAbort(fullStream: AsyncIterable<TextStreamPart<ToolSet>>): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  return new ReadableStream({
    async start(controller) {
      try {
        let finishReason: string | undefined
        // Drain to the end (no early return): cancelling fullStream would skip streamText's onFinish.
        for await (const part of fullStream) {
          if (part.type === "text-delta") controller.enqueue(encoder.encode(part.text))
          else if (part.type === "error") throw part.error
          else if (part.type === "abort") throw new Error("Stream aborted")
          else if (part.type === "finish") finishReason = part.finishReason
        }
        if (finishReason !== "stop") throw new Error(`Stream finished with ${finishReason ?? "no finish part"}`)
        controller.close()
      } catch (e) {
        controller.error(e instanceof Error ? e : new Error(String(e)))
      }
    },
  })
}
