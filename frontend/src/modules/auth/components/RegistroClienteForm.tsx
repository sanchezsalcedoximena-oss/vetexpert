"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { z } from "zod";
import { AuthShell } from "@/components/auth/AuthShell";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Button } from "@/components/ui/Button";
import { GlobalLoader } from "@/components/ui/GlobalLoader";
import { Input } from "@/components/ui/Input";
import { registrarCliente } from "@/services/auth";
import { useAuthStore } from "@/store/auth-store";
import { celularPeruSchema, correoSchema, dniSchema } from "@/validators/peru";

const registroSchema = z.object({
  nombres: z.string().min(2, "Ingresa tus nombres."),
  apellidos: z.string().min(2, "Ingresa tus apellidos."),
  celular: celularPeruSchema,
  dni: z.union([dniSchema, z.literal("")]).optional(),
  correo: correoSchema,
  contrasena: z
    .string()
    .min(8, "La contrasena debe tener al menos 8 caracteres.")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, "Incluye mayuscula, minuscula y numero.")
});

type RegistroErrores = Partial<Record<keyof z.infer<typeof registroSchema> | "general", string>>;

export function RegistroClienteForm() {
  const router = useRouter();
  const establecerSesion = useAuthStore((state) => state.establecerSesion);
  const [errores, setErrores] = useState<RegistroErrores>({});
  const [cargando, setCargando] = useState(false);

  async function enviarFormulario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const validacion = registroSchema.safeParse({
      nombres: String(formData.get("nombres") ?? ""),
      apellidos: String(formData.get("apellidos") ?? ""),
      celular: String(formData.get("celular") ?? ""),
      dni: String(formData.get("dni") ?? ""),
      correo: String(formData.get("correo") ?? ""),
      contrasena: String(formData.get("contrasena") ?? "")
    });

    if (!validacion.success) {
      setErrores(Object.fromEntries(validacion.error.issues.map((issue) => [issue.path[0], issue.message])));
      return;
    }

    try {
      setErrores({});
      setCargando(true);
      const sesion = await registrarCliente({
        ...validacion.data,
        dni: validacion.data.dni || undefined
      });
      establecerSesion(sesion);
      router.push("/dashboard");
    } catch {
      setErrores({ general: "No pudimos crear la cuenta. Revisa si el correo, celular o DNI ya existe." });
    } finally {
      setCargando(false);
    }
  }

  return (
    <AuthShell titulo="Registro cliente" descripcion="Crea tu cuenta para ingresar al portal VetExpert.">
      <GlobalLoader visible={cargando} texto="Cargando sistema..." />
      <form className="grid gap-4" onSubmit={enviarFormulario}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input error={errores.nombres} label="Nombres" name="nombres" placeholder="Maria" />
          <Input error={errores.apellidos} label="Apellidos" name="apellidos" placeholder="Ramirez" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input error={errores.celular} inputMode="numeric" label="Celular" name="celular" placeholder="987654321" />
          <Input error={errores.dni} inputMode="numeric" label="DNI" name="dni" placeholder="Opcional" />
        </div>
        <Input error={errores.correo} label="Correo" name="correo" placeholder="cliente@correo.com" type="email" />
        <PasswordInput error={errores.contrasena} label="Contrasena segura" name="contrasena" />
        {errores.general ? <p className="text-sm font-medium text-red-600">{errores.general}</p> : null}
        <Button className="w-full" type="submit">
          Crear cuenta
        </Button>
      </form>
      <p className="mt-4 text-sm text-texto/68">
        Ya tienes cuenta?{" "}
        <Link className="font-semibold text-primario hover:underline" href="/portal/login">
          Ingresa al portal
        </Link>
      </p>
    </AuthShell>
  );
}
