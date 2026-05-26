import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { Rol } from "../../common/enums/rol.enum";

export class CrearStaffDto {
  @IsString({ message: "Los nombres son obligatorios." })
  @MinLength(2, { message: "Ingresa al menos 2 caracteres." })
  @MaxLength(80, { message: "Los nombres no deben superar 80 caracteres." })
  nombres!: string;

  @IsString({ message: "Los apellidos son obligatorios." })
  @MinLength(2, { message: "Ingresa al menos 2 caracteres." })
  @MaxLength(80, { message: "Los apellidos no deben superar 80 caracteres." })
  apellidos!: string;

  @IsEmail({}, { message: "El correo no es valido." })
  correo!: string;

  @IsOptional()
  @Matches(/^\d{8}$/, { message: "El DNI debe tener 8 digitos." })
  dni?: string;

  @IsOptional()
  @Matches(/^9\d{8}$/, { message: "El celular debe tener 9 digitos e iniciar en 9." })
  celular?: string;

  @IsOptional()
  @IsString({ message: "La direccion no es valida." })
  @MaxLength(160, { message: "La direccion no debe superar 160 caracteres." })
  direccion?: string;

  @IsEnum(Rol, { message: "El rol no es valido." })
  rol!: Rol;

  @IsString({ message: "La contrasena es obligatoria." })
  @MinLength(8, { message: "La contrasena debe tener al menos 8 caracteres." })
  @MaxLength(72, { message: "La contrasena no debe superar 72 caracteres." })
  contrasena!: string;

  @IsOptional()
  @IsBoolean({ message: "El estado activo no es valido." })
  activo?: boolean;
}
