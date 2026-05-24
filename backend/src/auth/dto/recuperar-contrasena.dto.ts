import { IsEmail } from "class-validator";

export class RecuperarContrasenaDto {
  @IsEmail({}, { message: "El correo no es valido." })
  correo!: string;
}
