import { Skeleton } from "@/components/ui/skeleton"

function StatCardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-3 w-36" />
        </div>
      </div>
    </div>
  )
}

function DiscoveredCardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4 flex flex-col gap-3">
      <Skeleton className="h-4 w-16 rounded" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-3 w-24" />
      <div className="flex gap-2 pt-3 border-t border-border">
        <Skeleton className="h-8 flex-1 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
    </div>
  )
}

export default function JobDiscoveryLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1100px] mx-auto w-full flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-16" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-[68px] rounded-xl" />
          <Skeleton className="h-[68px] rounded-xl" />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-16 rounded-lg" />
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-40" />
        <div className="grid grid-cols-2 gap-3">
          <DiscoveredCardSkeleton />
          <DiscoveredCardSkeleton />
          <DiscoveredCardSkeleton />
          <DiscoveredCardSkeleton />
        </div>
      </div>
    </div>
  )
}
