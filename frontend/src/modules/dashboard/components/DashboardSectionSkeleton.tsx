import { Skeleton } from "@/components/ui/Skeleton";

export function DashboardSectionSkeleton() {
  return (
    <div className="space-y-5" aria-label="Cargando dashboard">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-md border border-borde bg-superficie p-5">
            <Skeleton className="mb-5 h-11 w-11" />
            <Skeleton className="mb-3 h-4 w-2/3" />
            <Skeleton className="mb-3 h-8 w-1/2" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Skeleton className="h-72 rounded-md" />
        <Skeleton className="h-72 rounded-md" />
      </div>
      <Skeleton className="h-40 rounded-md" />
    </div>
  );
}
