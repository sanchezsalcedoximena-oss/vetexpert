import { api } from "./api";

export type SesionAuth = {
  accessToken: string;
  refreshToken: string;
  usuario: {
    id: string;
    nombres: string;
    apellidos: string;
    correo: string;
    rol: "ADMIN" | "SECRETARIA" | "VETERINARIO" | "CLIENTE";
    tipoUsuario: "STAFF" | "CLIENTE";
  };
};

export async function loginStaff(payload: { correo: string; contrasena: string }) {
  const { data } = await api.post<SesionAuth>("/api/auth/staff/login", payload);
  guardarSesion(data);
  return data;
}

export async function loginGoogleStaff(payload: { correo: string; nombre: string }) {
  const { data } = await api.post<SesionAuth>("/api/auth/staff/google", payload);
  guardarSesion(data);
  return data;
}

export async function registrarCliente(payload: {
  nombres: string;
  apellidos: string;
  celular: string;
  dni?: string;
  correo: string;
  contrasena: string;
}) {
  const { data } = await api.post<SesionAuth>("/api/auth/clientes/registro", payload);
  guardarSesion(data);
  return data;
}

export async function recuperarContrasena(payload: { correo: string }) {
  const { data } = await api.post<{ mensaje: string }>("/api/auth/recuperar", payload);
  return data;
}

function guardarSesion(sesion: SesionAuth) {
  localStorage.setItem("vetexpert_access_token", sesion.accessToken);
  localStorage.setItem("vetexpert_refresh_token", sesion.refreshToken);
  document.cookie = `vetexpert_access_token=${sesion.accessToken}; path=/; max-age=900; SameSite=Lax`;
}
