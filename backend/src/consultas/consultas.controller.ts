import { Controller, Get } from "@nestjs/common";
import { ConsultasService } from "./consultas.service";

@Controller("consultas")
export class ConsultasController {
  constructor(private readonly consultasService: ConsultasService) {}

  @Get("estado")
  obtenerEstado() {
    return this.consultasService.obtenerEstado();
  }
}
