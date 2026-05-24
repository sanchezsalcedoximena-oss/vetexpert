import { DashboardShell } from "@/modules/dashboard/components/DashboardShell";
import { PlaceholderPanel } from "@/modules/dashboard/components/PlaceholderPanel";

export default function DashboardMascotasPage() {
  return (
    <DashboardShell titulo="Mascotas" descripcion="Acceso protegido al espacio de mascotas.">
      <PlaceholderPanel
        titulo="Modulo mascotas preparado"
        descripcion="La ruta protegida existe para la navegacion base. La gestion de mascotas se implementara en su fase."
      />
    </DashboardShell>
  );
}
