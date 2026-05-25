import { Injectable } from "@nestjs/common";
import { CrearMensajeContactoDto } from "./dto/crear-mensaje-contacto.dto";

@Injectable()
export class ContactoService {
  crearMensaje(dto: CrearMensajeContactoDto) {
    const texto = [
      `Nombres: ${dto.nombres.trim()}`,
      `Celular: ${dto.celular?.trim() || "No indicado"}`,
      `Correo: ${dto.correo.toLowerCase().trim()}`,
      `Asunto: ${dto.asunto.trim()}`,
      `Mensaje: ${dto.mensaje.trim()}`
    ].join("\n");

    return {
      whatsappUrl: `https://api.whatsapp.com/send/?phone=51946223649&text=${encodeURIComponent(texto)}`
    };
  }
}
