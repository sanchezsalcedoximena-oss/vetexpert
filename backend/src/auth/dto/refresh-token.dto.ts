import { IsString, MinLength } from "class-validator";

export class RefreshTokenDto {
  @IsString({ message: "El refresh token es obligatorio." })
  @MinLength(20, { message: "El refresh token no es valido." })
  refreshToken!: string;
}
