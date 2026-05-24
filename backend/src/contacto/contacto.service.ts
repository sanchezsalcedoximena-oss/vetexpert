import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";
import { CrearMensajeContactoDto } from "./dto/crear-mensaje-contacto.dto";

@Injectable()
export class ContactoService {
  constructor(private readonly prisma: PrismaService) {}

  async crearMensaje(dto: CrearMensajeContactoDto) {
    const mensaje = await this.prisma.mensajeContacto.create({
      data: {
        nombres: dto.nombres.trim(),
        correo: dto.correo.toLowerCase().trim(),
        celular: dto.celular?.trim(),
        asunto: dto.asunto.trim(),
        mensaje: dto.mensaje.trim()
      }
    });

    return {
      id: mensaje.id,
      mensaje: "Mensaje recibido. Nos comunicaremos contigo pronto."
    };
  }
}
