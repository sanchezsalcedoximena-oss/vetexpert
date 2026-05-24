import { Injectable } from "@nestjs/common";

@Injectable()
export class VacunasService {
  obtenerEstado() {
    return {
      modulo: "vacunas",
      estado: "pendiente"
    };
  }
}
