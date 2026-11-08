import { Skeleton } from "@/components/ui/skeleton"

function SectionSkeleton({ lines }: { lines: number }) {
  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-5 flex flex-col gap-2.5">
      <Skeleton className="h-4 w-28 mb-1" />
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={i === lines - 1 ? "h-3.5 w-2/3" : "h-3.5 w-full"} />
      ))}
    </div>
  )
}

export default function ApplicationDetailLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full flex flex-col gap-6">
      <Skeleton className="h-4 w-24" />
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-16 rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <SectionSkeleton lines={8} />
          <SectionSkeleton lines={3} />
        </div>
        <div className="flex flex-col gap-4">
          <SectionSkeleton lines={5} />
          <SectionSkeleton lines={2} />
        </div>
      </div>
    </div>
  )
}
