import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CrearMensajeContactoDto {
  @IsString({ message: "Los nombres son obligatorios." })
  @MinLength(2, { message: "Ingresa al menos 2 caracteres." })
  @MaxLength(100, { message: "Los nombres no deben superar 100 caracteres." })
  nombres!: string;

  @IsEmail({}, { message: "El correo no es valido." })
  correo!: string;

  @IsOptional()
  @Matches(/^9\d{8}$/, { message: "El celular debe tener 9 digitos e iniciar en 9." })
  celular?: string;

  @IsString({ message: "El asunto es obligatorio." })
  @MinLength(3, { message: "Ingresa un asunto mas descriptivo." })
  @MaxLength(120, { message: "El asunto no debe superar 120 caracteres." })
  asunto!: string;

  @IsString({ message: "El mensaje es obligatorio." })
  @MinLength(10, { message: "El mensaje debe tener al menos 10 caracteres." })
  @MaxLength(800, { message: "El mensaje no debe superar 800 caracteres." })
  mensaje!: string;
}
