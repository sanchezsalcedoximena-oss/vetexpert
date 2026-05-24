import { Injectable } from "@nestjs/common";

@Injectable()
export class ReportesService {
  obtenerEstado() {
    return {
      modulo: "reportes",
      estado: "pendiente"
    };
  }
}
