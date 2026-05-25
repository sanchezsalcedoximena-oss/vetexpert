import { EstadoCita } from "@prisma/client";
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";

export class ActualizarCitaDto {
  @IsOptional()
  @IsDateString({}, { message: "La fecha de la cita no es valida." })
  fecha?: string;

  @IsOptional()
  @IsString({ message: "El motivo no es valido." })
  @MinLength(3, { message: "El motivo debe tener al menos 3 caracteres." })
  @MaxLength(200, { message: "El motivo no debe superar los 200 caracteres." })
  motivo?: string;

  @IsOptional()
  @IsString({ message: "Las observaciones no son validas." })
  @MaxLength(1000, { message: "Las observaciones no deben superar los 1000 caracteres." })
  observaciones?: string;

  @IsOptional()
  @IsEnum(EstadoCita, { message: "El estado de la cita no es valido." })
  estado?: EstadoCita;

  @IsOptional()
  @IsUUID("4", { message: "La mascota seleccionada no es valida." })
  mascotaId?: string;

  @IsOptional()
  @IsUUID("4", { message: "El veterinario seleccionado no es valido." })
  veterinarioId?: string;
}
