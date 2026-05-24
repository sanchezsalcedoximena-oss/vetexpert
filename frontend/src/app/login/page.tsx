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
import { loginGoogleStaff, loginStaff } from "@/services/auth";
import { correoSchema } from "@/validators/peru";

const loginSchema = z.object({
  correo: correoSchema,
  contrasena: z.string().min(8, "La contrasena debe tener al menos 8 caracteres.")
});

type LoginErrores = Partial<Record<keyof z.infer<typeof loginSchema> | "general", string>>;

export default function LoginPage() {
  const router = useRouter();
  const [errores, setErrores] = useState<LoginErrores>({});
  const [cargando, setCargando] = useState(false);

  async function enviarFormulario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const valores = {
      correo: String(formData.get("correo") ?? ""),
      contrasena: String(formData.get("contrasena") ?? "")
    };
    const validacion = loginSchema.safeParse(valores);

    if (!validacion.success) {
      setErrores(Object.fromEntries(validacion.error.issues.map((issue) => [issue.path[0], issue.message])));
      return;
    }

    try {
      setErrores({});
      setCargando(true);
      await loginStaff(validacion.data);
      router.push("/");
    } catch {
      setErrores({ general: "No pudimos iniciar sesion con esas credenciales." });
    } finally {
      setCargando(false);
    }
  }

  async function entrarConGoogleMock() {
    try {
      setErrores({});
      setCargando(true);
      await loginGoogleStaff({
        correo: "staff@vetexpert.local",
        nombre: "Staff VetExpert"
      });
      router.push("/");
    } catch {
      setErrores({ general: "Google staff esta preparado. Configura un staff real para activarlo." });
    } finally {
      setCargando(false);
    }
  }

  return (
    <AuthShell titulo="Ingreso staff" descripcion="Accede con tu correo institucional y contrasena.">
      <GlobalLoader visible={cargando} texto="Cargando..." />
      <form className="space-y-4" onSubmit={enviarFormulario}>
        <Input
          autoComplete="email"
          error={errores.correo}
          label="Correo"
          name="correo"
          placeholder="staff@vetexpert.pe"
          type="email"
        />
        <PasswordInput
          error={errores.contrasena}
          label="Contrasena"
          name="contrasena"
          placeholder="Ingresa tu contrasena"
        />
        {errores.general ? <p className="text-sm font-medium text-red-600">{errores.general}</p> : null}
        <Button className="w-full" type="submit">
          Ingresar
        </Button>
      </form>
      <div className="mt-4 grid gap-3">
        <Button className="w-full" type="button" variant="secondary" onClick={entrarConGoogleMock}>
          Google staff
        </Button>
        <div className="flex flex-wrap justify-between gap-3 text-sm">
          <Link className="font-semibold text-primario hover:underline" href="/recuperar">
            Recuperar contrasena
          </Link>
          <Link className="font-semibold text-primario hover:underline" href="/registro">
            Crear cuenta cliente
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
