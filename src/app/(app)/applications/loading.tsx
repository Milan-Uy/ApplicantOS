import { Skeleton } from "@/components/ui/skeleton"

function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-t border-border">
      <Skeleton className="h-3.5 w-28 shrink-0" />
      <Skeleton className="h-3.5 flex-1" />
      <Skeleton className="h-5 w-20 shrink-0" />
      <Skeleton className="h-3.5 w-20 shrink-0 hidden sm:block" />
      <Skeleton className="h-3.5 w-16 shrink-0 hidden sm:block" />
    </div>
  )
}

export default function ApplicationsLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-4 px-4 py-3">
          <Skeleton className="h-3 w-20 shrink-0" />
          <Skeleton className="h-3 flex-1" />
          <Skeleton className="h-3 w-16 shrink-0" />
          <Skeleton className="h-3 w-16 shrink-0 hidden sm:block" />
          <Skeleton className="h-3 w-14 shrink-0 hidden sm:block" />
        </div>
        <TableRowSkeleton />
        <TableRowSkeleton />
        <TableRowSkeleton />
        <TableRowSkeleton />
        <TableRowSkeleton />
        <TableRowSkeleton />
        <TableRowSkeleton />
        <TableRowSkeleton />
      </div>
    </div>
  )
}
