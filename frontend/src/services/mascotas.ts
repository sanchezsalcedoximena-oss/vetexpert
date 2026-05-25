import { api } from "./api";

export type Mascota = {
  id: string;
  nombre: string;
  especie: string;
  raza: string | null;
  sexo: string;
  fechaNacimiento: string | null;
  peso: number | null;
  color: string | null;
  esterilizado: boolean;
  alergias: string | null;
  observaciones: string | null;
  fotoUrl: string | null;
  activo: boolean;
  clienteId: string;
  cliente: {
    id: string;
    nombres: string;
    apellidos: string;
    dni: string | null;
  };
  creadoEn: string;
  actualizadoEn: string;
};

export type MascotasMeta = {
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
};

export type MascotasQuery = {
  pagina: number;
  limite: number;
  busqueda?: string;
  estado?: "todos" | "activos" | "inactivos";
  especie?: string;
  clienteId?: string;
};

export type MascotaPayload = {
  nombre: string;
  especie: string;
  raza?: string;
  sexo: string;
  fechaNacimiento?: string;
  peso?: number;
  color?: string;
  esterilizado?: boolean;
  alergias?: string;
  observaciones?: string;
  clienteId: string;
  activo?: boolean;
};

export async function listarMascotas(query: MascotasQuery) {
  const { data } = await api.get<{ datos: Mascota[]; meta: MascotasMeta }>("/api/mascotas", {
    params: query
  });
  return data;
}

export async function obtenerMascota(id: string) {
  const { data } = await api.get<Mascota>(`/api/mascotas/${id}`);
  return data;
}

export async function crearMascota(payload: MascotaPayload) {
  const { data } = await api.post<Mascota>("/api/mascotas", payload);
  return data;
}

export async function actualizarMascota(id: string, payload: Partial<MascotaPayload>) {
  const { data } = await api.patch<Mascota>(`/api/mascotas/${id}`, payload);
  return data;
}

export async function eliminarMascota(id: string) {
  const { data } = await api.delete<{ mensaje: string }>(`/api/mascotas/${id}`);
  return data;
}
