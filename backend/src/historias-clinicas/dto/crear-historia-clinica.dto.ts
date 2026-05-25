import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CrearHistoriaClinicaDto {
  @IsString({ message: "El diagnostico es obligatorio." })
  @MinLength(3, { message: "El diagnostico debe tener al menos 3 caracteres." })
  @MaxLength(2000, { message: "El diagnostico no debe superar los 2000 caracteres." })
  diagnostico!: string;

  @IsString({ message: "El tratamiento es obligatorio." })
  @MinLength(3, { message: "El tratamiento debe tener al menos 3 caracteres." })
  @MaxLength(2000, { message: "El tratamiento no debe superar los 2000 caracteres." })
  tratamiento!: string;

  @IsOptional()
  @IsString({ message: "Las observaciones no son validas." })
  @MaxLength(3000, { message: "Las observaciones no deben superar los 3000 caracteres." })
  observaciones?: string;

  @IsOptional()
  @IsBoolean({ message: "El estado de cierre no es valido." })
  cerrada?: boolean;
}
