import { Skeleton } from "@/components/ui/skeleton"

function FieldSkeleton({ tall = false }: { tall?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Skeleton className="h-3.5 w-24" />
      <Skeleton className={tall ? "h-28 w-full rounded-lg" : "h-8 w-full rounded-lg"} />
    </div>
  )
}

export default function ApplicationFormLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto w-full">
      <Skeleton className="h-4 w-36 mb-4" />
      <Skeleton className="h-7 w-56" />
      <Skeleton className="h-4 w-44 mt-1.5" />
      <div className="mt-8 flex flex-col gap-5">
        <div className="grid sm:grid-cols-2 gap-5">
          <FieldSkeleton />
          <FieldSkeleton />
        </div>
        <FieldSkeleton />
        <div className="grid sm:grid-cols-2 gap-5">
          <FieldSkeleton />
          <FieldSkeleton />
        </div>
        <FieldSkeleton />
        <FieldSkeleton />
        <FieldSkeleton tall />
      </div>
    </div>
  )
}
