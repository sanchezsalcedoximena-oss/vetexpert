import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { JwtPayload } from "../auth/types/jwt-payload.type";
import { Roles } from "../common/decorators/roles.decorator";
import { Rol } from "../common/enums/rol.enum";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { CitasService } from "./citas.service";
import { ActualizarCitaDto } from "./dto/actualizar-cita.dto";
import { CrearCitaDto } from "./dto/crear-cita.dto";
import { ListarCitasDto } from "./dto/listar-citas.dto";

type RequestConUsuario = Request & {
  user: JwtPayload;
};

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("citas")
export class CitasController {
  constructor(private readonly citasService: CitasService) {}

  @Get()
  @Roles(Rol.ADMIN, Rol.SECRETARIA, Rol.VETERINARIO)
  listar(@Query() query: ListarCitasDto, @Req() request: RequestConUsuario) {
    return this.citasService.listar(query, request.user);
  }

  @Get(":id")
  @Roles(Rol.ADMIN, Rol.SECRETARIA, Rol.VETERINARIO)
  obtenerPorId(@Param("id") id: string, @Req() request: RequestConUsuario) {
    return this.citasService.obtenerPorId(id, request.user);
  }

  @Post()
  @Roles(Rol.ADMIN, Rol.SECRETARIA)
  crear(@Body() dto: CrearCitaDto) {
    return this.citasService.crear(dto);
  }

  @Patch(":id")
  @Roles(Rol.ADMIN, Rol.SECRETARIA, Rol.VETERINARIO)
  actualizar(@Param("id") id: string, @Body() dto: ActualizarCitaDto, @Req() request: RequestConUsuario) {
    return this.citasService.actualizar(id, dto, request.user);
  }

  @Delete(":id")
  @Roles(Rol.ADMIN, Rol.SECRETARIA)
  eliminar(@Param("id") id: string) {
    return this.citasService.eliminar(id);
  }
}
