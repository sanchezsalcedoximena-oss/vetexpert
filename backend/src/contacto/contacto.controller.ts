import { Body, Controller, Post } from "@nestjs/common";
import { CrearMensajeContactoDto } from "./dto/crear-mensaje-contacto.dto";
import { ContactoService } from "./contacto.service";

@Controller("contacto")
export class ContactoController {
  constructor(private readonly contactoService: ContactoService) {}

  @Post("mensajes")
  crearMensaje(@Body() dto: CrearMensajeContactoDto) {
    return this.contactoService.crearMensaje(dto);
  }
}
