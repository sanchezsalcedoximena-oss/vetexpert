import { Injectable } from "@nestjs/common";

@Injectable()
export class MantenimientoService {
  obtenerEstado() {
    return {
      modulo: "mantenimiento",
      estado: "pendiente"
    };
  }
}
