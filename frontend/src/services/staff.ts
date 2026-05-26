import { api } from "./api";

export type RolStaff = "ADMIN" | "VETERINARIO" | "SECRETARIA";
export type EstadoStaffFiltro = "todos" | "activos" | "inactivos";

export type Staff = {
  id: string;
  nombres: string;
  apellidos: string;
  correo: string;
  dni: string | null;
  celular: string | null;
  direccion: string | null;
  rol: RolStaff;
  activo: boolean;
  ultimoAccesoEn: string | null;
  creadoEn: string;
  actualizadoEn: string;
  eliminadoEn: string | null;
};

export type StaffMeta = {
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
};

export type StaffQuery = {
  pagina: number;
  limite: number;
  busqueda?: string;
  rol?: RolStaff;
  estado?: EstadoStaffFiltro;
};

export type CrearStaffPayload = {
  nombres: string;
  apellidos: string;
  correo: string;
  dni?: string;
  celular?: string;
  direccion?: string;
  rol: RolStaff;
  contrasena: string;
  activo?: boolean;
};

export type ActualizarStaffPayload = Partial<Omit<CrearStaffPayload, "contrasena" | "activo">>;

export async function listarStaff(query: StaffQuery) {
  const { data } = await api.get<{ datos: Staff[]; meta: StaffMeta }>("/api/staff", {
    params: query
  });
  return data;
}

export async function obtenerStaff(id: string) {
  const { data } = await api.get<Staff>(`/api/staff/${id}`);
  return data;
}

export async function crearStaff(payload: CrearStaffPayload) {
  const { data } = await api.post<Staff>("/api/staff", payload);
  return data;
}

export async function actualizarStaff(id: string, payload: ActualizarStaffPayload) {
  const { data } = await api.patch<Staff>(`/api/staff/${id}`, payload);
  return data;
}

export async function activarStaff(id: string) {
  const { data } = await api.patch<Staff>(`/api/staff/${id}/activar`);
  return data;
}

export async function inactivarStaff(id: string) {
  const { data } = await api.patch<Staff>(`/api/staff/${id}/inactivar`);
  return data;
}
