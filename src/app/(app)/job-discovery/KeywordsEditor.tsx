// Client-only: imported from client.tsx, which is the "use client" boundary.
import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const MAX_KEYWORDS = 20

export function KeywordsEditor({
  keywords,
  onChange,
}: {
  keywords: string[]
  onChange: (keywords: string[]) => void
}) {
  const [draft, setDraft] = useState("")

  const commit = () => {
    const v = draft.replace(/,+/g, "").trim()
    if (!v || keywords.length >= MAX_KEYWORDS) return
    setDraft("")
    if (keywords.some((k) => k.toLowerCase() === v.toLowerCase())) return
    onChange([...keywords, v])
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      commit()
    } else if (e.key === "Backspace" && !draft && keywords.length) {
      onChange(keywords.slice(0, -1))
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="keyword-input">Add a keyword</Label>
        <span className="text-xs tabular-nums text-muted-fg">
          {keywords.length}/{MAX_KEYWORDS}
        </span>
      </div>
      {keywords.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Keywords">
          {keywords.map((k, i) => (
            <li
              key={`${k}-${i}`}
              className="inline-flex h-7 items-center gap-1 rounded-md border border-border bg-surface-2 pl-2.5 pr-1 text-xs font-medium text-foreground"
            >
              {k}
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={`Remove ${k}`}
                onClick={() => onChange(keywords.filter((_, idx) => idx !== i))}
                className="text-muted-fg hover:bg-destructive/10 hover:text-destructive"
              >
                <X />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <Input
        id="keyword-input"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={commit}
        disabled={keywords.length >= MAX_KEYWORDS}
        placeholder='e.g. "react developer", "virtual assistant"'
        aria-describedby="keyword-hint"
      />
      <p id="keyword-hint" className="text-xs text-muted-fg">
        Press Enter or comma to add. Backspace on an empty field removes the last keyword.
      </p>
    </div>
  )
}
