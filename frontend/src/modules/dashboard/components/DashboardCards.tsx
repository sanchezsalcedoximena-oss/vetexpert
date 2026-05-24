import { CalendarDays, HeartPulse, PawPrint, Users } from "lucide-react";

const metricas = [
  { titulo: "Pacientes activos", valor: "128", detalle: "Base preparada", icono: PawPrint },
  { titulo: "Clientes", valor: "84", detalle: "Modulo en siguiente fase", icono: Users },
  { titulo: "Citas", valor: "16", detalle: "Agenda base protegida", icono: CalendarDays },
  { titulo: "Alertas clinicas", valor: "6", detalle: "Seguimiento inicial", icono: HeartPulse }
];

export function DashboardCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metricas.map((metrica) => {
        const Icono = metrica.icono;

        return (
          <article key={metrica.titulo} className="rounded-md border border-borde bg-superficie p-5">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primario/12 text-primario">
                <Icono className="h-5 w-5" />
              </div>
              <span className="rounded-md bg-exito/10 px-2 py-1 text-xs font-bold text-exito">Activo</span>
            </div>
            <p className="text-sm font-semibold text-texto/60">{metrica.titulo}</p>
            <p className="mt-2 text-3xl font-bold">{metrica.valor}</p>
            <p className="mt-2 text-sm text-texto/55">{metrica.detalle}</p>
          </article>
        );
      })}
    </div>
  );
}
