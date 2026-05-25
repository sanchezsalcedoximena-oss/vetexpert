import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { JwtPayload } from "../auth/types/jwt-payload.type";
import { Roles } from "../common/decorators/roles.decorator";
import { Rol } from "../common/enums/rol.enum";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { ActualizarHistoriaClinicaDto } from "./dto/actualizar-historia-clinica.dto";
import { CrearHistoriaClinicaDto } from "./dto/crear-historia-clinica.dto";
import { ListarHistoriaClinicaDto } from "./dto/listar-historia-clinica.dto";
import { HistoriasClinicasService } from "./historias-clinicas.service";

type RequestConUsuario = Request & {
  user: JwtPayload;
};

const uuidPipe = new ParseUUIDPipe({ version: "4" });

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("historias-clinicas")
export class HistoriasClinicasController {
  constructor(private readonly historiasClinicasService: HistoriasClinicasService) {}

  @Get()
  @Roles(Rol.ADMIN, Rol.SECRETARIA, Rol.VETERINARIO)
  listar(@Query() query: ListarHistoriaClinicaDto, @Req() request: RequestConUsuario) {
    return this.historiasClinicasService.listar(query, request.user);
  }

  @Get("mascota/:mascotaId")
  @Roles(Rol.ADMIN, Rol.SECRETARIA, Rol.VETERINARIO)
  async listarPorMascota(@Param("mascotaId", uuidPipe) mascotaId: string, @Req() request: RequestConUsuario) {
    const historias = await this.historiasClinicasService.listarPorMascota(mascotaId, request.user);

    return {
      datos: historias
    };
  }

  @Get(":id")
  @Roles(Rol.ADMIN, Rol.SECRETARIA, Rol.VETERINARIO)
  obtenerPorId(@Param("id", uuidPipe) id: string, @Req() request: RequestConUsuario) {
    return this.historiasClinicasService.obtenerPorId(id, request.user);
  }

  @Post("cita/:citaId")
  @Roles(Rol.ADMIN, Rol.VETERINARIO)
  crearDesdeCita(@Param("citaId", uuidPipe) citaId: string, @Body() dto: CrearHistoriaClinicaDto, @Req() request: RequestConUsuario) {
    return this.historiasClinicasService.crearDesdeCita(citaId, dto, request.user);
  }

  @Patch(":id")
  @Roles(Rol.ADMIN, Rol.VETERINARIO)
  actualizar(@Param("id", uuidPipe) id: string, @Body() dto: ActualizarHistoriaClinicaDto, @Req() request: RequestConUsuario) {
    return this.historiasClinicasService.actualizar(id, dto, request.user);
  }

  @Patch(":id/cerrar")
  @Roles(Rol.ADMIN, Rol.VETERINARIO)
  cerrar(@Param("id", uuidPipe) id: string, @Req() request: RequestConUsuario) {
    return this.historiasClinicasService.cerrar(id, request.user);
  }

  @Patch(":id/reabrir")
  @Roles(Rol.ADMIN)
  reabrir(@Param("id", uuidPipe) id: string, @Req() request: RequestConUsuario) {
    return this.historiasClinicasService.reabrir(id, request.user);
  }

  @Delete(":id")
  @Roles(Rol.ADMIN)
  eliminar(@Param("id", uuidPipe) id: string, @Req() request: RequestConUsuario) {
    return this.historiasClinicasService.eliminar(id, request.user);
  }
}
