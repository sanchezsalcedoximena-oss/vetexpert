import { z } from "zod";

export const dniSchema = z.string().regex(/^\d{8}$/, "El DNI debe tener 8 digitos.");

export const celularPeruSchema = z
  .string()
  .regex(/^9\d{8}$/, "El celular debe tener 9 digitos e iniciar en 9.");

export const correoSchema = z.string().email("El correo no es valido.");
