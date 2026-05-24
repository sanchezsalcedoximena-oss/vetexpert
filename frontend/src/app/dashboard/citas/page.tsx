import { DashboardShell } from "@/modules/dashboard/components/DashboardShell";
import { PlaceholderPanel } from "@/modules/dashboard/components/PlaceholderPanel";

export default function DashboardCitasPage() {
  return (
    <DashboardShell titulo="Citas" descripcion="Acceso protegido al espacio de citas.">
      <PlaceholderPanel
        titulo="Agenda preparada"
        descripcion="Solo se habilita la ruta protegida y navegacion base. La funcionalidad de citas se mantiene para su fase futura."
      />
    </DashboardShell>
  );
}
