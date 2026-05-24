import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { Roles } from "../common/decorators/roles.decorator";
import { Rol } from "../common/enums/rol.enum";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { ActualizarClienteDto } from "./dto/actualizar-cliente.dto";
import { CrearClienteDto } from "./dto/crear-cliente.dto";
import { ListarClientesDto } from "./dto/listar-clientes.dto";
import { ClientesService } from "./clientes.service";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Rol.ADMIN, Rol.SECRETARIA)
@Controller("clientes")
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Get()
  listar(@Query() query: ListarClientesDto) {
    return this.clientesService.listar(query);
  }

  @Get(":id")
  obtenerPorId(@Param("id") id: string) {
    return this.clientesService.obtenerPorId(id);
  }

  @Post()
  crear(@Body() dto: CrearClienteDto) {
    return this.clientesService.crear(dto);
  }

  @Patch(":id")
  actualizar(@Param("id") id: string, @Body() dto: ActualizarClienteDto) {
    return this.clientesService.actualizar(id, dto);
  }

  @Delete(":id")
  eliminar(@Param("id") id: string) {
    return this.clientesService.eliminar(id);
  }
}
