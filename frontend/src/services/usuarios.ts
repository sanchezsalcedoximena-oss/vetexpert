import { api } from "./api";

export type Veterinario = {
  id: string;
  nombres: string;
  apellidos: string;
  correo: string;
  celular: string | null;
  activo: boolean;
};

export async function listarVeterinarios() {
  const { data } = await api.get<Veterinario[]>("/api/usuarios/veterinarios");
  return data;
}
