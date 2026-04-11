import { Skeleton } from "@/components/ui/skeleton"

export default function SettingsLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto w-full flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-4 w-40" />
      </div>

      {/* Profile card */}
      <section className="bg-card rounded-xl border border-border shadow-card p-5 flex flex-col gap-4">
        <Skeleton className="h-4 w-14" />
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3.5 w-10" />
            <Skeleton className="h-3.5 w-32" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-3.5 w-10" />
            <Skeleton className="h-3.5 w-44" />
          </div>
        </div>
      </section>

      {/* Account card */}
      <section className="bg-card rounded-xl border border-border shadow-card p-5 flex flex-col gap-3">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </section>
    </div>
  )
}
