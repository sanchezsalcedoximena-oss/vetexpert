import { FileText } from "lucide-react";

export function HistoriaClinicaEmptyState() {
  return (
    <div className="rounded-md border border-dashed border-borde bg-fondo p-6 text-center">
      <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-md bg-primario/10 text-primario">
        <FileText className="h-5 w-5" />
      </div>
      <h3 className="font-bold">Sin historias clinicas</h3>
      <p className="mt-2 text-sm leading-6 text-texto/60">Cuando una atencion completada tenga registro medico, aparecera en esta linea de tiempo.</p>
    </div>
  );
}
