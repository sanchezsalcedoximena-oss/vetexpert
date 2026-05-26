export type MensajeContactoPayload = {
  nombres: string;
  correo: string;
  celular?: string;
  asunto: string;
  mensaje: string;
};

const WHATSAPP_CONTACTO_URL = "https://api.whatsapp.com/send/?phone=51987551480&text=";

export function construirUrlWhatsappContacto(payload: MensajeContactoPayload) {
  const texto = [
    `Nombres: ${payload.nombres.trim()}`,
    `Celular: ${payload.celular?.trim() || "No indicado"}`,
    `Correo: ${payload.correo.toLowerCase().trim()}`,
    `Asunto: ${payload.asunto.trim()}`,
    `Mensaje: ${payload.mensaje.trim()}`
  ].join("\n");

  return `${WHATSAPP_CONTACTO_URL}${encodeURIComponent(texto)}`;
}
