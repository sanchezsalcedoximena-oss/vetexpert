import { EmptyState } from "@/components/ui/EmptyState";

export function HistoriaClinicaEmptyState() {
  return (
    <EmptyState
      className="max-w-none p-6"
      titulo="Sin historias clinicas"
      descripcion="Cuando una atencion completada tenga registro medico, aparecera en esta linea de tiempo."
    />
  );
}
