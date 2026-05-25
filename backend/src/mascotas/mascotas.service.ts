import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../common/prisma/prisma.service";
import { CrearMascotaDto } from "./dto/crear-mascota.dto";
import { ActualizarMascotaDto } from "./dto/actualizar-mascota.dto";
import { ListarMascotasDto } from "./dto/listar-mascotas.dto";

@Injectable()
export class MascotasService {
  constructor(private readonly prisma: PrismaService) { }

  async listar(query: ListarMascotasDto) {
    const pagina = query.pagina ?? 1;
    const limite = query.limite ?? 10;
    const busqueda = query.busqueda?.trim();

    const where: Prisma.MascotaWhereInput = {
      eliminadoEn: null,
      ...(query.estado === "inactivos" ? { activo: false } : {}),
      ...((query.estado ?? "activos") === "activos" ? { activo: true } : {}),
      ...(query.especie ? { especie: query.especie } : {}),
      ...(query.clienteId ? { clienteId: query.clienteId } : {}),
      ...(busqueda
        ? {
          OR: [
            { nombre: { contains: busqueda, mode: "insensitive" } },
            { raza: { contains: busqueda, mode: "insensitive" } },
            {
              cliente: {
                OR: [
                  { nombres: { contains: busqueda, mode: "insensitive" } },
                  { apellidos: { contains: busqueda, mode: "insensitive" } },
                  { dni: { contains: busqueda, mode: "insensitive" } }
                ]
              }
            }
          ]
        }
        : {})
    };

    const [total, mascotas] = await this.prisma.$transaction([
      this.prisma.mascota.count({ where }),
      this.prisma.mascota.findMany({
        where,
        orderBy: { creadoEn: "desc" },
        skip: (pagina - 1) * limite,
        take: limite,
        select: this.camposMascota()
      })
    ]);

    return {
      datos: mascotas,
      meta: {
        pagina,
        limite,
        total,
        totalPaginas: Math.max(1, Math.ceil(total / limite))
      }
    };
  }

  async obtenerPorId(id: string) {
    const mascota = await this.prisma.mascota.findFirst({
      where: {
        id,
        eliminadoEn: null
      },
      select: this.camposMascota()
    });

    if (!mascota) {
      throw new NotFoundException("Mascota no encontrada.");
    }

    return mascota;
  }

  async crear(dto: CrearMascotaDto) {
    await this.validarCliente(dto.clienteId);

    if (dto.fechaNacimiento) {
      const fecha = new Date(dto.fechaNacimiento);
      if (fecha > new Date()) {
        throw new BadRequestException("La fecha de nacimiento no puede ser futura.");
      }
    }

    return this.prisma.mascota.create({
      data: {
        nombre: dto.nombre.trim(),
        especie: dto.especie,
        raza: dto.raza?.trim() || null,
        sexo: dto.sexo,
        fechaNacimiento: dto.fechaNacimiento ? new Date(dto.fechaNacimiento) : null,
        peso: dto.peso !== undefined ? dto.peso : null,
        color: dto.color?.trim() || null,
        esterilizado: dto.esterilizado ?? false,
        alergias: dto.alergias?.trim() || null,
        observaciones: dto.observaciones?.trim() || null,
        clienteId: dto.clienteId,
        activo: dto.activo ?? true
      },
      select: this.camposMascota()
    });
  }

  async actualizar(id: string, dto: ActualizarMascotaDto) {
    await this.obtenerPorId(id);

    if (dto.clienteId) {
      await this.validarCliente(dto.clienteId);
    }

    if (dto.fechaNacimiento) {
      const fecha = new Date(dto.fechaNacimiento);
      if (fecha > new Date()) {
        throw new BadRequestException("La fecha de nacimiento no puede ser futura.");
      }
    }

    const data: Prisma.MascotaUpdateInput = {
      ...(dto.nombre ? { nombre: dto.nombre.trim() } : {}),
      ...(dto.especie ? { especie: dto.especie } : {}),
      ...(dto.raza !== undefined ? { raza: dto.raza?.trim() || null } : {}),
      ...(dto.sexo ? { sexo: dto.sexo } : {}),
      ...(dto.fechaNacimiento !== undefined ? { fechaNacimiento: dto.fechaNacimiento ? new Date(dto.fechaNacimiento) : null } : {}),
      ...(dto.peso !== undefined ? { peso: dto.peso } : {}),
      ...(dto.color !== undefined ? { color: dto.color?.trim() || null } : {}),
      ...(dto.esterilizado !== undefined ? { esterilizado: dto.esterilizado } : {}),
      ...(dto.alergias !== undefined ? { alergias: dto.alergias?.trim() || null } : {}),
      ...(dto.observaciones !== undefined ? { observaciones: dto.observaciones?.trim() || null } : {}),
      ...(dto.clienteId ? { clienteId: dto.clienteId } : {}),
      ...(dto.activo !== undefined ? { activo: dto.activo } : {})
    };

    return this.prisma.mascota.update({
      where: { id },
      data,
      select: this.camposMascota()
    });
  }

  async eliminar(id: string) {
    await this.obtenerPorId(id);

    await this.prisma.mascota.update({
      where: { id },
      data: {
        activo: false,
        eliminadoEn: new Date()
      }
    });

    return {
      mensaje: "Mascota eliminada correctamente."
    };
  }

  async validarCliente(clienteId: string) {
    const cliente = await this.prisma.cliente.findFirst({
      where: {
        id: clienteId,
        activo: true,
        eliminadoEn: null
      }
    });

    if (!cliente) {
      throw new BadRequestException("El cliente seleccionado no existe o no esta activo.");
    }
  }

  private camposMascota() {
    return {
      id: true,
      nombre: true,
      especie: true,
      raza: true,
      sexo: true,
      fechaNacimiento: true,
      peso: true,
      color: true,
      esterilizado: true,
      alergias: true,
      observaciones: true,
      fotoUrl: true,
      activo: true,
      clienteId: true,
      cliente: {
        select: {
          id: true,
          nombres: true,
          apellidos: true,
          dni: true
        }
      },
      creadoEn: true,
      actualizadoEn: true
    } satisfies Prisma.MascotaSelect;
  }
}
