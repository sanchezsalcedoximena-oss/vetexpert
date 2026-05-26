import { Injectable } from "@nestjs/common";
import { EstadoCita, Prisma, Rol as PrismaRol } from "@prisma/client";
import { JwtPayload } from "../auth/types/jwt-payload.type";
import { Rol } from "../common/enums/rol.enum";
import { PrismaService } from "../common/prisma/prisma.service";
import { ResumenDashboardDto } from "./dto/resumen-dashboard.dto";

type ConteoEstado = {
  estado: EstadoCita;
  total: number;
};

type ConteoEspecie = {
  especie: string;
  total: number;
};

type ConteoRol = {
  rol: PrismaRol;
  total: number;
};

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerResumen(query: ResumenDashboardDto, usuario: JwtPayload) {
    const periodo = this.obtenerPeriodo(query);
    const ahora = new Date();
    const rangoHoy = this.obtenerRangoDia(ahora);
    const filtroVeterinario = usuario.rol === Rol.VETERINARIO ? usuario.sub : undefined;
    const whereCitasBase = this.crearWhereCitas(filtroVeterinario);
    const whereHistoriasBase = this.crearWhereHistorias(filtroVeterinario);
    const whereMascotasBase = this.crearWhereMascotasRelacionadas(filtroVeterinario);
    const whereClientesBase = this.crearWhereClientesRelacionados(filtroVeterinario);

    const transacciones: Prisma.PrismaPromise<unknown>[] = [
      this.prisma.cita.count({
        where: {
          ...whereCitasBase,
          fecha: {
            gte: rangoHoy.inicio,
            lte: rangoHoy.fin
          }
        }
      }),
      this.prisma.cita.count({
        where: {
          ...whereCitasBase,
          estado: EstadoCita.PENDIENTE,
          fecha: this.crearFiltroFechaPeriodo(periodo)
        }
      }),
      this.prisma.cita.count({
        where: {
          ...whereCitasBase,
          estado: EstadoCita.CONFIRMADA,
          fecha: this.crearFiltroFechaPeriodo(periodo)
        }
      }),
      this.prisma.cita.count({
        where: {
          ...whereCitasBase,
          estado: EstadoCita.COMPLETADA,
          fecha: this.crearFiltroFechaPeriodo(periodo)
        }
      }),
      this.prisma.cliente.count({ where: whereClientesBase }),
      this.prisma.mascota.count({ where: whereMascotasBase }),
      this.prisma.historiaClinica.count({
        where: {
          ...whereHistoriasBase,
          cerrada: false
        }
      }),
      this.prisma.cita.findMany({
        where: {
          ...whereCitasBase,
          fecha: {
            gte: ahora
          },
          estado: {
            in: [EstadoCita.PENDIENTE, EstadoCita.CONFIRMADA]
          }
        },
        orderBy: { fecha: "asc" },
        take: 5,
        select: this.camposProximaCita()
      }),
      this.prisma.cita.groupBy({
        by: ["estado"],
        where: {
          ...whereCitasBase,
          fecha: this.crearFiltroFechaPeriodo(periodo)
        },
        _count: {
          _all: true
        }
      }),
      this.prisma.mascota.groupBy({
        by: ["especie"],
        where: whereMascotasBase,
        _count: {
          _all: true
        },
        orderBy: {
          especie: "asc"
        }
      })
    ];

    if (usuario.rol === Rol.ADMIN) {
      transacciones.push(
        this.prisma.usuario.groupBy({
          by: ["rol"],
          where: {
            activo: true,
            eliminadoEn: null
          },
          _count: {
            _all: true
          },
          orderBy: {
            rol: "asc"
          }
        })
      );
    }

    const resultados = await this.prisma.$transaction(transacciones);
    const [
      citasHoy,
      citasPendientes,
      citasConfirmadas,
      citasCompletadas,
      clientesActivos,
      mascotasActivas,
      historiasAbiertas,
      proximasCitas,
      citasPorEstado,
      mascotasPorEspecie,
      staffPorRol
    ] = resultados as [
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      ReturnType<DashboardService["camposProximaCita"]>[],
      Array<{ estado: EstadoCita; _count: { _all: number } }>,
      Array<{ especie: string; _count: { _all: number } }>,
      Array<{ rol: PrismaRol; _count: { _all: number } }> | undefined
    ];

    return {
      rol: usuario.rol,
      periodo: {
        fechaInicio: periodo.inicio.toISOString(),
        fechaFin: periodo.fin.toISOString()
      },
      metricas: {
        citasHoy,
        citasPendientes,
        citasConfirmadas,
        citasCompletadas,
        clientesActivos,
        mascotasActivas,
        historiasAbiertas
      },
      proximasCitas,
      citasPorEstado: this.normalizarCitasPorEstado(citasPorEstado),
      mascotasPorEspecie: this.normalizarMascotasPorEspecie(mascotasPorEspecie),
      ...(usuario.rol === Rol.ADMIN
        ? {
          staffPorRol: this.normalizarStaffPorRol(staffPorRol ?? [])
        }
        : {})
    };
  }

  private crearWhereCitas(veterinarioId?: string): Prisma.CitaWhereInput {
    return {
      eliminadoEn: null,
      ...(veterinarioId ? { veterinarioId } : {})
    };
  }

  private crearWhereHistorias(veterinarioId?: string): Prisma.HistoriaClinicaWhereInput {
    return {
      eliminadoEn: null,
      ...(veterinarioId ? { veterinarioId } : {})
    };
  }

  private crearWhereMascotasRelacionadas(veterinarioId?: string): Prisma.MascotaWhereInput {
    return {
      activo: true,
      eliminadoEn: null,
      ...(veterinarioId
        ? {
          citas: {
            some: {
              veterinarioId,
              eliminadoEn: null
            }
          }
        }
        : {})
    };
  }

  private crearWhereClientesRelacionados(veterinarioId?: string): Prisma.ClienteWhereInput {
    return {
      activo: true,
      eliminadoEn: null,
      ...(veterinarioId
        ? {
          citas: {
            some: {
              veterinarioId,
              eliminadoEn: null
            }
          }
        }
        : {})
    };
  }

  private obtenerPeriodo(query: ResumenDashboardDto) {
    const ahora = new Date();
    const inicio = query.fechaInicio ? new Date(query.fechaInicio) : new Date(ahora.getFullYear(), ahora.getMonth(), 1, 0, 0, 0, 0);
    const fin = query.fechaFin ? new Date(query.fechaFin) : new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59, 999);

    return { inicio, fin };
  }

  private obtenerRangoDia(fecha: Date) {
    return {
      inicio: new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 0, 0, 0, 0),
      fin: new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 23, 59, 59, 999)
    };
  }

  private crearFiltroFechaPeriodo(periodo: { inicio: Date; fin: Date }) {
    return {
      gte: periodo.inicio,
      lte: periodo.fin
    };
  }

  private normalizarCitasPorEstado(conteos: Array<{ estado: EstadoCita; _count: { _all: number } }>): ConteoEstado[] {
    return Object.values(EstadoCita).map((estado) => ({
      estado,
      total: conteos.find((conteo) => conteo.estado === estado)?._count._all ?? 0
    }));
  }

  private normalizarMascotasPorEspecie(conteos: Array<{ especie: string; _count: { _all: number } }>): ConteoEspecie[] {
    return conteos.map((conteo) => ({
      especie: conteo.especie,
      total: conteo._count._all
    }));
  }

  private normalizarStaffPorRol(conteos: Array<{ rol: PrismaRol; _count: { _all: number } }>): ConteoRol[] {
    return Object.values(PrismaRol).map((rol) => ({
      rol,
      total: conteos.find((conteo) => conteo.rol === rol)?._count._all ?? 0
    }));
  }

  private camposProximaCita() {
    return {
      id: true,
      fecha: true,
      motivo: true,
      estado: true,
      mascota: {
        select: {
          id: true,
          nombre: true,
          especie: true,
          raza: true
        }
      },
      cliente: {
        select: {
          id: true,
          nombres: true,
          apellidos: true,
          celular: true
        }
      },
      veterinario: {
        select: {
          id: true,
          nombres: true,
          apellidos: true,
          correo: true
        }
      }
    } satisfies Prisma.CitaSelect;
  }
}
