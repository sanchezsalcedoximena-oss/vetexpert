import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength
} from "class-validator";

export class CrearClienteDto {
  @IsString({ message: "Los nombres son obligatorios." })
  @MinLength(2, { message: "Ingresa al menos 2 caracteres." })
  @MaxLength(80, { message: "Los nombres no deben superar 80 caracteres." })
  nombres!: string;

  @IsString({ message: "Los apellidos son obligatorios." })
  @MinLength(2, { message: "Ingresa al menos 2 caracteres." })
  @MaxLength(80, { message: "Los apellidos no deben superar 80 caracteres." })
  apellidos!: string;

  @Matches(/^\d{8}$/, { message: "El DNI debe tener 8 digitos." })
  dni!: string;

  @Matches(/^9\d{8}$/, { message: "El celular debe tener 9 digitos e iniciar en 9." })
  celular!: string;

  @IsEmail({}, { message: "El correo no es valido." })
  correo!: string;

  @IsOptional()
  @IsString({ message: "La direccion no es valida." })
  @MaxLength(160, { message: "La direccion no debe superar 160 caracteres." })
  direccion?: string;

  @IsOptional()
  @IsBoolean({ message: "El estado activo no es valido." })
  activo?: boolean;
}
