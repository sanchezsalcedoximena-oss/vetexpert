import { Injectable } from "@nestjs/common";

@Injectable()
export class CitasService {
  obtenerEstado() {
    return {
      modulo: "citas",
      estado: "pendiente"
    };
  }
}
