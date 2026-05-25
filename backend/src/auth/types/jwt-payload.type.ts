import { Rol } from "../../common/enums/rol.enum";

export type JwtPayload = {
  sub: string;
  correo: string;
  rol: Rol;
};
