import { Skeleton } from "@/components/ui/skeleton"

function CardSkeleton({ lines }: { lines: number }) {
  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-5 flex flex-col gap-2.5">
      <Skeleton className="h-4 w-32 mb-1" />
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={i === lines - 1 ? "h-3.5 w-1/2" : "h-3.5 w-full"} />
      ))}
    </div>
  )
}

// Shared by the resume optimizer and cover letter pages: same header + card layout.
export default function AIToolLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <Skeleton className="h-10 w-40 rounded-lg" />
      <CardSkeleton lines={3} />
      <CardSkeleton lines={6} />
    </div>
  )
}
