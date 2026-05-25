import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Rol } from "../../common/enums/rol.enum";
import { JwtPayload } from "../types/jwt-payload.type";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET ?? "vetexpert_access_secret_local"
    });
  }

  validate(payload: JwtPayload) {
    if (![Rol.ADMIN, Rol.SECRETARIA, Rol.VETERINARIO].includes(payload.rol)) {
      throw new UnauthorizedException("Token invalido para staff.");
    }

    return payload;
  }
}
