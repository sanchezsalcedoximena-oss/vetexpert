import { IsEmail, IsString, MinLength } from "class-validator";

export class LoginDto {
  @IsEmail({}, { message: "El correo no es valido." })
  correo!: string;

  @IsString({ message: "La contrasena es obligatoria." })
  @MinLength(8, { message: "La contrasena debe tener al menos 8 caracteres." })
  contrasena!: string;
}
