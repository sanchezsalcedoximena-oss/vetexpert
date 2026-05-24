import { IsEmail, IsString, MinLength } from "class-validator";

export class GoogleMockDto {
  @IsEmail({}, { message: "El correo de Google no es valido." })
  correo!: string;

  @IsString({ message: "El nombre de Google es obligatorio." })
  @MinLength(2, { message: "El nombre de Google no es valido." })
  nombre!: string;
}
