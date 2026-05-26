import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { JwtPayload } from "../auth/types/jwt-payload.type";
import { Roles } from "../common/decorators/roles.decorator";
import { Rol } from "../common/enums/rol.enum";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { ActualizarStaffDto } from "./dto/actualizar-staff.dto";
import { CrearStaffDto } from "./dto/crear-staff.dto";
import { ListarStaffDto } from "./dto/listar-staff.dto";
import { StaffService } from "./staff.service";

type RequestConUsuario = Request & {
  user: JwtPayload;
};

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Rol.ADMIN)
@Controller("staff")
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  listar(@Query() query: ListarStaffDto) {
    return this.staffService.listar(query);
  }

  @Get(":id")
  obtenerPorId(@Param("id") id: string) {
    return this.staffService.obtenerPorId(id);
  }

  @Post()
  crear(@Body() dto: CrearStaffDto) {
    return this.staffService.crear(dto);
  }

  @Patch(":id")
  actualizar(@Param("id") id: string, @Body() dto: ActualizarStaffDto, @Req() request: RequestConUsuario) {
    return this.staffService.actualizar(id, dto, request.user);
  }

  @Patch(":id/activar")
  activar(@Param("id") id: string) {
    return this.staffService.activar(id);
  }

  @Patch(":id/inactivar")
  inactivar(@Param("id") id: string, @Req() request: RequestConUsuario) {
    return this.staffService.inactivar(id, request.user);
  }
}
