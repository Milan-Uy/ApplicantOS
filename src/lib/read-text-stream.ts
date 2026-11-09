// Reads a streamed text body, reporting the accumulated text after each chunk.
export async function readTextStream(res: Response, onText: (full: string) => void): Promise<string> {
  if (!res.body) throw new Error("Empty response")
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let full = ""
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    full += decoder.decode(value, { stream: true })
    onText(full)
  }
  const tail = decoder.decode()
  if (tail) onText((full += tail))
  return full
}
