import { DashboardOverview } from "@/modules/dashboard/components/DashboardOverview";
import { DashboardShell } from "@/modules/dashboard/components/DashboardShell";

export default function DashboardPage() {
  return (
    <DashboardShell
      titulo="Dashboard"
      descripcion="Resumen operativo con metricas reales del sistema interno."
    >
      <DashboardOverview />
    </DashboardShell>
  );
}
