import { Skeleton } from "@/components/ui/skeleton"

function ResumeCardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-5 w-12 rounded-md" />
      </div>
      <Skeleton className="h-3 w-24" />
      <div className="flex gap-2 mt-1">
        <Skeleton className="h-8 flex-1 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    </div>
  )
}

export default function ResumesLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Upload zone */}
      <Skeleton className="h-32 w-full rounded-xl" />

      {/* Resume grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ResumeCardSkeleton />
        <ResumeCardSkeleton />
        <ResumeCardSkeleton />
      </div>
    </div>
  )
}
