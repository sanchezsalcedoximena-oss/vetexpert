import { EstadoCita } from "@prisma/client";
import { Type } from "class-transformer";
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from "class-validator";

export class ListarCitasDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "La pagina debe ser un numero entero." })
  @Min(1, { message: "La pagina minima es 1." })
  pagina?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "El limite debe ser un numero entero." })
  @Min(1, { message: "El limite minimo es 1." })
  @Max(50, { message: "El limite maximo es 50." })
  limite?: number = 10;

  @IsOptional()
  @IsString({ message: "La busqueda no es valida." })
  busqueda?: string;

  @IsOptional()
  @IsEnum(EstadoCita, { message: "El filtro de estado no es valido." })
  estado?: EstadoCita;

  @IsOptional()
  @IsUUID("4", { message: "El filtro de veterinario no es valido." })
  veterinarioId?: string;

  @IsOptional()
  @IsUUID("4", { message: "El filtro de cliente no es valido." })
  clienteId?: string;

  @IsOptional()
  @IsUUID("4", { message: "El filtro de mascota no es valido." })
  mascotaId?: string;

  @IsOptional()
  @IsDateString({}, { message: "La fecha de inicio no es valida." })
  fechaInicio?: string;

  @IsOptional()
  @IsDateString({}, { message: "La fecha de fin no es valida." })
  fechaFin?: string;
}
