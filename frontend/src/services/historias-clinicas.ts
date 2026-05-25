import { api } from "./api";

export type HistoriaClinica = {
  id: string;
  fecha: string;
  diagnostico: string;
  tratamiento: string;
  observaciones: string | null;
  cerrada: boolean;
  citaId: string;
  mascotaId: string;
  veterinarioId: string;
  cita: {
    id: string;
    fecha: string;
    motivo: string;
    estado: "PENDIENTE" | "CONFIRMADA" | "COMPLETADA" | "CANCELADA";
    cliente: {
      id: string;
      nombres: string;
      apellidos: string;
      dni: string | null;
      celular: string | null;
    };
  };
  mascota: {
    id: string;
    nombre: string;
    especie: string;
    raza: string | null;
  };
  veterinario: {
    id: string;
    nombres: string;
    apellidos: string;
    correo: string;
  };
  creadoEn: string;
  actualizadoEn: string;
};

export type HistoriaClinicaDetalle = HistoriaClinica;

export type HistoriasClinicasMeta = {
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
};

export type HistoriasClinicasQuery = {
  pagina: number;
  limite: number;
  busqueda?: string;
  mascotaId?: string;
  veterinarioId?: string;
  citaId?: string;
  fechaInicio?: string;
  fechaFin?: string;
  cerrada?: boolean;
};

export type HistoriasClinicasResponse = {
  datos: HistoriaClinica[];
  meta: HistoriasClinicasMeta;
};

export type HistoriasPorMascotaResponse = {
  datos: HistoriaClinica[];
};

export type HistoriaClinicaPayload = {
  diagnostico: string;
  tratamiento: string;
  observaciones?: string;
  cerrada?: boolean;
};

export async function listarHistoriasClinicas(query: HistoriasClinicasQuery) {
  const { data } = await api.get<HistoriasClinicasResponse>("/api/historias-clinicas", {
    params: query
  });
  return data;
}

export async function listarHistoriasPorMascota(mascotaId: string) {
  const { data } = await api.get<HistoriasPorMascotaResponse>(`/api/historias-clinicas/mascota/${mascotaId}`);
  return data;
}

export async function obtenerHistoriaClinica(id: string) {
  const { data } = await api.get<HistoriaClinicaDetalle>(`/api/historias-clinicas/${id}`);
  return data;
}

export async function crearHistoriaDesdeCita(citaId: string, payload: HistoriaClinicaPayload) {
  const { data } = await api.post<HistoriaClinicaDetalle>(`/api/historias-clinicas/cita/${citaId}`, payload);
  return data;
}

export async function actualizarHistoriaClinica(id: string, payload: Partial<Omit<HistoriaClinicaPayload, "cerrada">>) {
  const { data } = await api.patch<HistoriaClinicaDetalle>(`/api/historias-clinicas/${id}`, payload);
  return data;
}

export async function cerrarHistoriaClinica(id: string) {
  const { data } = await api.patch<HistoriaClinicaDetalle>(`/api/historias-clinicas/${id}/cerrar`);
  return data;
}

export async function reabrirHistoriaClinica(id: string) {
  const { data } = await api.patch<HistoriaClinicaDetalle>(`/api/historias-clinicas/${id}/reabrir`);
  return data;
}

export async function eliminarHistoriaClinica(id: string) {
  const { data } = await api.delete<{ mensaje: string }>(`/api/historias-clinicas/${id}`);
  return data;
}
