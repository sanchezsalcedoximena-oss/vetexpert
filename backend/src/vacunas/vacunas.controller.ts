import { Controller, Get } from "@nestjs/common";
import { VacunasService } from "./vacunas.service";

@Controller("vacunas")
export class VacunasController {
  constructor(private readonly vacunasService: VacunasService) {}

  @Get("estado")
  obtenerEstado() {
    return this.vacunasService.obtenerEstado();
  }
}
