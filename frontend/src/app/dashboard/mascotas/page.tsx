import { DashboardShell } from "@/modules/dashboard/components/DashboardShell";
import { MascotasPage } from "@/modules/mascotas/components/MascotasPage";

export default function DashboardMascotasPage() {
  return (
    <DashboardShell titulo="Mascotas" descripcion="Gestiona mascotas con busqueda, filtros, paginacion y acciones seguras.">
      <MascotasPage />
    </DashboardShell>
  );
}
