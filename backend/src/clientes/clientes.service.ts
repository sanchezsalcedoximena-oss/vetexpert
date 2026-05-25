import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../common/prisma/prisma.service";
import { ActualizarClienteDto } from "./dto/actualizar-cliente.dto";
import { CrearClienteDto } from "./dto/crear-cliente.dto";
import { ListarClientesDto } from "./dto/listar-clientes.dto";

@Injectable()
export class ClientesService {
  constructor(private readonly prisma: PrismaService) { }

  async listar(query: ListarClientesDto) {
    const pagina = query.pagina ?? 1;
    const limite = query.limite ?? 10;
    const busqueda = query.busqueda?.trim();
    const where: Prisma.ClienteWhereInput = {
      eliminadoEn: null,
      ...(query.estado === "inactivos" ? { activo: false } : {}),
      ...((query.estado ?? "activos") === "activos" ? { activo: true } : {}),
      ...(busqueda
        ? {
          OR: [
            { nombres: { contains: busqueda, mode: "insensitive" } },
            { apellidos: { contains: busqueda, mode: "insensitive" } },
            { correo: { contains: busqueda, mode: "insensitive" } },
            { dni: { contains: busqueda, mode: "insensitive" } },
            { celular: { contains: busqueda, mode: "insensitive" } }
          ]
        }
        : {})
    };
    const [total, clientes] = await this.prisma.$transaction([
      this.prisma.cliente.count({ where }),
      this.prisma.cliente.findMany({
        where,
        orderBy: { creadoEn: "desc" },
        skip: (pagina - 1) * limite,
        take: limite,
        select: this.camposCliente()
      })
    ]);

    return {
      datos: clientes,
      meta: {
        pagina,
        limite,
        total,
        totalPaginas: Math.max(1, Math.ceil(total / limite))
      }
    };
  }

  async obtenerPorId(id: string) {
    const cliente = await this.prisma.cliente.findFirst({
      where: {
        id,
        eliminadoEn: null
      },
      select: this.camposCliente()
    });

    if (!cliente) {
      throw new NotFoundException("Cliente no encontrado.");
    }

    return cliente;
  }

  async crear(dto: CrearClienteDto) {
    await this.validarDuplicados(dto);

    return this.prisma.cliente.create({
      data: {
        nombres: dto.nombres.trim(),
        apellidos: dto.apellidos.trim(),
        dni: dto.dni,
        celular: dto.celular,
        correo: dto.correo.toLowerCase().trim(),
        direccion: dto.direccion?.trim(),
        activo: dto.activo ?? true
      },
      select: this.camposCliente()
    });
  }

  async actualizar(id: string, dto: ActualizarClienteDto) {
    await this.obtenerPorId(id);
    await this.validarDuplicados(dto, id);

    const data: Prisma.ClienteUpdateInput = {
      ...(dto.nombres ? { nombres: dto.nombres.trim() } : {}),
      ...(dto.apellidos ? { apellidos: dto.apellidos.trim() } : {}),
      ...(dto.dni ? { dni: dto.dni } : {}),
      ...(dto.celular ? { celular: dto.celular } : {}),
      ...(dto.correo ? { correo: dto.correo.toLowerCase().trim() } : {}),
      ...(dto.direccion !== undefined ? { direccion: dto.direccion?.trim() || null } : {}),
      ...(dto.activo !== undefined ? { activo: dto.activo } : {})
    };

    return this.prisma.cliente.update({
      where: { id },
      data,
      select: this.camposCliente()
    });
  }

  async eliminar(id: string) {
    await this.obtenerPorId(id);

    await this.prisma.cliente.update({
      where: { id },
      data: {
        activo: false,
        eliminadoEn: new Date()
      }
    });

    return {
      mensaje: "Cliente eliminado correctamente."
    };
  }

  private async validarDuplicados(dto: Partial<CrearClienteDto>, idIgnorado?: string) {
    const condiciones: Prisma.ClienteWhereInput[] = [];

    if (dto.correo) {
      condiciones.push({ correo: dto.correo.toLowerCase().trim() });
    }

    if (dto.dni) {
      condiciones.push({ dni: dto.dni });
    }

    if (dto.celular) {
      condiciones.push({ celular: dto.celular });
    }

    if (!condiciones.length) {
      return;
    }

    const existe = await this.prisma.cliente.findFirst({
      where: {
        OR: condiciones,
        ...(idIgnorado ? { NOT: { id: idIgnorado } } : {})
      }
    });

    if (existe) {
      throw new ConflictException("Ya existe un cliente con el correo, DNI o celular ingresado.");
    }
  }

  private camposCliente() {
    return {
      id: true,
      nombres: true,
      apellidos: true,
      dni: true,
      celular: true,
      correo: true,
      direccion: true,
      activo: true,
      creadoEn: true,
      actualizadoEn: true
    } satisfies Prisma.ClienteSelect;
  }
}
