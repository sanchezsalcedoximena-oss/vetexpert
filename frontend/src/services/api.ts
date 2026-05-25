import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000",
  timeout: 15_000
});

const refreshApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000",
  timeout: 15_000
});

api.interceptors.request.use((config) => {
  const token = leerLocalStorage("vetexpert_access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401 || !error.config || error.config.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    const refreshToken = leerLocalStorage("vetexpert_refresh_token");

    if (!refreshToken) {
      limpiarSesionLocal();
      return Promise.reject(error);
    }

    try {
      const { data: sesion } = await refreshApi.post<{
        accessToken: string;
        refreshToken: string;
        usuario: {
          rol: string;
        };
      }>("/api/auth/refresh", { refreshToken });
      guardarSesionLocal(sesion);
      error.config.headers = error.config.headers ?? {};
      error.config.headers.Authorization = `Bearer ${sesion.accessToken}`;
      return api.request(error.config);
    } catch (refreshError) {
      limpiarSesionLocal();
      return Promise.reject(refreshError);
    }
  }
);

function leerLocalStorage(clave: string) {
  if (typeof window === "undefined") {
    return undefined;
  }

  return localStorage.getItem(clave) ?? undefined;
}

function guardarSesionLocal(sesion: {
  accessToken: string;
  refreshToken: string;
  usuario: {
    rol: string;
  };
}) {
  localStorage.setItem("vetexpert_access_token", sesion.accessToken);
  localStorage.setItem("vetexpert_refresh_token", sesion.refreshToken);
  localStorage.setItem("vetexpert_usuario", JSON.stringify(sesion.usuario));
  document.cookie = `vetexpert_access_token=${sesion.accessToken}; path=/; max-age=900; SameSite=Lax`;
  document.cookie = `vetexpert_rol=${sesion.usuario.rol}; path=/; max-age=604800; SameSite=Lax`;
  document.cookie = "vetexpert_tipo_usuario=; path=/; max-age=0; SameSite=Lax";
}

function limpiarSesionLocal() {
  localStorage.removeItem("vetexpert_access_token");
  localStorage.removeItem("vetexpert_refresh_token");
  localStorage.removeItem("vetexpert_usuario");
  document.cookie = "vetexpert_access_token=; path=/; max-age=0; SameSite=Lax";
  document.cookie = "vetexpert_rol=; path=/; max-age=0; SameSite=Lax";
  document.cookie = "vetexpert_tipo_usuario=; path=/; max-age=0; SameSite=Lax";
}
