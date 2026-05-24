import { Injectable } from "@nestjs/common";

@Injectable()
export class ConsultasService {
  obtenerEstado() {
    return {
      modulo: "consultas",
      estado: "pendiente"
    };
  }
}
