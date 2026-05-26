import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

type DashboardChartItem = {
  etiqueta: string;
  valor: number;
  tono?: "primary" | "success" | "warning" | "danger";
};

type DashboardChartCardProps = {
  titulo: string;
  descripcion: string;
  items: DashboardChartItem[];
};

const tonos = {
  primary: "bg-primario",
  success: "bg-exito",
  warning: "bg-secundario",
  danger: "bg-red-500"
};

export function DashboardChartCard({ descripcion, items, titulo }: DashboardChartCardProps) {
  const total = items.reduce((acumulado, item) => acumulado + item.valor, 0);

  return (
    <section className="rounded-md border border-borde bg-superficie p-4 sm:p-5" aria-labelledby={crearId(titulo)}>
      <div className="mb-4">
        <h2 id={crearId(titulo)} className="text-base font-bold">
          {titulo}
        </h2>
        <p className="mt-1 text-sm text-texto/60">{descripcion}</p>
      </div>

      {total === 0 ? (
        <EmptyState className="max-w-none bg-fondo p-6" titulo="Sin datos" descripcion="Todavia no hay registros para esta distribucion." />
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const porcentaje = total > 0 ? Math.round((item.valor / total) * 100) : 0;

            return (
              <div key={item.etiqueta}>
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0 break-words font-semibold">{item.etiqueta}</span>
                  <span className="shrink-0 font-bold text-texto/70">
                    {item.valor.toLocaleString("es-PE")} · {porcentaje}%
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-md bg-fondo" role="img" aria-label={`${item.etiqueta}: ${porcentaje}%`}>
                  <div className={cn("h-full rounded-md", tonos[item.tono ?? "primary"])} style={{ width: `${porcentaje}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function crearId(valor: string) {
  return valor.toLowerCase().replace(/\s+/g, "-");
}
