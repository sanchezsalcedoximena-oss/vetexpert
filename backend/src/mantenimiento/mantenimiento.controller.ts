import { Controller, Get } from "@nestjs/common";
import { MantenimientoService } from "./mantenimiento.service";

@Controller("mantenimiento")
export class MantenimientoController {
  constructor(private readonly mantenimientoService: MantenimientoService) {}

  @Get("estado")
  obtenerEstado() {
    return this.mantenimientoService.obtenerEstado();
  }
}
