import { Injectable } from "@nestjs/common";

@Injectable()
export class MascotasService {
  obtenerEstado() {
    return {
      modulo: "mascotas",
      estado: "pendiente"
    };
  }
}
