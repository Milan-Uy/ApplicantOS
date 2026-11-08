// Structured JSON logging for server-side code (API routes, cron, webhooks).
// Single-line JSON keeps logs greppable + parseable by log collectors.

type Meta = Record<string, unknown>

function serializeError(err: unknown) {
  if (err instanceof Error) {
    return { name: err.name, message: err.message, stack: err.stack }
  }
  return err
}

function emit(level: "info" | "error", scope: string, payload: Meta) {
  const line = JSON.stringify({
    level,
    scope,
    at: new Date().toISOString(),
    ...payload,
  })
  if (level === "error") console.error(line)
  else console.log(line)
}

export function logError(scope: string, error: unknown, meta?: Meta) {
  emit("error", scope, { error: serializeError(error), ...(meta ?? {}) })
}

export function logInfo(scope: string, message: string, meta?: Meta) {
  emit("info", scope, { message, ...(meta ?? {}) })
}
