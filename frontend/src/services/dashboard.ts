import { api } from "./api";
import type { EstadoCita } from "./citas";

export type RolDashboard = "ADMIN" | "SECRETARIA" | "VETERINARIO";

export type DashboardResumenQuery = {
  fechaInicio?: string;
  fechaFin?: string;
};

export type DashboardPeriodo = {
  fechaInicio: string;
  fechaFin: string;
};

export type DashboardMetricas = {
  citasHoy: number;
  citasPendientes: number;
  citasConfirmadas: number;
  citasCompletadas: number;
  clientesActivos: number;
  mascotasActivas: number;
  historiasAbiertas: number;
};

export type DashboardProximaCita = {
  id: string;
  fecha: string;
  motivo: string;
  estado: Extract<EstadoCita, "PENDIENTE" | "CONFIRMADA">;
  mascota: {
    id: string;
    nombre: string;
    especie: string;
    raza: string | null;
  };
  cliente: {
    id: string;
    nombres: string;
    apellidos: string;
    celular: string | null;
  };
  veterinario: {
    id: string;
    nombres: string;
    apellidos: string;
    correo: string;
  };
};

export type DashboardConteoEstado = {
  estado: EstadoCita;
  total: number;
};

export type DashboardConteoEspecie = {
  especie: string;
  total: number;
};

export type DashboardConteoRol = {
  rol: RolDashboard;
  total: number;
};

export type DashboardResumen = {
  rol: RolDashboard;
  periodo: DashboardPeriodo;
  metricas: DashboardMetricas;
  proximasCitas: DashboardProximaCita[];
  citasPorEstado: DashboardConteoEstado[];
  mascotasPorEspecie: DashboardConteoEspecie[];
  staffPorRol?: DashboardConteoRol[];
};

export async function obtenerResumenDashboard(query?: DashboardResumenQuery) {
  const { data } = await api.get<DashboardResumen>("/api/dashboard/resumen", {
    params: query
  });
  return data;
}
