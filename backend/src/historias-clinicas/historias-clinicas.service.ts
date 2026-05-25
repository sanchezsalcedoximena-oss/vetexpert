import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { JwtPayload } from "../auth/types/jwt-payload.type";
import { Rol } from "../common/enums/rol.enum";
import { PrismaService } from "../common/prisma/prisma.service";
import { ActualizarHistoriaClinicaDto } from "./dto/actualizar-historia-clinica.dto";
import { CrearHistoriaClinicaDto } from "./dto/crear-historia-clinica.dto";
import { ListarHistoriaClinicaDto } from "./dto/listar-historia-clinica.dto";

@Injectable()
export class HistoriasClinicasService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(query: ListarHistoriaClinicaDto, usuario: JwtPayload) {
    const pagina = query.pagina ?? 1;
    const limite = query.limite ?? 10;
    const busqueda = query.busqueda?.trim();
    const veterinarioId = usuario.rol === Rol.VETERINARIO ? usuario.sub : query.veterinarioId;
    const where: Prisma.HistoriaClinicaWhereInput = {
      eliminadoEn: null,
      ...(query.mascotaId ? { mascotaId: query.mascotaId } : {}),
      ...(veterinarioId ? { veterinarioId } : {}),
      ...(query.citaId ? { citaId: query.citaId } : {}),
      ...(query.cerrada !== undefined ? { cerrada: query.cerrada } : {}),
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
            { diagnostico: { contains: busqueda, mode: "insensitive" } },
            { tratamiento: { contains: busqueda, mode: "insensitive" } },
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
              veterinario: {
                OR: [
                  { nombres: { contains: busqueda, mode: "insensitive" } },
                  { apellidos: { contains: busqueda, mode: "insensitive" } }
                ]
              }
            },
            {
              cita: {
                OR: [
                  { motivo: { contains: busqueda, mode: "insensitive" } },
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
            }
          ]
        }
        : {})
    };

    const [total, historias] = await this.prisma.$transaction([
      this.prisma.historiaClinica.count({ where }),
      this.prisma.historiaClinica.findMany({
        where,
        orderBy: { fecha: "desc" },
        skip: (pagina - 1) * limite,
        take: limite,
        select: this.camposHistoriaClinica()
      })
    ]);

    return {
      datos: historias,
      meta: {
        pagina,
        limite,
        total,
        totalPaginas: Math.max(1, Math.ceil(total / limite))
      }
    };
  }

  async listarPorMascota(mascotaId: string, usuario: JwtPayload) {
    await this.validarMascota(mascotaId);

    return this.prisma.historiaClinica.findMany({
      where: {
        mascotaId,
        eliminadoEn: null,
        ...(usuario.rol === Rol.VETERINARIO ? { veterinarioId: usuario.sub } : {})
      },
      orderBy: { fecha: "desc" },
      select: this.camposHistoriaClinica()
    });
  }

  async obtenerPorId(id: string, usuario: JwtPayload) {
    const historia = await this.prisma.historiaClinica.findFirst({
      where: {
        id,
        eliminadoEn: null,
        ...(usuario.rol === Rol.VETERINARIO ? { veterinarioId: usuario.sub } : {})
      },
      select: this.camposHistoriaClinica()
    });

    if (!historia) {
      throw new NotFoundException("Historia clinica no encontrada.");
    }

    return historia;
  }

  async crearDesdeCita(citaId: string, dto: CrearHistoriaClinicaDto, usuario: JwtPayload) {
    this.validarPermisoEscritura(usuario);
    const cita = await this.obtenerCitaCompletada(citaId);
    this.validarPropietarioVeterinario(cita.veterinarioId, usuario);
    await this.validarMascota(cita.mascotaId);
    await this.validarVeterinario(cita.veterinarioId);
    await this.validarHistoriaUnicaPorCita(citaId);

    return this.prisma.historiaClinica.create({
      data: {
        diagnostico: dto.diagnostico.trim(),
        tratamiento: dto.tratamiento.trim(),
        observaciones: dto.observaciones?.trim() || null,
        cerrada: dto.cerrada ?? false,
        citaId,
        mascotaId: cita.mascotaId,
        veterinarioId: cita.veterinarioId
      } satisfies Prisma.HistoriaClinicaUncheckedCreateInput,
      select: this.camposHistoriaClinica()
    });
  }

  async actualizar(id: string, dto: ActualizarHistoriaClinicaDto, usuario: JwtPayload) {
    this.validarPermisoEscritura(usuario);
    const historia = await this.obtenerPorId(id, usuario);
    this.validarPropietarioVeterinario(historia.veterinarioId, usuario);
    this.validarHistoriaAbierta(historia.cerrada);

    const data: Prisma.HistoriaClinicaUpdateInput = {
      ...(dto.diagnostico ? { diagnostico: dto.diagnostico.trim() } : {}),
      ...(dto.tratamiento ? { tratamiento: dto.tratamiento.trim() } : {}),
      ...(dto.observaciones !== undefined ? { observaciones: dto.observaciones?.trim() || null } : {})
    };

    return this.prisma.historiaClinica.update({
      where: { id },
      data,
      select: this.camposHistoriaClinica()
    });
  }

  async cerrar(id: string, usuario: JwtPayload) {
    this.validarPermisoEscritura(usuario);
    const historia = await this.obtenerPorId(id, usuario);
    this.validarPropietarioVeterinario(historia.veterinarioId, usuario);

    if (historia.cerrada) {
      return historia;
    }

    return this.prisma.historiaClinica.update({
      where: { id },
      data: {
        cerrada: true
      },
      select: this.camposHistoriaClinica()
    });
  }

  async reabrir(id: string, usuario: JwtPayload) {
    if (usuario.rol !== Rol.ADMIN) {
      throw new ForbiddenException("Solo un administrador puede reabrir una historia clinica.");
    }

    await this.obtenerPorId(id, usuario);

    return this.prisma.historiaClinica.update({
      where: { id },
      data: {
        cerrada: false
      },
      select: this.camposHistoriaClinica()
    });
  }

  async eliminar(id: string, usuario: JwtPayload) {
    if (usuario.rol !== Rol.ADMIN) {
      throw new ForbiddenException("Solo un administrador puede eliminar una historia clinica.");
    }

    await this.obtenerPorId(id, usuario);

    await this.prisma.historiaClinica.update({
      where: { id },
      data: {
        eliminadoEn: new Date()
      }
    });

    return {
      mensaje: "Historia clinica eliminada correctamente."
    };
  }

  private validarPermisoEscritura(usuario: JwtPayload) {
    if (![Rol.ADMIN, Rol.VETERINARIO].includes(usuario.rol)) {
      throw new ForbiddenException("No tienes permisos para modificar historias clinicas.");
    }
  }

  private validarPropietarioVeterinario(veterinarioId: string, usuario: JwtPayload) {
    if (usuario.rol === Rol.VETERINARIO && veterinarioId !== usuario.sub) {
      throw new ForbiddenException("Solo puedes gestionar historias clinicas de tus propias citas.");
    }
  }

  private validarHistoriaAbierta(cerrada: boolean) {
    if (cerrada) {
      throw new BadRequestException("No se puede modificar una historia clinica cerrada.");
    }
  }

  private async obtenerCitaCompletada(citaId: string) {
    const cita = await this.prisma.cita.findFirst({
      where: {
        id: citaId,
        eliminadoEn: null
      },
      select: {
        id: true,
        estado: true,
        mascotaId: true,
        veterinarioId: true
      }
    });

    if (!cita) {
      throw new NotFoundException("Cita no encontrada.");
    }

    if (cita.estado !== "COMPLETADA") {
      throw new BadRequestException("Solo se puede crear historia clinica desde una cita completada.");
    }

    return cita;
  }

  private async validarHistoriaUnicaPorCita(citaId: string) {
    const existe = await this.prisma.historiaClinica.findFirst({
      where: {
        citaId
      }
    });

    if (existe) {
      throw new ConflictException("La cita ya tiene una historia clinica registrada.");
    }
  }

  private async validarMascota(mascotaId: string) {
    const mascota = await this.prisma.mascota.findFirst({
      where: {
        id: mascotaId,
        activo: true,
        eliminadoEn: null
      }
    });

    if (!mascota) {
      throw new BadRequestException("La mascota asociada no existe o no esta activa.");
    }
  }

  private async validarVeterinario(veterinarioId: string) {
    const veterinario = await this.prisma.usuario.findFirst({
      where: {
        id: veterinarioId,
        rol: "VETERINARIO",
        activo: true,
        eliminadoEn: null
      }
    });

    if (!veterinario) {
      throw new BadRequestException("El veterinario asociado no existe o no esta activo.");
    }
  }

  private camposHistoriaClinica() {
    return {
      id: true,
      fecha: true,
      diagnostico: true,
      tratamiento: true,
      observaciones: true,
      cerrada: true,
      citaId: true,
      mascotaId: true,
      veterinarioId: true,
      cita: {
        select: {
          id: true,
          fecha: true,
          motivo: true,
          estado: true,
          cliente: {
            select: {
              id: true,
              nombres: true,
              apellidos: true,
              dni: true,
              celular: true
            }
          }
        }
      },
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
      creadoEn: true,
      actualizadoEn: true
    } satisfies Prisma.HistoriaClinicaSelect;
  }
}
