import { DashboardShell } from "@/modules/dashboard/components/DashboardShell";
import { CitasPage } from "@/modules/citas/components/CitasPage";

export default function DashboardCitasPage() {
  return (
    <DashboardShell titulo="Citas" descripcion="Gestiona citas con busqueda, filtros, paginacion y acciones seguras.">
      <CitasPage />
    </DashboardShell>
  );
}
