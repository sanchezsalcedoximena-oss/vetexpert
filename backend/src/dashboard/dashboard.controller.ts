import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { JwtPayload } from "../auth/types/jwt-payload.type";
import { Roles } from "../common/decorators/roles.decorator";
import { Rol } from "../common/enums/rol.enum";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { DashboardService } from "./dashboard.service";
import { ResumenDashboardDto } from "./dto/resumen-dashboard.dto";

type RequestConUsuario = Request & {
  user: JwtPayload;
};

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Rol.ADMIN, Rol.SECRETARIA, Rol.VETERINARIO)
@Controller("dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("resumen")
  obtenerResumen(@Query() query: ResumenDashboardDto, @Req() request: RequestConUsuario) {
    return this.dashboardService.obtenerResumen(query, request.user);
  }
}
