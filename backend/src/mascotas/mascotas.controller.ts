import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { Roles } from "../common/decorators/roles.decorator";
import { Rol } from "../common/enums/rol.enum";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { ActualizarMascotaDto } from "./dto/actualizar-mascota.dto";
import { CrearMascotaDto } from "./dto/crear-mascota.dto";
import { ListarMascotasDto } from "./dto/listar-mascotas.dto";
import { MascotasService } from "./mascotas.service";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("mascotas")
export class MascotasController {
  constructor(private readonly mascotasService: MascotasService) {}

  @Get()
  @Roles(Rol.ADMIN, Rol.SECRETARIA, Rol.VETERINARIO)
  listar(@Query() query: ListarMascotasDto) {
    return this.mascotasService.listar(query);
  }

  @Get(":id")
  @Roles(Rol.ADMIN, Rol.SECRETARIA, Rol.VETERINARIO)
  obtenerPorId(@Param("id") id: string) {
    return this.mascotasService.obtenerPorId(id);
  }

  @Post()
  @Roles(Rol.ADMIN, Rol.SECRETARIA)
  crear(@Body() dto: CrearMascotaDto) {
    return this.mascotasService.crear(dto);
  }

  @Patch(":id")
  @Roles(Rol.ADMIN, Rol.SECRETARIA, Rol.VETERINARIO)
  actualizar(@Param("id") id: string, @Body() dto: ActualizarMascotaDto) {
    return this.mascotasService.actualizar(id, dto);
  }

  @Delete(":id")
  @Roles(Rol.ADMIN, Rol.SECRETARIA)
  eliminar(@Param("id") id: string) {
    return this.mascotasService.eliminar(id);
  }
}
