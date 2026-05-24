import { api } from "./api";

export type MensajeContactoPayload = {
  nombres: string;
  correo: string;
  celular?: string;
  asunto: string;
  mensaje: string;
};

export async function enviarMensajeContacto(payload: MensajeContactoPayload) {
  const { data } = await api.post<{ id: string; mensaje: string }>("/api/contacto/mensajes", payload);
  return data;
}
