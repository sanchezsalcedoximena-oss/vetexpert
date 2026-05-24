import { Injectable } from "@nestjs/common";

@Injectable()
export class ConfiguracionService {
  obtenerEstado() {
    return {
      modulo: "configuracion",
      estado: "pendiente"
    };
  }
}
