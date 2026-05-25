import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength
} from "class-validator";
import { Type } from "class-transformer";

export class CrearMascotaDto {
  @IsString({ message: "El nombre es obligatorio." })
  @MinLength(2, { message: "El nombre debe tener al menos 2 caracteres." })
  @MaxLength(60, { message: "El nombre no debe superar 60 caracteres." })
  nombre!: string;

  @IsIn(["PERRO", "GATO", "AVE", "CONEJO", "HAMSTER", "REPTIL", "PEZ", "OTRO"], {
    message: "La especie no es valida."
  })
  especie!: string;

  @IsOptional()
  @IsString({ message: "La raza no es valida." })
  @MaxLength(60, { message: "La raza no debe superar 60 caracteres." })
  raza?: string;

  @IsIn(["MACHO", "HEMBRA"], { message: "El sexo debe ser MACHO o HEMBRA." })
  sexo!: string;

  @IsOptional()
  @IsDateString({}, { message: "La fecha de nacimiento no es valida." })
  fechaNacimiento?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "El peso debe ser un numero." })
  @Min(0.01, { message: "El peso debe ser mayor a 0." })
  peso?: number;

  @IsOptional()
  @IsString({ message: "El color no es valido." })
  @MaxLength(40, { message: "El color no debe superar 40 caracteres." })
  color?: string;

  @IsOptional()
  @IsBoolean({ message: "El campo esterilizado no es valido." })
  esterilizado?: boolean;

  @IsOptional()
  @IsString({ message: "Las alergias no son validas." })
  @MaxLength(300, { message: "Las alergias no deben superar 300 caracteres." })
  alergias?: string;

  @IsOptional()
  @IsString({ message: "Las observaciones no son validas." })
  @MaxLength(500, { message: "Las observaciones no deben superar 500 caracteres." })
  observaciones?: string;

  @IsUUID("4", { message: "El cliente seleccionado no es valido." })
  clienteId!: string;

  @IsOptional()
  @IsBoolean({ message: "El estado activo no es valido." })
  activo?: boolean;
}
