import { DashboardShell } from "@/modules/dashboard/components/DashboardShell";
import { PlaceholderPanel } from "@/modules/dashboard/components/PlaceholderPanel";

export default function DashboardClientesPage() {
  return (
    <DashboardShell titulo="Clientes" descripcion="Acceso protegido al espacio de clientes.">
      <PlaceholderPanel
        titulo="Modulo clientes preparado"
        descripcion="La ruta protegida existe para la navegacion base. El CRUD de clientes corresponde a su fase especifica."
      />
    </DashboardShell>
  );
}
