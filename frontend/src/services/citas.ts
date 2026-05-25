import { api } from "./api";

export type EstadoCita = "PENDIENTE" | "CONFIRMADA" | "COMPLETADA" | "CANCELADA";

export type Cita = {
  id: string;
  fecha: string;
  motivo: string;
  observaciones: string | null;
  estado: EstadoCita;
  mascotaId: string;
  veterinarioId: string;
  clienteId: string;
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
  cliente: {
    id: string;
    nombres: string;
    apellidos: string;
    dni: string | null;
    celular: string | null;
  };
  creadoEn: string;
  actualizadoEn: string;
};

export type CitasMeta = {
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
};

export type CitasQuery = {
  pagina: number;
  limite: number;
  busqueda?: string;
  estado?: EstadoCita;
  veterinarioId?: string;
  clienteId?: string;
  mascotaId?: string;
  fechaInicio?: string;
  fechaFin?: string;
};

export type CitaPayload = {
  fecha: string;
  motivo: string;
  observaciones?: string;
  estado?: EstadoCita;
  mascotaId: string;
  veterinarioId: string;
};

export async function listarCitas(query: CitasQuery) {
  const { data } = await api.get<{ datos: Cita[]; meta: CitasMeta }>("/api/citas", {
    params: query
  });
  return data;
}

export async function obtenerCita(id: string) {
  const { data } = await api.get<Cita>(`/api/citas/${id}`);
  return data;
}

export async function crearCita(payload: CitaPayload) {
  const { data } = await api.post<Cita>("/api/citas", payload);
  return data;
}

export async function actualizarCita(id: string, payload: Partial<CitaPayload>) {
  const { data } = await api.patch<Cita>(`/api/citas/${id}`, payload);
  return data;
}

export async function eliminarCita(id: string) {
  const { data } = await api.delete<{ mensaje: string }>(`/api/citas/${id}`);
  return data;
}
