import {
  CalendarDays,
  ChartColumn,
  HeartPulse,
  Home,
  Settings,
  ShieldCheck,
  Stethoscope,
  Syringe,
  Users,
  Wrench
} from "lucide-react";

const enlaces = [
  { nombre: "Dashboard", icono: Home },
  { nombre: "Clientes", icono: Users },
  { nombre: "Mascotas", icono: HeartPulse },
  { nombre: "Citas", icono: CalendarDays },
  { nombre: "Consultas", icono: Stethoscope },
  { nombre: "Vacunas", icono: Syringe },
  { nombre: "Reportes", icono: ChartColumn },
  { nombre: "Configuracion", icono: Settings },
  { nombre: "Mantenimiento", icono: Wrench }
];

export function Sidebar() {
  return (
    <aside className="hidden border-r border-borde bg-superficie px-3 py-4 md:block">
      <div className="mb-5 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primario text-white">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold">VetExpert</p>
          <p className="text-xs text-texto/60">Sistema veterinario</p>
        </div>
      </div>
      <nav className="space-y-1">
        {enlaces.map((enlace) => {
          const Icono = enlace.icono;

          return (
            <a
              key={enlace.nombre}
              className="flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-texto/72 transition hover:bg-primario/10 hover:text-texto"
              href="#"
            >
              <Icono className="h-4 w-4" />
              <span>{enlace.nombre}</span>
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
