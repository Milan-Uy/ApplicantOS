"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import {
  Clock,
  Check,
  Loader,
  Sparkles,
  RefreshCw,
  Search,
  AlertTriangle,
  Info,
  X,
  ExternalLink,
  ArrowRight,
  Plus,
} from "lucide-react"
import type { JobDiscoverySettings } from "@/types/database"
import { saveKeywords, toggleEnabled, dismissJob } from "./actions"

// ─── Types ───────────────────────────────────────────────────────────────────

type DiscoveredApp = {
  id: string
  role: string
  company: string
  url: string | null
  created_at: string
  status: string
}

type Props = {
  settings: JobDiscoverySettings
  initialDiscovered: DiscoveredApp[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 60) return `Discovered ${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `Discovered ${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `Discovered ${days}d ago`
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function PulseDot({ color }: { color: string }) {
  return (
    <span style={{ position: "relative", width: 8, height: 8, display: "inline-block" }}>
      <span
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 9999,
          background: color,
          animation: "var(--animate-pulse-fade)",
        }}
      />
      <span style={{ position: "absolute", inset: 0, borderRadius: 9999, background: color }} />
    </span>
  )
}

function Switch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: 36,
        height: 20,
        borderRadius: 9999,
        padding: 2,
        background: checked ? "#5e6ad2" : "rgba(255,255,255,.1)",
        border: 0,
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        transition: "background 150ms",
      }}
    >
      <span
        style={{
          width: 16,
          height: 16,
          borderRadius: 9999,
          background: "#fff",
          transform: `translateX(${checked ? 16 : 0}px)`,
          transition: "transform 150ms cubic-bezier(0.22, 1, 0.36, 1)",
          boxShadow: "0 1px 2px rgba(0,0,0,.4)",
        }}
      />
    </button>
  )
}

function KeywordChip({ children, onRemove }: { children: string; onRemove: () => void }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: 28,
        padding: "0 4px 0 10px",
        borderRadius: 6,
        background: "rgba(255,255,255,.04)",
        border: "1px solid rgba(255,255,255,.08)",
        fontSize: 12,
        fontWeight: 500,
        color: "#f7f8f8",
      }}
    >
      {children}
      <button
        onClick={onRemove}
        aria-label={`Remove ${children}`}
        style={{
          width: 18,
          height: 18,
          borderRadius: 4,
          border: 0,
          background: "transparent",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#8a8f98",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "#f87171"
          e.currentTarget.style.background = "rgba(239,68,68,.1)"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "#8a8f98"
          e.currentTarget.style.background = "transparent"
        }}
      >
        <X size={12} />
      </button>
    </span>
  )
}

function KeywordsEditor({
  keywords,
  onChange,
}: {
  keywords: string[]
  onChange: (kw: string[]) => void
}) {
  const [draft, setDraft] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const commit = () => {
    const v = draft.trim().replace(/,+/g, "").trim()
    if (!v) return
    if (keywords.length >= 20) return
    if (keywords.map((k) => k.toLowerCase()).includes(v.toLowerCase())) {
      setDraft("")
      return
    }
    onChange([...keywords, v])
    setDraft("")
  }

  const remove = (i: number) => onChange(keywords.filter((_, idx) => idx !== i))

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      commit()
    } else if (e.key === "Backspace" && !draft && keywords.length) {
      onChange(keywords.slice(0, -1))
    }
  }

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      style={{
        background: "#0f1011",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: 8,
        padding: 8,
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        cursor: "text",
        minHeight: 64,
      }}
    >
      {keywords.map((k, i) => (
        <KeywordChip key={`${k}-${i}`} onRemove={() => remove(i)}>
          {k}
        </KeywordChip>
      ))}
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={commit}
        placeholder={
          keywords.length === 0
            ? 'Try "react developer", "virtual assistant", "bookkeeper"…'
            : "Add another…"
        }
        style={{
          flex: 1,
          minWidth: 140,
          height: 28,
          background: "transparent",
          border: 0,
          outline: "none",
          color: "#f7f8f8",
          fontFamily: "inherit",
          fontSize: 13,
          padding: "0 6px",
        }}
      />
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  valueColor = "#f7f8f8",
  sub,
}: {
  icon: React.ElementType
  label: string
  value: React.ReactNode
  valueColor?: string
  sub: string
}) {
  return (
    <div
      style={{
        background: "#0f1011",
        border: "1px solid rgba(255,255,255,.08)",
        boxShadow: "0 0 0 1px rgba(255,255,255,.05)",
        borderRadius: 12,
        padding: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "rgba(255,255,255,.05)",
            border: "1px solid rgba(255,255,255,.04)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#8a8f98",
            flexShrink: 0,
          }}
        >
          <Icon size={15} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "#8a8f98",
              textTransform: "uppercase",
              letterSpacing: ".06em",
            }}
          >
            {label}
          </div>
          <div
            style={{
              marginTop: 6,
              fontSize: 18,
              fontWeight: 600,
              color: valueColor,
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "-0.01em",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {value}
          </div>
          <div style={{ fontSize: 12, color: "#8a8f98", marginTop: 2 }}>{sub}</div>
        </div>
      </div>
    </div>
  )
}

function SectionHeader({
  title,
  sub,
  action,
}: {
  title: string
  sub?: string
  action?: React.ReactNode
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        marginBottom: 12,
        gap: 12,
      }}
    >
      <div>
        <h2
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#f7f8f8",
            letterSpacing: "-0.01em",
            margin: 0,
          }}
        >
          {title}
        </h2>
        {sub && (
          <div style={{ fontSize: 12, color: "#8a8f98", marginTop: 3, lineHeight: 1.5 }}>
            {sub}
          </div>
        )}
      </div>
      {action}
    </div>
  )
}

function SourceTile({ active, count }: { active: boolean; count: number }) {
  return (
    <div
      style={{
        background: "#0f1011",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: 12,
        padding: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            flexShrink: 0,
            background: "linear-gradient(180deg, rgba(94,106,210,.18), rgba(94,106,210,.06))",
            border: "1px solid rgba(94,106,210,.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#a5acf0",
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: "-0.02em",
          }}
        >
          OJ
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#f7f8f8" }}>OnlineJobs.ph</span>
            {active && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "1px 7px",
                  borderRadius: 4,
                  fontSize: 10,
                  fontWeight: 500,
                  color: "#10b981",
                  background: "rgba(16,185,129,.08)",
                  border: "1px solid rgba(16,185,129,.18)",
                  letterSpacing: ".04em",
                  textTransform: "uppercase",
                }}
              >
                <PulseDot color="#10b981" />
                Live
              </span>
            )}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "#8a8f98",
              marginTop: 2,
              fontFamily: "var(--font-mono)",
            }}
          >
            onlinejobs.ph
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "#f7f8f8",
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "-0.01em",
            }}
          >
            {count}
          </div>
          <div style={{ fontSize: 11, color: "#8a8f98" }}>this week</div>
        </div>
      </div>
    </div>
  )
}

function SourcePlaceholder() {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 12,
        border: "1px dashed rgba(255,255,255,.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        color: "#62666d",
        fontSize: 12,
        fontWeight: 500,
        minHeight: 68,
        cursor: "not-allowed",
      }}
    >
      <Plus size={14} />
      More sources coming soon
    </div>
  )
}

function NoKeywordsBanner() {
  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
        padding: 16,
        borderRadius: 10,
        background: "rgba(245,158,11,.06)",
        border: "1px solid rgba(245,158,11,.18)",
        marginBottom: 16,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          flexShrink: 0,
          background: "rgba(245,158,11,.1)",
          color: "#f59e0b",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AlertTriangle size={16} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#f7f8f8" }}>
          Add at least one keyword to start discovering jobs
        </div>
        <div style={{ fontSize: 12, color: "#8a8f98", marginTop: 3, lineHeight: 1.5 }}>
          We'll search OnlineJobs.ph daily and queue any matches as{" "}
          <span style={{ color: "#f7f8f8" }}>Wishlist</span> applications. Try something specific —{" "}
          <kbd
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "#a5acf0",
              padding: "1px 5px",
              borderRadius: 3,
              background: "rgba(255,255,255,.06)",
              border: "1px solid rgba(255,255,255,.08)",
            }}
          >
            react developer
          </kbd>
          ,{" "}
          <kbd
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "#a5acf0",
              padding: "1px 5px",
              borderRadius: 3,
              background: "rgba(255,255,255,.06)",
              border: "1px solid rgba(255,255,255,.08)",
            }}
          >
            bookkeeper
          </kbd>
          ,{" "}
          <kbd
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "#a5acf0",
              padding: "1px 5px",
              borderRadius: 3,
              background: "rgba(255,255,255,.06)",
              border: "1px solid rgba(255,255,255,.08)",
            }}
          >
            virtual assistant
          </kbd>
          .
        </div>
      </div>
    </div>
  )
}

function EmptyDiscoveries() {
  return (
    <div
      style={{
        background: "#0f1011",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: 12,
        padding: 32,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 8,
          padding: "16px 0",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: "rgba(255,255,255,.04)",
            border: "1px solid rgba(255,255,255,.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#62666d",
          }}
        >
          <Search size={20} />
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#f7f8f8", marginTop: 4 }}>
          Nothing discovered yet
        </div>
        <div style={{ fontSize: 13, color: "#8a8f98", maxWidth: 360, lineHeight: 1.5 }}>
          New matches show up here within 24 hours of your next scheduled run. You can also trigger
          a check manually.
        </div>
      </div>
    </div>
  )
}

function DiscoveredCard({
  app,
  onDismiss,
}: {
  app: DiscoveredApp
  onDismiss: () => void
}) {
  const [hover, setHover] = useState(false)

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "#0f1011",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: 12,
        boxShadow: hover
          ? "0 0 0 1px rgba(255,255,255,.12)"
          : "0 0 0 1px rgba(255,255,255,.05)",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        transition: "box-shadow 150ms",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: 10,
                fontWeight: 500,
                color: "#a5acf0",
                background: "rgba(94,106,210,.1)",
                border: "1px solid rgba(94,106,210,.2)",
                padding: "2px 7px",
                borderRadius: 4,
                textTransform: "uppercase",
                letterSpacing: ".06em",
              }}
            >
              <Sparkles size={10} />
              Auto
            </span>
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#f7f8f8",
              lineHeight: 1.3,
              letterSpacing: "-0.01em",
            }}
          >
            {app.role}
          </div>
          {app.company && (
            <div style={{ fontSize: 12, color: "#8a8f98", marginTop: 3 }}>{app.company}</div>
          )}
        </div>
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            border: 0,
            flexShrink: 0,
            background: "transparent",
            color: "#62666d",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "color 120ms, background 120ms",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#f87171"
            e.currentTarget.style.background = "rgba(239,68,68,.08)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#62666d"
            e.currentTarget.style.background = "transparent"
          }}
        >
          <X size={14} />
        </button>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          fontSize: 11,
          color: "#62666d",
        }}
      >
        <span>{relativeTime(app.created_at)}</span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "3px 10px",
            borderRadius: 6,
            background: "rgba(255,255,255,.05)",
            border: "1px solid rgba(255,255,255,.08)",
            fontSize: 12,
            fontWeight: 500,
            color: "#8a8f98",
          }}
        >
          Wishlist
        </span>
      </div>

      <div
        style={{
          display: "flex",
          gap: 6,
          paddingTop: 12,
          borderTop: "1px solid rgba(255,255,255,.06)",
        }}
      >
        <Link
          href={`/applications/${app.id}`}
          style={{
            flex: 1,
            height: 32,
            borderRadius: 6,
            background: "rgba(255,255,255,.04)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            fontSize: 12,
            fontWeight: 500,
            color: "#f7f8f8",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,.08)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,.04)")}
        >
          View in app <ArrowRight size={12} />
        </Link>
        {app.url && (
          <a
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              height: 32,
              padding: "0 12px",
              borderRadius: 6,
              background: "transparent",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              fontSize: 12,
              fontWeight: 500,
              color: "#8a8f98",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,.04)"
              e.currentTarget.style.color = "#f7f8f8"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent"
              e.currentTarget.style.color = "#8a8f98"
            }}
          >
            Listing <ExternalLink size={12} />
          </a>
        )}
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function JobDiscoveryClient({ settings, initialDiscovered }: Props) {
  const [enabled, setEnabled] = useState(settings.enabled)
  const [keywords, setKeywords] = useState<string[]>(settings.keywords ?? [])
  const [discovered, setDiscovered] = useState<DiscoveredApp[]>(initialDiscovered)
  const [running, setRunning] = useState(false)

  const handleToggle = async (v: boolean) => {
    const prev = enabled
    setEnabled(v)
    try {
      await toggleEnabled(v)
    } catch {
      setEnabled(prev)
    }
  }

  const handleKeywords = async (kw: string[]) => {
    const prev = keywords
    setKeywords(kw)
    try {
      await saveKeywords(kw)
    } catch {
      setKeywords(prev)
    }
  }

  const handleDismiss = async (id: string) => {
    const prev = discovered
    setDiscovered((d) => d.filter((x) => x.id !== id))
    try {
      await dismissJob(id)
    } catch {
      setDiscovered(prev)
    }
  }

  const runNow = () => {
    setRunning(true)
    setTimeout(() => setRunning(false), 1600)
  }

  const status = running
    ? { color: "#a5acf0", Icon: Loader, label: "Running now…", spin: true }
    : { color: "#10b981", Icon: Check, label: "Success", spin: false }

  return (
    <div style={{ padding: 32, maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: 24,
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "#8a8f98",
              textTransform: "uppercase",
              letterSpacing: ".06em",
              marginBottom: 6,
            }}
          >
            Automation
          </div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: "-0.03em",
              color: "#f7f8f8",
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            Job Discovery
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "#8a8f98",
              marginTop: 6,
              marginBottom: 0,
              maxWidth: 540,
              lineHeight: 1.5,
            }}
          >
            Auto-discover roles from OnlineJobs.ph and queue them as wishlist applications — drag,
            dismiss, or optimize from there.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={runNow}
            style={{
              height: 40,
              padding: "0 16px",
              borderRadius: 8,
              background: "#0f1011",
              border: "1px solid rgba(255,255,255,.08)",
              color: "#f7f8f8",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#16181a")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#0f1011")}
          >
            <RefreshCw
              size={14}
              style={{ animation: running ? "spin 1s linear infinite" : "none" }}
            />
            {running ? "Checking…" : "Run check now"}
          </button>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              height: 40,
              padding: "0 14px",
              borderRadius: 8,
              background: enabled ? "rgba(94,106,210,.08)" : "#0f1011",
              border: enabled
                ? "1px solid rgba(94,106,210,.25)"
                : "1px solid rgba(255,255,255,.08)",
              transition: "all 150ms",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 500, color: enabled ? "#f7f8f8" : "#8a8f98" }}>
              {enabled ? "Enabled" : "Paused"}
            </span>
            <Switch checked={enabled} onChange={handleToggle} />
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 }}>
        <StatCard
          icon={Clock}
          label="Last Checked"
          value={settings.last_run_at ? relativeTime(settings.last_run_at) : "—"}
          sub={enabled ? "Next run in ~22h · 8:00 AM daily" : "Discovery is paused"}
        />
        <StatCard
          icon={status.Icon}
          label="Run Status"
          value={
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <PulseDot color={status.color} />
              <span style={{ color: status.color }}>{status.label}</span>
            </span>
          }
          sub={running ? "Scraping listings…" : "Ready"}
        />
        <StatCard
          icon={Sparkles}
          label="Discovered"
          value={`${discovered.length}`}
          valueColor="#5e6ad2"
          sub="in the last 7 days"
        />
      </div>

      {/* Sources */}
      <section style={{ marginBottom: 28 }}>
        <SectionHeader title="Sources" sub="Where we look for matching roles" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <SourceTile active={enabled} count={discovered.length} />
          <SourcePlaceholder />
        </div>
      </section>

      {/* Keywords */}
      <section style={{ marginBottom: 28 }}>
        <SectionHeader
          title="Keywords"
          sub="Each keyword runs as its own search. New matches are queued as wishlist applications."
          action={
            <span
              style={{ fontSize: 11, color: "#8a8f98", fontVariantNumeric: "tabular-nums" }}
            >
              {keywords.length}/20
            </span>
          }
        />
        {keywords.length === 0 && <NoKeywordsBanner />}
        <KeywordsEditor keywords={keywords} onChange={handleKeywords} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginTop: 8,
            fontSize: 11,
            color: "#62666d",
          }}
        >
          <Info size={11} />
          Press{" "}
          <kbd
            style={{
              fontSize: 10,
              padding: "1px 5px",
              borderRadius: 3,
              background: "rgba(255,255,255,.06)",
              border: "1px solid rgba(255,255,255,.08)",
              fontFamily: "var(--font-mono)",
            }}
          >
            Enter
          </kbd>{" "}
          or{" "}
          <kbd
            style={{
              fontSize: 10,
              padding: "1px 5px",
              borderRadius: 3,
              background: "rgba(255,255,255,.06)",
              border: "1px solid rgba(255,255,255,.08)",
              fontFamily: "var(--font-mono)",
            }}
          >
            ,
          </kbd>{" "}
          to add. Backspace removes the last chip.
        </div>
      </section>

      {/* Recently discovered */}
      <section>
        <SectionHeader
          title="Recently Discovered"
          sub="Last 7 days · auto-discovered roles waiting in your wishlist"
          action={
            <Link
              href="/applications"
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: "#5e6ad2",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              View all <ArrowRight size={12} />
            </Link>
          }
        />
        {discovered.length === 0 ? (
          <EmptyDiscoveries />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {discovered.map((app) => (
              <DiscoveredCard key={app.id} app={app} onDismiss={() => handleDismiss(app.id)} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
