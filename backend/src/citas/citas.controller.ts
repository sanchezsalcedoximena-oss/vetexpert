import { Controller, Get } from "@nestjs/common";
import { CitasService } from "./citas.service";

@Controller("citas")
export class CitasController {
  constructor(private readonly citasService: CitasService) {}

  @Get("estado")
  obtenerEstado() {
    return this.citasService.obtenerEstado();
  }
}
