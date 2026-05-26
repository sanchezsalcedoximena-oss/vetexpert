import { Controller, Get, UseGuards } from "@nestjs/common";
import { Roles } from "../common/decorators/roles.decorator";
import { Rol } from "../common/enums/rol.enum";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { UsuariosService } from "./usuarios.service";

@Controller("usuarios")
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get("estado")
  obtenerEstado() {
    return this.usuariosService.obtenerEstado();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.ADMIN, Rol.SECRETARIA, Rol.VETERINARIO)
  @Get("veterinarios")
  listarVeterinarios() {
    return this.usuariosService.listarVeterinarios();
  }
}
