import { IsDateString, IsOptional } from "class-validator";

export class ResumenDashboardDto {
  @IsOptional()
  @IsDateString({}, { message: "La fecha de inicio no es valida." })
  fechaInicio?: string;

  @IsOptional()
  @IsDateString({}, { message: "La fecha de fin no es valida." })
  fechaFin?: string;
}
