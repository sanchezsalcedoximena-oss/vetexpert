import { CalendarClock } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import type { DashboardProximaCita } from "@/services/dashboard";
import { cn } from "@/lib/utils";

type UpcomingAppointmentsProps = {
  citas: DashboardProximaCita[];
};

const estilosEstado: Record<DashboardProximaCita["estado"], string> = {
  PENDIENTE: "bg-secundario/20 text-slate-900 dark:text-secundario",
  CONFIRMADA: "bg-primario/12 text-primario"
};

export function UpcomingAppointments({ citas }: UpcomingAppointmentsProps) {
  return (
    <section className="rounded-md border border-borde bg-superficie p-4 sm:p-5" aria-labelledby="proximas-citas">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 id="proximas-citas" className="text-base font-bold">
            Proximas citas
          </h2>
          <p className="mt-1 text-sm text-texto/60">Agenda inmediata con datos reales.</p>
        </div>
        <Link className="text-sm font-bold text-primario hover:underline" href="/dashboard/citas">
          Ver agenda
        </Link>
      </div>

      {citas.length === 0 ? (
        <EmptyState
          className="max-w-none bg-fondo p-6"
          titulo="Sin proximas citas"
          descripcion="No hay citas pendientes o confirmadas para mostrar en este momento."
        />
      ) : (
        <div className="space-y-3">
          {citas.map((cita) => (
            <article key={cita.id} className="rounded-md border border-borde bg-fondo p-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <CalendarClock className="h-4 w-4 shrink-0 text-primario" aria-hidden="true" />
                    <span className="break-words">{formatearFecha(cita.fecha)}</span>
                  </div>
                  <p className="mt-2 break-words text-sm font-semibold">{cita.motivo}</p>
                  <p className="mt-1 break-words text-sm text-texto/60">
                    {cita.mascota.nombre} · {cita.cliente.nombres} {cita.cliente.apellidos}
                  </p>
                  <p className="mt-1 break-words text-xs text-texto/50">
                    Vet. {cita.veterinario.nombres} {cita.veterinario.apellidos}
                  </p>
                </div>
                <span className={cn("w-fit rounded-md px-2 py-1 text-xs font-bold", estilosEstado[cita.estado])}>{cita.estado}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function formatearFecha(fecha: string) {
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(fecha));
}
