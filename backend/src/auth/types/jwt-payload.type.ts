import { Rol } from "../../common/enums/rol.enum";

export type TipoUsuario = "STAFF" | "CLIENTE";

export type JwtPayload = {
  sub: string;
  correo: string;
  rol: Rol;
  tipoUsuario: TipoUsuario;
};
