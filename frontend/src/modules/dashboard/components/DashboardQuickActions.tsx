import { CalendarPlus, ClipboardList, FileText, PawPrint, UserCog, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import type { RolDashboard } from "@/services/dashboard";
import { cn } from "@/lib/utils";

type AccionRapida = {
  titulo: string;
  href: string;
  icono: LucideIcon;
  roles: RolDashboard[];
};

const acciones: AccionRapida[] = [
  { titulo: "Nueva cita", href: "/dashboard/citas", icono: CalendarPlus, roles: ["ADMIN", "SECRETARIA"] },
  { titulo: "Agenda", href: "/dashboard/citas", icono: ClipboardList, roles: ["ADMIN", "SECRETARIA", "VETERINARIO"] },
  { titulo: "Clientes", href: "/dashboard/clientes", icono: Users, roles: ["ADMIN", "SECRETARIA"] },
  { titulo: "Mascotas", href: "/dashboard/mascotas", icono: PawPrint, roles: ["ADMIN", "SECRETARIA", "VETERINARIO"] },
  { titulo: "Historias", href: "/dashboard/mascotas", icono: FileText, roles: ["ADMIN", "SECRETARIA", "VETERINARIO"] },
  { titulo: "Staff", href: "/dashboard/staff", icono: UserCog, roles: ["ADMIN"] }
];

type DashboardQuickActionsProps = {
  rol: RolDashboard;
};

export function DashboardQuickActions({ rol }: DashboardQuickActionsProps) {
  const accionesVisibles = acciones.filter((accion) => accion.roles.includes(rol));

  return (
    <section className="rounded-md border border-borde bg-superficie p-4 sm:p-5" aria-labelledby="acciones-rapidas">
      <div className="mb-4">
        <h2 id="acciones-rapidas" className="text-base font-bold">
          Acciones rapidas
        </h2>
        <p className="mt-1 text-sm text-texto/60">Accesos a flujos existentes del sistema.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {accionesVisibles.map((accion) => {
          const Icono = accion.icono;

          return (
            <Link
              key={`${accion.href}-${accion.titulo}`}
              className={cn(
                "flex min-h-16 items-center gap-3 rounded-md border border-borde bg-fondo px-3 py-3 text-sm font-bold transition",
                "hover:border-primario/45 hover:bg-primario/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primario"
              )}
              href={accion.href}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primario/12 text-primario">
                <Icono className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 break-words">{accion.titulo}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
