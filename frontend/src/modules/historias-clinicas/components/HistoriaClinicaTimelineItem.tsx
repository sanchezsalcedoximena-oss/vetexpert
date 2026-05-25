import { CalendarDays, Eye, FilePenLine, Lock, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { HistoriaClinica } from "@/services/historias-clinicas";
import { HistoriaClinicaBadge } from "./HistoriaClinicaBadge";

type HistoriaClinicaTimelineItemProps = {
  accionEnCurso: boolean;
  historia: HistoriaClinica;
  puedeEditar: boolean;
  puedeCerrar: boolean;
  puedeReabrir: boolean;
  onCerrar: (historia: HistoriaClinica) => void;
  onEditar: (historia: HistoriaClinica) => void;
  onReabrir: (historia: HistoriaClinica) => void;
  onVerDetalle: (historia: HistoriaClinica) => void;
};

export function HistoriaClinicaTimelineItem({
  accionEnCurso,
  historia,
  onCerrar,
  onEditar,
  onReabrir,
  onVerDetalle,
  puedeCerrar,
  puedeEditar,
  puedeReabrir
}: HistoriaClinicaTimelineItemProps) {
  return (
    <article className="relative rounded-md border border-borde bg-fondo p-4">
      <span className="absolute -left-[25px] top-5 hidden h-3 w-3 rounded-full border-2 border-superficie bg-primario md:block" />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 text-sm font-bold">
              <CalendarDays className="h-4 w-4 text-primario" />
              {formatearFecha(historia.fecha)}
            </div>
            <HistoriaClinicaBadge cerrada={historia.cerrada} />
          </div>
          <p className="mt-2 text-sm text-texto/60">
            Vet. {historia.veterinario.nombres} {historia.veterinario.apellidos}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
          <Button aria-label="Ver detalle" disabled={accionEnCurso} size="icon" title="Ver detalle" type="button" variant="ghost" onClick={() => onVerDetalle(historia)}>
            <Eye className="h-4 w-4" />
          </Button>
          {puedeEditar ? (
            <Button aria-label="Editar" disabled={accionEnCurso} size="icon" title="Editar" type="button" variant="ghost" onClick={() => onEditar(historia)}>
              <FilePenLine className="h-4 w-4" />
            </Button>
          ) : null}
          {puedeCerrar ? (
            <Button aria-label="Cerrar historia" disabled={accionEnCurso} size="icon" title="Cerrar historia" type="button" variant="ghost" onClick={() => onCerrar(historia)}>
              <Lock className="h-4 w-4" />
            </Button>
          ) : null}
          {puedeReabrir ? (
            <Button aria-label="Reabrir historia" disabled={accionEnCurso} size="icon" title="Reabrir historia" type="button" variant="ghost" onClick={() => onReabrir(historia)}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm">
        <Resumen label="Diagnostico" value={historia.diagnostico} />
        <Resumen label="Tratamiento" value={historia.tratamiento} />
      </div>
    </article>
  );
}

function Resumen({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-texto/45">{label}</p>
      <p className={cn("mt-1 line-clamp-2 leading-6 text-texto/78")}>{value}</p>
    </div>
  );
}

function formatearFecha(fecha: string) {
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(fecha));
}
