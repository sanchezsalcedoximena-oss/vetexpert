import { api } from "./api";

export type Cliente = {
  id: string;
  nombres: string;
  apellidos: string;
  dni: string | null;
  celular: string | null;
  correo: string;
  direccion: string | null;
  activo: boolean;
  creadoEn: string;
  actualizadoEn: string;
};

export type ClientesMeta = {
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
};

export type ClientesQuery = {
  pagina: number;
  limite: number;
  busqueda?: string;
  estado?: "todos" | "activos" | "inactivos";
};

export type ClientePayload = {
  nombres: string;
  apellidos: string;
  dni: string;
  celular: string;
  correo: string;
  direccion?: string;
  activo?: boolean;
};

export async function listarClientes(query: ClientesQuery) {
  const { data } = await api.get<{ datos: Cliente[]; meta: ClientesMeta }>("/api/clientes", {
    params: query
  });
  return data;
}

export async function obtenerCliente(id: string) {
  const { data } = await api.get<Cliente>(`/api/clientes/${id}`);
  return data;
}

export async function crearCliente(payload: ClientePayload) {
  const { data } = await api.post<Cliente>("/api/clientes", payload);
  return data;
}

export async function actualizarCliente(id: string, payload: Partial<ClientePayload>) {
  const { data } = await api.patch<Cliente>(`/api/clientes/${id}`, payload);
  return data;
}

export async function eliminarCliente(id: string) {
  const { data } = await api.delete<{ mensaje: string }>(`/api/clientes/${id}`);
  return data;
}
