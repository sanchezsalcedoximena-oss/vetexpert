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

export async function loginCliente(payload: { correo: string; contrasena: string }) {
  const { data } = await api.post<SesionAuth>("/api/auth/clientes/login", payload);
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

export async function obtenerPerfil() {
  const { data } = await api.get<{
    id: string;
    correo: string;
    rol: SesionAuth["usuario"]["rol"];
    tipoUsuario: SesionAuth["usuario"]["tipoUsuario"];
  }>("/api/auth/perfil");
  return data;
}

export async function refrescarSesion(refreshToken: string) {
  const { data } = await api.post<SesionAuth>("/api/auth/refresh", { refreshToken });
  guardarSesion(data);
  return data;
}

export function obtenerAccessToken() {
  if (typeof window === "undefined") {
    return undefined;
  }

  return localStorage.getItem("vetexpert_access_token") ?? undefined;
}

export function obtenerRefreshToken() {
  if (typeof window === "undefined") {
    return undefined;
  }

  return localStorage.getItem("vetexpert_refresh_token") ?? undefined;
}

export function obtenerUsuarioSesion() {
  if (typeof window === "undefined") {
    return undefined;
  }

  const usuario = localStorage.getItem("vetexpert_usuario");
  return usuario ? (JSON.parse(usuario) as SesionAuth["usuario"]) : undefined;
}

export function guardarSesion(sesion: SesionAuth) {
  localStorage.setItem("vetexpert_access_token", sesion.accessToken);
  localStorage.setItem("vetexpert_refresh_token", sesion.refreshToken);
  localStorage.setItem("vetexpert_usuario", JSON.stringify(sesion.usuario));
  document.cookie = `vetexpert_access_token=${sesion.accessToken}; path=/; max-age=900; SameSite=Lax`;
  document.cookie = `vetexpert_rol=${sesion.usuario.rol}; path=/; max-age=604800; SameSite=Lax`;
  document.cookie = `vetexpert_tipo_usuario=${sesion.usuario.tipoUsuario}; path=/; max-age=604800; SameSite=Lax`;
}

export function cerrarSesionLocal() {
  localStorage.removeItem("vetexpert_access_token");
  localStorage.removeItem("vetexpert_refresh_token");
  localStorage.removeItem("vetexpert_usuario");
  document.cookie = "vetexpert_access_token=; path=/; max-age=0; SameSite=Lax";
  document.cookie = "vetexpert_rol=; path=/; max-age=0; SameSite=Lax";
  document.cookie = "vetexpert_tipo_usuario=; path=/; max-age=0; SameSite=Lax";
}
