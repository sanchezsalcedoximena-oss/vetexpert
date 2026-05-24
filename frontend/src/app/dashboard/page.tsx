import { DashboardCards } from "@/modules/dashboard/components/DashboardCards";
import { DashboardShell } from "@/modules/dashboard/components/DashboardShell";

export default function DashboardPage() {
  return (
    <DashboardShell
      titulo="Dashboard"
      descripcion="Vista base del sistema interno con sesion persistente, rutas protegidas y resumen inicial."
    >
      <DashboardCards />
      <section className="mt-5 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-md border border-borde bg-superficie p-5">
          <h2 className="text-lg font-bold">Actividad reciente</h2>
          <div className="mt-5 space-y-4">
            {["Sesion protegida iniciada", "Perfil autenticado disponible", "Dashboard listo para modulos"].map((item) => (
              <div key={item} className="flex items-center justify-between gap-3 border-b border-borde pb-3 last:border-b-0 last:pb-0">
                <span className="text-sm font-medium">{item}</span>
                <span className="text-xs font-semibold text-texto/45">Ahora</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-md border border-borde bg-superficie p-5">
          <h2 className="text-lg font-bold">Estado</h2>
          <p className="mt-3 text-sm leading-6 text-texto/65">
            La base visual queda preparada para clientes, mascotas y citas sin implementar sus flujos internos todavia.
          </p>
        </div>
      </section>
    </DashboardShell>
  );
}
