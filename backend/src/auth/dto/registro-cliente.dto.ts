import { IsEmail, IsOptional, Matches, MinLength } from "class-validator";

export class RegistroClienteDto {
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,80}$/, {
    message: "Los nombres solo deben contener letras y espacios."
  })
  nombres!: string;

  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,80}$/, {
    message: "Los apellidos solo deben contener letras y espacios."
  })
  apellidos!: string;

  @Matches(/^9\d{8}$/, {
    message: "El celular debe tener 9 digitos e iniciar en 9."
  })
  celular!: string;

  @IsOptional()
  @Matches(/^\d{8}$/, { message: "El DNI debe tener 8 digitos." })
  dni?: string;

  @IsEmail({}, { message: "El correo no es valido." })
  correo!: string;

  @MinLength(8, { message: "La contrasena debe tener al menos 8 caracteres." })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: "La contrasena debe incluir mayuscula, minuscula y numero."
  })
  contrasena!: string;
}
