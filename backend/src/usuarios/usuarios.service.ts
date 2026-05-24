import { Injectable } from "@nestjs/common";

@Injectable()
export class UsuariosService {
  obtenerEstado() {
    return {
      modulo: "usuarios",
      estado: "pendiente"
    };
  }
}
