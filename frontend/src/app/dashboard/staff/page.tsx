import { DashboardShell } from "@/modules/dashboard/components/DashboardShell";
import { StaffPage } from "@/modules/staff/components/StaffPage";

export default function DashboardStaffPage() {
  return (
    <DashboardShell titulo="Staff" descripcion="Gestiona usuarios internos, roles y estado de acceso administrativo.">
      <StaffPage />
    </DashboardShell>
  );
}
