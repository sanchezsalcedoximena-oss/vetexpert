import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { Rol } from "../enums/rol.enum";

type UsuarioConRol = {
  rol?: Rol;
};

type RequestConUsuario = {
  user?: UsuarioConRol;
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rolesPermitidos = this.reflector.getAllAndOverride<Rol[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (!rolesPermitidos?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestConUsuario>();
    const rolUsuario = request.user?.rol;

    return Boolean(rolUsuario && rolesPermitidos.includes(rolUsuario));
  }
}
