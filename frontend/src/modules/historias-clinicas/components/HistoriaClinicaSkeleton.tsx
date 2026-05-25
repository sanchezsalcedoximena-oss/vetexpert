import { Skeleton } from "@/components/ui/Skeleton";

export function HistoriaClinicaSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="rounded-md border border-borde bg-fondo p-4">
          <div className="flex items-start gap-3">
            <Skeleton className="h-9 w-9 shrink-0" />
            <div className="w-full space-y-3">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
