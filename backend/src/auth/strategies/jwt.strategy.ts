import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Rol } from "../../common/enums/rol.enum";
import { PrismaService } from "../../common/prisma/prisma.service";
import { JwtPayload } from "../types/jwt-payload.type";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET ?? "vetexpert_access_secret_local"
    });
  }

  async validate(payload: JwtPayload) {
    if (![Rol.ADMIN, Rol.SECRETARIA, Rol.VETERINARIO].includes(payload.rol)) {
      throw new UnauthorizedException("Token invalido para staff.");
    }

    const usuario = await this.prisma.usuario.findFirst({
      where: {
        id: payload.sub,
        correo: payload.correo,
        rol: payload.rol,
        activo: true,
        eliminadoEn: null
      },
      select: {
        id: true
      }
    });

    if (!usuario) {
      throw new UnauthorizedException("Usuario staff inactivo o invalido.");
    }

    return payload;
  }
}
