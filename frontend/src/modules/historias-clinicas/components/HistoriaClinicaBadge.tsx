import { cn } from "@/lib/utils";

export function HistoriaClinicaBadge({ cerrada }: { cerrada: boolean }) {
  return (
    <span className={cn("inline-flex rounded-md px-2 py-1 text-xs font-bold", cerrada ? "bg-exito/10 text-exito" : "bg-amber-500/10 text-amber-600")}>
      {cerrada ? "Cerrada" : "Abierta"}
    </span>
  );
}
