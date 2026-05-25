import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { JwtPayload } from "../auth/types/jwt-payload.type";
import { Rol } from "../common/enums/rol.enum";
import { PrismaService } from "../common/prisma/prisma.service";
import { ActualizarCitaDto } from "./dto/actualizar-cita.dto";
import { CrearCitaDto } from "./dto/crear-cita.dto";
import { ListarCitasDto } from "./dto/listar-citas.dto";

@Injectable()
export class CitasService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(query: ListarCitasDto, usuario: JwtPayload) {
    const pagina = query.pagina ?? 1;
    const limite = query.limite ?? 10;
    const busqueda = query.busqueda?.trim();
    const veterinarioId = usuario.rol === Rol.VETERINARIO ? usuario.sub : query.veterinarioId;

    const where: Prisma.CitaWhereInput = {
      eliminadoEn: null,
      ...(query.estado ? { estado: query.estado } : {}),
      ...(veterinarioId ? { veterinarioId } : {}),
      ...(query.clienteId ? { clienteId: query.clienteId } : {}),
      ...(query.mascotaId ? { mascotaId: query.mascotaId } : {}),
      ...(query.fechaInicio || query.fechaFin
        ? {
          fecha: {
            ...(query.fechaInicio ? { gte: new Date(query.fechaInicio) } : {}),
            ...(query.fechaFin ? { lte: new Date(query.fechaFin) } : {})
          }
        }
        : {}),
      ...(busqueda
        ? {
          OR: [
            { motivo: { contains: busqueda, mode: "insensitive" } },
            { observaciones: { contains: busqueda, mode: "insensitive" } },
            {
              mascota: {
                OR: [
                  { nombre: { contains: busqueda, mode: "insensitive" } },
                  { raza: { contains: busqueda, mode: "insensitive" } }
                ]
              }
            },
            {
              cliente: {
                OR: [
                  { nombres: { contains: busqueda, mode: "insensitive" } },
                  { apellidos: { contains: busqueda, mode: "insensitive" } },
                  { dni: { contains: busqueda, mode: "insensitive" } },
                  { celular: { contains: busqueda, mode: "insensitive" } }
                ]
              }
            },
            {
              veterinario: {
                OR: [
                  { nombres: { contains: busqueda, mode: "insensitive" } },
                  { apellidos: { contains: busqueda, mode: "insensitive" } }
                ]
              }
            }
          ]
        }
        : {})
    };

    const [total, citas] = await this.prisma.$transaction([
      this.prisma.cita.count({ where }),
      this.prisma.cita.findMany({
        where,
        orderBy: { fecha: "asc" },
        skip: (pagina - 1) * limite,
        take: limite,
        select: this.camposCita()
      })
    ]);

    return {
      datos: citas,
      meta: {
        pagina,
        limite,
        total,
        totalPaginas: Math.max(1, Math.ceil(total / limite))
      }
    };
  }

  async obtenerPorId(id: string, usuario?: JwtPayload) {
    const cita = await this.prisma.cita.findFirst({
      where: {
        id,
        eliminadoEn: null,
        ...(usuario?.rol === Rol.VETERINARIO ? { veterinarioId: usuario.sub } : {})
      },
      select: this.camposCita()
    });

    if (!cita) {
      throw new NotFoundException("Cita no encontrada.");
    }

    return cita;
  }

  async crear(dto: CrearCitaDto) {
    const fecha = this.validarFechaNoPasada(dto.fecha);
    const mascota = await this.validarMascota(dto.mascotaId);
    await this.validarVeterinario(dto.veterinarioId);
    await this.validarDisponibilidadVeterinario(dto.veterinarioId, fecha);

    return this.prisma.cita.create({
      data: {
        fecha,
        motivo: dto.motivo.trim(),
        observaciones: dto.observaciones?.trim() || null,
        estado: dto.estado ?? "PENDIENTE",
        mascotaId: dto.mascotaId,
        veterinarioId: dto.veterinarioId,
        clienteId: mascota.clienteId
      } satisfies Prisma.CitaUncheckedCreateInput,
      select: this.camposCita()
    });
  }

  async actualizar(id: string, dto: ActualizarCitaDto, usuario: JwtPayload) {
    this.validarActualizacionVeterinario(dto, usuario);
    const citaActual = await this.obtenerPorId(id, usuario);
    const fecha = dto.fecha ? this.validarFechaNoPasada(dto.fecha) : citaActual.fecha;
    const veterinarioId = dto.veterinarioId ?? citaActual.veterinarioId;
    const mascotaId = dto.mascotaId ?? citaActual.mascotaId;
    let clienteId = citaActual.clienteId;

    if (dto.mascotaId) {
      const mascota = await this.validarMascota(dto.mascotaId);
      clienteId = mascota.clienteId;
    }

    if (dto.veterinarioId) {
      await this.validarVeterinario(dto.veterinarioId);
    }

    if (dto.fecha || dto.veterinarioId) {
      await this.validarDisponibilidadVeterinario(veterinarioId, fecha, id);
    }

    const data: Prisma.CitaUncheckedUpdateInput = {
      ...(dto.fecha ? { fecha } : {}),
      ...(dto.motivo ? { motivo: dto.motivo.trim() } : {}),
      ...(dto.observaciones !== undefined ? { observaciones: dto.observaciones?.trim() || null } : {}),
      ...(dto.estado ? { estado: dto.estado } : {}),
      ...(dto.mascotaId ? { mascotaId, clienteId } : {}),
      ...(dto.veterinarioId ? { veterinarioId } : {})
    };

    return this.prisma.cita.update({
      where: { id },
      data,
      select: this.camposCita()
    });
  }

  async eliminar(id: string) {
    await this.obtenerPorId(id);

    await this.prisma.cita.update({
      where: { id },
      data: {
        eliminadoEn: new Date()
      }
    });

    return {
      mensaje: "Cita eliminada correctamente."
    };
  }

  private validarFechaNoPasada(fechaValor: string) {
    const fecha = new Date(fechaValor);

    if (fecha.getTime() < Date.now()) {
      throw new BadRequestException("La fecha de la cita no puede ser pasada.");
    }

    return fecha;
  }

  private async validarMascota(mascotaId: string) {
    const mascota = await this.prisma.mascota.findFirst({
      where: {
        id: mascotaId,
        activo: true,
        eliminadoEn: null
      },
      select: {
        id: true,
        clienteId: true
      }
    });

    if (!mascota) {
      throw new BadRequestException("La mascota seleccionada no existe o no esta activa.");
    }

    return mascota;
  }

  private async validarVeterinario(veterinarioId: string) {
    const veterinario = await this.prisma.usuario.findFirst({
      where: {
        id: veterinarioId,
        rol: "VETERINARIO",
        tipoUsuario: "STAFF",
        activo: true,
        eliminadoEn: null
      }
    });

    if (!veterinario) {
      throw new BadRequestException("El veterinario seleccionado no existe o no esta activo.");
    }
  }

  private async validarDisponibilidadVeterinario(veterinarioId: string, fecha: Date, idIgnorado?: string) {
    const citaExistente = await this.prisma.cita.findFirst({
      where: {
        veterinarioId,
        fecha,
        eliminadoEn: null,
        ...(idIgnorado ? { NOT: { id: idIgnorado } } : {})
      }
    });

    if (citaExistente) {
      throw new ConflictException("El veterinario ya tiene una cita programada en esa fecha y hora.");
    }
  }

  private validarActualizacionVeterinario(dto: ActualizarCitaDto, usuario: JwtPayload) {
    if (usuario.rol !== Rol.VETERINARIO) {
      return;
    }

    if (dto.fecha || dto.motivo || dto.mascotaId || dto.veterinarioId) {
      throw new BadRequestException("El veterinario solo puede actualizar observaciones y estado de la cita.");
    }

    if (dto.estado && !["COMPLETADA", "CANCELADA"].includes(dto.estado)) {
      throw new BadRequestException("El veterinario solo puede marcar la cita como completada o cancelada.");
    }
  }

  private camposCita() {
    return {
      id: true,
      fecha: true,
      motivo: true,
      observaciones: true,
      estado: true,
      mascotaId: true,
      veterinarioId: true,
      clienteId: true,
      mascota: {
        select: {
          id: true,
          nombre: true,
          especie: true,
          raza: true
        }
      },
      veterinario: {
        select: {
          id: true,
          nombres: true,
          apellidos: true,
          correo: true
        }
      },
      cliente: {
        select: {
          id: true,
          nombres: true,
          apellidos: true,
          dni: true,
          celular: true
        }
      },
      creadoEn: true,
      actualizadoEn: true
    } satisfies Prisma.CitaSelect;
  }
}
