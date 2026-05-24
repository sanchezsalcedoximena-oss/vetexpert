import { Controller, Get } from "@nestjs/common";
import { ReportesService } from "./reportes.service";

@Controller("reportes")
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get("estado")
  obtenerEstado() {
    return this.reportesService.obtenerEstado();
  }
}
