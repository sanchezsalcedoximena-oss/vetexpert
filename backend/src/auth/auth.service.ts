import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { randomBytes, randomUUID } from "node:crypto";
import { compare, hash } from "bcryptjs";
import { PrismaService } from "../common/prisma/prisma.service";
import { Rol } from "../common/enums/rol.enum";
import { LoginDto } from "./dto/login.dto";
import { RecuperarContrasenaDto } from "./dto/recuperar-contrasena.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { JwtPayload } from "./types/jwt-payload.type";

type UsuarioAuth = {
  id: string;
  nombres: string;
  apellidos: string;
  correo: string;
  rol: Rol;
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

    if (
      !tokenGuardado ||
      !this.esStaffActivo(tokenGuardado.usuario) ||
      !(await compare(secreto, tokenGuardado.tokenHash))
    ) {
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
        rol: {
          in: STAFF_ROLES
        },
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
      rol: usuario.rol
    };
  }

  private async crearSesion(usuario: UsuarioAuth) {
    const payload: JwtPayload = {
      sub: usuario.id,
      correo: usuario.correo,
      rol: usuario.rol
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
  }): UsuarioAuth {
    if (!this.esStaffActivo(usuario)) {
      throw new UnauthorizedException("Usuario staff invalido.");
    }

    return {
      id: usuario.id,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      correo: usuario.correo,
      rol: usuario.rol as Rol
    };
  }

  private esStaffActivo(usuario: { rol: string; activo?: boolean; eliminadoEn?: Date | null }) {
    return STAFF_ROLES.includes(usuario.rol as Rol) && usuario.activo !== false && !usuario.eliminadoEn;
  }
}
