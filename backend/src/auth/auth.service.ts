import { Injectable } from "@nestjs/common";

@Injectable()
export class AuthService {
  obtenerEstado() {
    return {
      modulo: "auth",
      estado: "pendiente"
    };
  }
}
