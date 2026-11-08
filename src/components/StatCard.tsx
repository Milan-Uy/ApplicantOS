export function StatCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string | number
  hint?: string
}) {
  return (
    <div className="bg-card rounded-xl p-4 sm:p-5 shadow-card border border-border flex flex-col gap-1 animate-fade-in">
      <span className="text-xs font-medium text-muted-fg uppercase tracking-wide">{label}</span>
      <span className="text-3xl font-bold tabular-nums text-foreground">{value}</span>
      {hint && <span className="text-xs text-muted-fg">{hint}</span>}
    </div>
  )
}
