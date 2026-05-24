import { Injectable } from "@nestjs/common";

@Injectable()
export class ClientesService {
  obtenerEstado() {
    return {
      modulo: "clientes",
      estado: "pendiente"
    };
  }
}
