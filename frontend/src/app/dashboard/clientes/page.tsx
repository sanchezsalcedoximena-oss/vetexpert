import { DashboardShell } from "@/modules/dashboard/components/DashboardShell";
import { ClientesPage } from "@/modules/clientes/components/ClientesPage";

export default function DashboardClientesPage() {
  return (
    <DashboardShell titulo="Clientes" descripcion="Gestiona clientes con busqueda, filtros, paginacion y acciones seguras.">
      <ClientesPage />
    </DashboardShell>
  );
}
