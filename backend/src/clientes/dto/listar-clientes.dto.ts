import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class ListarClientesDto {
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
  @IsIn(["todos", "activos", "inactivos"], { message: "El filtro de estado no es valido." })
  estado?: "todos" | "activos" | "inactivos" = "activos";
}
