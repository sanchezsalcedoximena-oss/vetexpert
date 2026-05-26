"use client";

import { AlertCircle, CalendarCheck, CalendarClock, CheckCircle2, ClipboardList, HeartPulse, PawPrint, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { obtenerResumenDashboard, type DashboardResumen, type RolDashboard } from "@/services/dashboard";
import { useAuthStore } from "@/store/auth-store";
import { DashboardChartCard } from "./DashboardChartCard";
import { DashboardMetricCard } from "./DashboardMetricCard";
import { DashboardQuickActions } from "./DashboardQuickActions";
import { DashboardSectionSkeleton } from "./DashboardSectionSkeleton";
import { UpcomingAppointments } from "./UpcomingAppointments";

export function DashboardOverview() {
  const usuario = useAuthStore((state) => state.usuario);
  const [resumen, setResumen] = useState<DashboardResumen>();
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  const cargarResumen = useCallback(async () => {
    setCargando(true);
    setError(false);

    try {
      const data = await obtenerResumenDashboard();
      setResumen(data);
    } catch {
      setError(true);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargarResumen();
  }, [cargarResumen]);

  const rol = resumen?.rol ?? usuario?.rol;
  const metricas = useMemo(() => (resumen && rol ? crearMetricas(resumen, rol) : []), [resumen, rol]);

  if (cargando) {
    return <DashboardSectionSkeleton />;
  }

  if (error || !resumen || !rol) {
    return (
      <EmptyState
        titulo="No se pudo cargar el dashboard"
        descripcion="Intenta nuevamente para consultar las metricas operativas actuales."
        action={
          <Button type="button" onClick={() => void cargarResumen()}>
            Reintentar
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Metricas principales">
        {metricas.map((metrica) => (
          <DashboardMetricCard key={metrica.titulo} {...metrica} />
        ))}
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <UpcomingAppointments citas={resumen.proximasCitas} />
        <DashboardQuickActions rol={rol} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <DashboardChartCard
          titulo="Citas por estado"
          descripcion="Distribucion del periodo actual."
          items={resumen.citasPorEstado.map((item) => ({
            etiqueta: etiquetaEstado(item.estado),
            valor: item.total,
            tono: tonoEstado(item.estado)
          }))}
        />
        <DashboardChartCard
          titulo="Mascotas por especie"
          descripcion={rol === "VETERINARIO" ? "Pacientes relacionados a tus citas." : "Pacientes activos registrados."}
          items={resumen.mascotasPorEspecie.map((item) => ({
            etiqueta: item.especie,
            valor: item.total,
            tono: "success"
          }))}
        />
      </div>

      {rol === "ADMIN" && resumen.staffPorRol ? (
        <DashboardChartCard
          titulo="Staff activo por rol"
          descripcion="Distribucion administrativa disponible solo para ADMIN."
          items={resumen.staffPorRol.map((item) => ({
            etiqueta: etiquetaRol(item.rol),
            valor: item.total,
            tono: item.rol === "VETERINARIO" ? "primary" : item.rol === "SECRETARIA" ? "warning" : "success"
          }))}
        />
      ) : null}
    </div>
  );
}

function crearMetricas(resumen: DashboardResumen, rol: RolDashboard) {
  const detalleRol = rol === "VETERINARIO" ? "Datos asociados a tu agenda" : "Vision operativa actual";

  return [
    {
      titulo: "Citas de hoy",
      valor: resumen.metricas.citasHoy,
      detalle: detalleRol,
      icono: CalendarClock,
      tono: "primary" as const
    },
    {
      titulo: "Pendientes",
      valor: resumen.metricas.citasPendientes,
      detalle: "Citas por atender en el periodo",
      icono: ClipboardList,
      tono: "warning" as const
    },
    {
      titulo: "Confirmadas",
      valor: resumen.metricas.citasConfirmadas,
      detalle: "Agenda confirmada del periodo",
      icono: CalendarCheck,
      tono: "success" as const
    },
    {
      titulo: "Completadas",
      valor: resumen.metricas.citasCompletadas,
      detalle: "Atenciones finalizadas del periodo",
      icono: CheckCircle2,
      tono: "success" as const
    },
    {
      titulo: rol === "VETERINARIO" ? "Clientes relacionados" : "Clientes activos",
      valor: resumen.metricas.clientesActivos,
      detalle: rol === "VETERINARIO" ? "Duenos asociados a tus citas" : "Registros administrativos activos",
      icono: Users,
      tono: "primary" as const
    },
    {
      titulo: rol === "VETERINARIO" ? "Pacientes relacionados" : "Mascotas activas",
      valor: resumen.metricas.mascotasActivas,
      detalle: rol === "VETERINARIO" ? "Pacientes asociados a tu agenda" : "Pacientes activos registrados",
      icono: PawPrint,
      tono: "primary" as const
    },
    {
      titulo: "Historias abiertas",
      valor: resumen.metricas.historiasAbiertas,
      detalle: rol === "VETERINARIO" ? "Historias clinicas bajo tu atencion" : "Historias pendientes de cierre",
      icono: HeartPulse,
      tono: resumen.metricas.historiasAbiertas > 0 ? ("danger" as const) : ("success" as const)
    },
    {
      titulo: "Estado operativo",
      valor: resumen.proximasCitas.length,
      detalle: "Proximas citas visibles",
      icono: AlertCircle,
      tono: "primary" as const
    }
  ];
}

function etiquetaEstado(estado: string) {
  const etiquetas: Record<string, string> = {
    PENDIENTE: "Pendientes",
    CONFIRMADA: "Confirmadas",
    COMPLETADA: "Completadas",
    CANCELADA: "Canceladas"
  };

  return etiquetas[estado] ?? estado;
}

function tonoEstado(estado: string) {
  const tonos: Record<string, "primary" | "success" | "warning" | "danger"> = {
    PENDIENTE: "warning",
    CONFIRMADA: "primary",
    COMPLETADA: "success",
    CANCELADA: "danger"
  };

  return tonos[estado] ?? "primary";
}

function etiquetaRol(rol: RolDashboard) {
  const etiquetas: Record<RolDashboard, string> = {
    ADMIN: "Administradores",
    SECRETARIA: "Secretarias",
    VETERINARIO: "Veterinarios"
  };

  return etiquetas[rol];
}
