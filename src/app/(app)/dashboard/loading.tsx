import { Skeleton } from "@/components/ui/skeleton"

function StatCardSkeleton() {
  return (
    <div className="bg-card rounded-xl p-4 sm:p-5 shadow-card border border-border flex flex-col gap-1">
      <Skeleton className="h-3 w-28" />
      <Skeleton className="h-8 w-16 mt-1" />
      <Skeleton className="h-3 w-16 mt-0.5" />
    </div>
  )
}

function ListRowSkeleton({ wide }: { wide?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <Skeleton className={wide ? "h-3 w-20" : "h-5 w-16"} />
        {wide && <Skeleton className="h-3 w-12" />}
      </div>
    </div>
  )
}

function SourceRowSkeleton() {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-6" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
    </div>
  )
}

export default function DashboardLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full flex flex-col gap-8 pb-24 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Two-column section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming interviews */}
        <section>
          <Skeleton className="h-4 w-40 mb-3" />
          <div className="bg-card rounded-xl border border-border shadow-card divide-y divide-border">
            <ListRowSkeleton wide />
            <ListRowSkeleton wide />
            <ListRowSkeleton wide />
          </div>
        </section>

        {/* Source breakdown */}
        <section>
          <Skeleton className="h-4 w-36 mb-3" />
          <div className="bg-card rounded-xl border border-border shadow-card p-4 flex flex-col gap-3">
            <SourceRowSkeleton />
            <SourceRowSkeleton />
            <SourceRowSkeleton />
            <SourceRowSkeleton />
          </div>
        </section>
      </div>

      {/* Recent applications */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-14" />
        </div>
        <div className="bg-card rounded-xl border border-border shadow-card divide-y divide-border">
          <ListRowSkeleton />
          <ListRowSkeleton />
          <ListRowSkeleton />
          <ListRowSkeleton />
          <ListRowSkeleton />
        </div>
      </section>
    </div>
  )
}
