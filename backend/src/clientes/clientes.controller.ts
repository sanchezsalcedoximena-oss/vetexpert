import { Controller, Get } from "@nestjs/common";
import { ClientesService } from "./clientes.service";

@Controller("clientes")
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Get("estado")
  obtenerEstado() {
    return this.clientesService.obtenerEstado();
  }
}
