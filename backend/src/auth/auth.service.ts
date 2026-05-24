import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { randomBytes, randomUUID } from "node:crypto";
import { compare, hash } from "bcryptjs";
import { PrismaService } from "../common/prisma/prisma.service";
import { Rol } from "../common/enums/rol.enum";
import { GoogleMockDto } from "./dto/google-mock.dto";
import { LoginDto } from "./dto/login.dto";
import { RecuperarContrasenaDto } from "./dto/recuperar-contrasena.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { RegistroClienteDto } from "./dto/registro-cliente.dto";
import { JwtPayload, TipoUsuario } from "./types/jwt-payload.type";

type UsuarioAuth = {
  id: string;
  nombres: string;
  apellidos: string;
  correo: string;
  rol: Rol;
  tipoUsuario: TipoUsuario;
};

const STAFF_ROLES = [Rol.ADMIN, Rol.SECRETARIA, Rol.VETERINARIO];
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? "vetexpert_access_secret_local";
const REFRESH_DIAS = 7;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  obtenerEstado() {
    return {
      modulo: "auth",
      estado: "activo"
    };
  }

  async loginStaff(dto: LoginDto) {
    const usuario = await this.prisma.usuario.findFirst({
      where: {
        correo: dto.correo.toLowerCase(),
        tipoUsuario: "STAFF",
        rol: {
          in: STAFF_ROLES
        },
        activo: true,
        eliminadoEn: null
      }
    });

    if (!usuario || !(await compare(dto.contrasena, usuario.passwordHash))) {
      throw new UnauthorizedException("Credenciales de staff invalidas.");
    }

    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: { ultimoAccesoEn: new Date() }
    });

    return this.crearSesion(this.mapearUsuario(usuario));
  }

  async loginGoogleStaff(dto: GoogleMockDto) {
    const usuario = await this.prisma.usuario.findFirst({
      where: {
        correo: dto.correo.toLowerCase(),
        tipoUsuario: "STAFF",
        rol: {
          in: STAFF_ROLES
        },
        activo: true,
        eliminadoEn: null
      }
    });

    if (!usuario) {
      throw new UnauthorizedException("Google staff esta preparado; el correo aun no pertenece al staff.");
    }

    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: { ultimoAccesoEn: new Date() }
    });

    return this.crearSesion(this.mapearUsuario(usuario));
  }

  async registrarCliente(dto: RegistroClienteDto) {
    const correo = dto.correo.toLowerCase();
    const existe = await this.prisma.usuario.findFirst({
      where: {
        OR: [{ correo }, { celular: dto.celular }, ...(dto.dni ? [{ dni: dto.dni }] : [])]
      }
    });

    if (existe) {
      throw new ConflictException("Ya existe un usuario con el correo, celular o DNI ingresado.");
    }

    const usuario = await this.prisma.usuario.create({
      data: {
        nombres: dto.nombres.trim(),
        apellidos: dto.apellidos.trim(),
        celular: dto.celular,
        dni: dto.dni,
        correo,
        passwordHash: await hash(dto.contrasena, 12),
        rol: Rol.CLIENTE,
        tipoUsuario: "CLIENTE"
      }
    });

    return this.crearSesion(this.mapearUsuario(usuario));
  }

  async refrescarToken(dto: RefreshTokenDto) {
    const [tokenId, secreto] = dto.refreshToken.split(".");

    if (!tokenId || !secreto) {
      throw new UnauthorizedException("Refresh token invalido.");
    }

    const tokenGuardado = await this.prisma.refreshToken.findFirst({
      where: {
        id: tokenId,
        revocadoEn: null,
        expiracionEn: {
          gt: new Date()
        }
      },
      include: {
        usuario: true
      }
    });

    if (!tokenGuardado || !(await compare(secreto, tokenGuardado.tokenHash))) {
      throw new UnauthorizedException("Refresh token invalido.");
    }

    await this.prisma.refreshToken.update({
      where: { id: tokenGuardado.id },
      data: { revocadoEn: new Date() }
    });

    return this.crearSesion(this.mapearUsuario(tokenGuardado.usuario));
  }

  async recuperarContrasena(dto: RecuperarContrasenaDto) {
    const usuario = await this.prisma.usuario.findFirst({
      where: {
        correo: dto.correo.toLowerCase(),
        activo: true,
        eliminadoEn: null
      }
    });

    if (usuario) {
      const token = randomBytes(32).toString("hex");
      const expiracionEn = new Date(Date.now() + 1000 * 60 * 30);

      await this.prisma.recuperacionClave.create({
        data: {
          usuarioId: usuario.id,
          tokenHash: await hash(token, 12),
          expiracionEn
        }
      });
    }

    return {
      mensaje: "Si el correo existe, enviaremos instrucciones para recuperar la contrasena."
    };
  }

  obtenerPerfil(usuario: JwtPayload) {
    return {
      id: usuario.sub,
      correo: usuario.correo,
      rol: usuario.rol,
      tipoUsuario: usuario.tipoUsuario
    };
  }

  private async crearSesion(usuario: UsuarioAuth) {
    const payload: JwtPayload = {
      sub: usuario.id,
      correo: usuario.correo,
      rol: usuario.rol,
      tipoUsuario: usuario.tipoUsuario
    };
    const refreshToken = await this.crearRefreshToken(usuario.id);

    return {
      accessToken: this.jwtService.sign(payload, {
        secret: ACCESS_SECRET,
        expiresIn: "15m"
      }),
      refreshToken,
      usuario
    };
  }

  private async crearRefreshToken(usuarioId: string) {
    const tokenId = randomUUID();
    const secreto = randomBytes(48).toString("hex");
    const expiracionEn = new Date(Date.now() + 1000 * 60 * 60 * 24 * REFRESH_DIAS);

    await this.prisma.refreshToken.create({
      data: {
        id: tokenId,
        usuarioId,
        tokenHash: await hash(secreto, 12),
        expiracionEn
      }
    });

    return `${tokenId}.${secreto}`;
  }

  private mapearUsuario(usuario: {
    id: string;
    nombres: string;
    apellidos: string;
    correo: string;
    rol: string;
    tipoUsuario: string;
  }): UsuarioAuth {
    return {
      id: usuario.id,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      correo: usuario.correo,
      rol: usuario.rol as Rol,
      tipoUsuario: usuario.tipoUsuario as TipoUsuario
    };
  }
}
