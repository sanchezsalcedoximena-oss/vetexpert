import { Controller, Get } from "@nestjs/common";
import { MascotasService } from "./mascotas.service";

@Controller("mascotas")
export class MascotasController {
  constructor(private readonly mascotasService: MascotasService) {}

  @Get("estado")
  obtenerEstado() {
    return this.mascotasService.obtenerEstado();
  }
}
