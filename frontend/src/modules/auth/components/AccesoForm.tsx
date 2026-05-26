"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { z } from "zod";
import { AuthShell } from "@/components/auth/AuthShell";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Button } from "@/components/ui/Button";
import { GlobalLoader } from "@/components/ui/GlobalLoader";
import { Input } from "@/components/ui/Input";
import { loginStaff } from "@/services/auth";
import { useAuthStore } from "@/store/auth-store";
import { correoSchema } from "@/validators/peru";

const loginSchema = z.object({
  correo: correoSchema,
  contrasena: z.string().min(8, "La contraseña debe tener al menos 8 caracteres.")
});

type LoginErrores = Partial<Record<keyof z.infer<typeof loginSchema> | "general", string>>;

export function AccesoForm() {
  const router = useRouter();
  const establecerSesion = useAuthStore((state) => state.establecerSesion);
  const [errores, setErrores] = useState<LoginErrores>({});
  const [cargando, setCargando] = useState(false);

  async function enviarFormulario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const validacion = loginSchema.safeParse({
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
      const sesion = await loginStaff(validacion.data);
      establecerSesion(sesion);
      router.push("/dashboard");
    } catch {
      setErrores({ general: "No pudimos iniciar sesión con esas credenciales." });
    } finally {
      setCargando(false);
    }
  }

  return (
    <AuthShell
      titulo="Acceso staff"
      descripcion="Ingresa al panel interno con tu cuenta autorizada."
    >
      <GlobalLoader visible={cargando} texto="Cargando sistema..." />
      <form className="space-y-4" onSubmit={enviarFormulario}>
        <Input
          autoComplete="email"
          error={errores.correo}
          label="Correo"
          name="correo"
          placeholder="staff@vetexpert.pe"
          type="email"
        />
        <PasswordInput error={errores.contrasena} label="Contraseña" name="contrasena" placeholder="Tu contraseña" />
        {errores.general ? <p className="text-sm font-medium text-red-600">{errores.general}</p> : null}
        <Button className="w-full" loading={cargando} type="submit">
          Ingresar
        </Button>
      </form>
    </AuthShell>
  );
}
