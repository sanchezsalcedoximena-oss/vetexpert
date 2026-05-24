import { Injectable, NestMiddleware } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { NextFunction, Request, Response } from "express";
import { JwtPayload } from "../../auth/types/jwt-payload.type";

type RequestConUsuario = Request & {
  user?: JwtPayload;
};

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: RequestConUsuario, _res: Response, next: NextFunction) {
    const authorization = req.headers.authorization;
    const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : undefined;

    if (token) {
      try {
        req.user = this.jwtService.verify<JwtPayload>(token, {
          secret: process.env.JWT_ACCESS_SECRET ?? "vetexpert_access_secret_local"
        });
      } catch {
        req.user = undefined;
      }
    }

    next();
  }
}
