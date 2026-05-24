import { Controller, Get } from "@nestjs/common";
import { ConfiguracionService } from "./configuracion.service";

@Controller("configuracion")
export class ConfiguracionController {
  constructor(private readonly configuracionService: ConfiguracionService) {}

  @Get("estado")
  obtenerEstado() {
    return this.configuracionService.obtenerEstado();
  }
}
