import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { hash } from "bcryptjs";
import { JwtPayload } from "../auth/types/jwt-payload.type";
import { Rol } from "../common/enums/rol.enum";
import { PrismaService } from "../common/prisma/prisma.service";
import { ActualizarStaffDto } from "./dto/actualizar-staff.dto";
import { CrearStaffDto } from "./dto/crear-staff.dto";
import { ListarStaffDto } from "./dto/listar-staff.dto";

type StaffOperacion = {
  id: string;
  rol: string;
  activo: boolean;
};

@Injectable()
export class StaffService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(query: ListarStaffDto) {
    const pagina = query.pagina ?? 1;
    const limite = query.limite ?? 10;
    const busqueda = query.busqueda?.trim();
    const where: Prisma.UsuarioWhereInput = {
      eliminadoEn: null,
      ...(query.estado === "inactivos" ? { activo: false } : {}),
      ...((query.estado ?? "activos") === "activos" ? { activo: true } : {}),
      ...(query.rol ? { rol: query.rol } : {}),
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

    const [total, staff] = await this.prisma.$transaction([
      this.prisma.usuario.count({ where }),
      this.prisma.usuario.findMany({
        where,
        orderBy: [{ apellidos: "asc" }, { nombres: "asc" }],
        skip: (pagina - 1) * limite,
        take: limite,
        select: this.camposStaff()
      })
    ]);

    return {
      datos: staff,
      meta: {
        pagina,
        limite,
        total,
        totalPaginas: Math.max(1, Math.ceil(total / limite))
      }
    };
  }

  async obtenerPorId(id: string) {
    const staff = await this.prisma.usuario.findFirst({
      where: {
        id,
        eliminadoEn: null
      },
      select: this.camposStaff()
    });

    if (!staff) {
      throw new NotFoundException("Staff no encontrado.");
    }

    return staff;
  }

  async crear(dto: CrearStaffDto) {
    this.validarRolStaff(dto.rol);
    await this.validarDuplicados(dto);

    return this.prisma.usuario.create({
      data: {
        nombres: dto.nombres.trim(),
        apellidos: dto.apellidos.trim(),
        correo: dto.correo.toLowerCase().trim(),
        dni: this.normalizarOpcional(dto.dni),
        celular: this.normalizarOpcional(dto.celular),
        direccion: this.normalizarOpcional(dto.direccion),
        rol: dto.rol,
        passwordHash: await hash(dto.contrasena, 12),
        activo: dto.activo ?? true
      },
      select: this.camposStaff()
    });
  }

  async actualizar(id: string, dto: ActualizarStaffDto, adminActual: JwtPayload) {
    const staffActual = await this.obtenerStaffOperacion(id);

    if (dto.rol) {
      this.validarRolStaff(dto.rol);
      await this.validarCambioRolAdmin(staffActual, dto.rol, adminActual);
    }

    await this.validarDuplicados(dto, id);

    const data: Prisma.UsuarioUpdateInput = {
      ...(dto.nombres ? { nombres: dto.nombres.trim() } : {}),
      ...(dto.apellidos ? { apellidos: dto.apellidos.trim() } : {}),
      ...(dto.correo ? { correo: dto.correo.toLowerCase().trim() } : {}),
      ...(dto.dni !== undefined ? { dni: this.normalizarOpcional(dto.dni) } : {}),
      ...(dto.celular !== undefined ? { celular: this.normalizarOpcional(dto.celular) } : {}),
      ...(dto.direccion !== undefined ? { direccion: this.normalizarOpcional(dto.direccion) } : {}),
      ...(dto.rol ? { rol: dto.rol } : {})
    };

    return this.prisma.usuario.update({
      where: { id },
      data,
      select: this.camposStaff()
    });
  }

  async activar(id: string) {
    await this.obtenerStaffOperacion(id);

    return this.prisma.usuario.update({
      where: { id },
      data: { activo: true },
      select: this.camposStaff()
    });
  }

  async inactivar(id: string, adminActual: JwtPayload) {
    const staff = await this.obtenerStaffOperacion(id);

    if (staff.id === adminActual.sub) {
      throw new ForbiddenException("No puedes inactivar tu propia cuenta administrativa.");
    }

    await this.validarInactivacionAdmin(staff);

    const [, usuarioActualizado] = await this.prisma.$transaction([
      this.prisma.refreshToken.updateMany({
        where: {
          usuarioId: id,
          revocadoEn: null
        },
        data: {
          revocadoEn: new Date()
        }
      }),
      this.prisma.usuario.update({
        where: { id },
        data: { activo: false },
        select: this.camposStaff()
      })
    ]);

    return usuarioActualizado;
  }

  private async obtenerStaffOperacion(id: string) {
    const staff = await this.prisma.usuario.findFirst({
      where: {
        id,
        eliminadoEn: null
      },
      select: {
        id: true,
        rol: true,
        activo: true
      }
    });

    if (!staff) {
      throw new NotFoundException("Staff no encontrado.");
    }

    return staff;
  }

  private validarRolStaff(rol: Rol) {
    if (![Rol.ADMIN, Rol.SECRETARIA, Rol.VETERINARIO].includes(rol)) {
      throw new BadRequestException("El rol seleccionado no es valido para staff.");
    }
  }

  private async validarDuplicados(dto: Partial<CrearStaffDto>, idIgnorado?: string) {
    const condiciones: Prisma.UsuarioWhereInput[] = [];

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

    const existe = await this.prisma.usuario.findFirst({
      where: {
        OR: condiciones,
        ...(idIgnorado ? { NOT: { id: idIgnorado } } : {})
      }
    });

    if (existe) {
      throw new ConflictException("Ya existe un staff con el correo, DNI o celular ingresado.");
    }
  }

  private async validarCambioRolAdmin(
    staffActual: StaffOperacion,
    nuevoRol: Rol,
    adminActual: JwtPayload
  ) {
    if (staffActual.rol !== Rol.ADMIN || nuevoRol === Rol.ADMIN || !staffActual.activo) {
      return;
    }

    const totalAdminsActivos = await this.contarAdminsActivos();

    if (totalAdminsActivos > 1) {
      return;
    }

    if (staffActual.id === adminActual.sub) {
      throw new ForbiddenException("No puedes quitarte el rol ADMIN si eres el ultimo administrador activo.");
    }

    throw new BadRequestException("No se puede degradar al ultimo administrador activo.");
  }

  private async validarInactivacionAdmin(staff: StaffOperacion) {
    if (staff.rol !== Rol.ADMIN || !staff.activo) {
      return;
    }

    const totalAdminsActivos = await this.contarAdminsActivos();

    if (totalAdminsActivos <= 1) {
      throw new BadRequestException("No se puede inactivar al ultimo administrador activo.");
    }
  }

  private contarAdminsActivos() {
    return this.prisma.usuario.count({
      where: {
        rol: Rol.ADMIN,
        activo: true,
        eliminadoEn: null
      }
    });
  }

  private normalizarOpcional(valor?: string) {
    const normalizado = valor?.trim();
    return normalizado || null;
  }

  private camposStaff() {
    return {
      id: true,
      nombres: true,
      apellidos: true,
      correo: true,
      dni: true,
      celular: true,
      direccion: true,
      rol: true,
      activo: true,
      ultimoAccesoEn: true,
      creadoEn: true,
      actualizadoEn: true,
      eliminadoEn: true
    } satisfies Prisma.UsuarioSelect;
  }
}
