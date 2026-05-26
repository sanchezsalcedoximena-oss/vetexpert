import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type DashboardMetricCardProps = {
  titulo: string;
  valor: number;
  detalle: string;
  icono: LucideIcon;
  tono?: "primary" | "success" | "warning" | "danger";
};

const tonos = {
  primary: "bg-primario/12 text-primario",
  success: "bg-exito/12 text-exito",
  warning: "bg-secundario/20 text-slate-900 dark:text-secundario",
  danger: "bg-red-500/12 text-red-600 dark:text-red-400"
};

export function DashboardMetricCard({ detalle, icono: Icono, titulo, tono = "primary", valor }: DashboardMetricCardProps) {
  return (
    <article className="rounded-md border border-borde bg-superficie p-4 sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-md", tonos[tono])}>
          <Icono className="h-5 w-5" aria-hidden="true" />
        </div>
        <span className="rounded-md bg-fondo px-2 py-1 text-xs font-bold text-texto/55">Real</span>
      </div>
      <p className="text-sm font-semibold text-texto/62">{titulo}</p>
      <p className="mt-2 text-3xl font-bold tracking-normal">{valor.toLocaleString("es-PE")}</p>
      <p className="mt-2 text-sm leading-5 text-texto/55">{detalle}</p>
    </article>
  );
}
