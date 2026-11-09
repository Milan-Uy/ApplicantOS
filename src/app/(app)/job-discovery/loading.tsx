import { Skeleton } from "@/components/ui/skeleton"

function StatCardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4 sm:p-5 flex flex-col gap-2">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-24" />
    </div>
  )
}

function DiscoveredCardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4 flex flex-col gap-3">
      <Skeleton className="h-4 w-12 rounded" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-3 w-24" />
      <div className="flex gap-2 pt-3 border-t border-border">
        <Skeleton className="h-7 flex-1 rounded-md" />
        <Skeleton className="h-7 w-20 rounded-md" />
      </div>
    </div>
  )
}

export default function JobDiscoveryLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1100px] mx-auto w-full flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <Skeleton className="h-16 rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      <Skeleton className="h-44 rounded-xl" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-40" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DiscoveredCardSkeleton />
          <DiscoveredCardSkeleton />
          <DiscoveredCardSkeleton />
          <DiscoveredCardSkeleton />
        </div>
      </div>
    </div>
  )
}
