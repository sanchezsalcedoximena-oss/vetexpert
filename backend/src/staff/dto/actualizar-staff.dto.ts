import { IsEmail, IsEnum, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { Rol } from "../../common/enums/rol.enum";

export class ActualizarStaffDto {
  @IsOptional()
  @IsString({ message: "Los nombres no son validos." })
  @MinLength(2, { message: "Ingresa al menos 2 caracteres." })
  @MaxLength(80, { message: "Los nombres no deben superar 80 caracteres." })
  nombres?: string;

  @IsOptional()
  @IsString({ message: "Los apellidos no son validos." })
  @MinLength(2, { message: "Ingresa al menos 2 caracteres." })
  @MaxLength(80, { message: "Los apellidos no deben superar 80 caracteres." })
  apellidos?: string;

  @IsOptional()
  @IsEmail({}, { message: "El correo no es valido." })
  correo?: string;

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

  @IsOptional()
  @IsEnum(Rol, { message: "El rol no es valido." })
  rol?: Rol;
}
