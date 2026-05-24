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
import { loginCliente, loginGoogleStaff, loginStaff } from "@/services/auth";
import { useAuthStore } from "@/store/auth-store";
import { correoSchema } from "@/validators/peru";

const loginSchema = z.object({
  correo: correoSchema,
  contrasena: z.string().min(8, "La contrasena debe tener al menos 8 caracteres.")
});

type TipoAcceso = "staff" | "cliente";
type LoginErrores = Partial<Record<keyof z.infer<typeof loginSchema> | "general", string>>;

export function AccesoForm({ tipo }: { tipo: TipoAcceso }) {
  const router = useRouter();
  const establecerSesion = useAuthStore((state) => state.establecerSesion);
  const [errores, setErrores] = useState<LoginErrores>({});
  const [cargando, setCargando] = useState(false);
  const esStaff = tipo === "staff";

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
      const sesion = esStaff ? await loginStaff(validacion.data) : await loginCliente(validacion.data);
      establecerSesion(sesion);
      router.push("/dashboard");
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
      const sesion = await loginGoogleStaff({
        correo: "staff@vetexpert.local",
        nombre: "Staff VetExpert"
      });
      establecerSesion(sesion);
      router.push("/dashboard");
    } catch {
      setErrores({ general: "Google staff esta preparado. Configura un staff real para activarlo." });
    } finally {
      setCargando(false);
    }
  }

  return (
    <AuthShell
      titulo={esStaff ? "Acceso staff" : "Portal cliente"}
      descripcion={
        esStaff
          ? "Ingresa al panel interno con tu cuenta autorizada."
          : "Accede a tu portal para consultar la informacion de tus mascotas."
      }
    >
      <GlobalLoader visible={cargando} texto="Cargando sistema..." />
      <form className="space-y-4" onSubmit={enviarFormulario}>
        <Input
          autoComplete="email"
          error={errores.correo}
          label="Correo"
          name="correo"
          placeholder={esStaff ? "staff@vetexpert.pe" : "cliente@correo.com"}
          type="email"
        />
        <PasswordInput error={errores.contrasena} label="Contrasena" name="contrasena" placeholder="Tu contrasena" />
        {errores.general ? <p className="text-sm font-medium text-red-600">{errores.general}</p> : null}
        <Button className="w-full" type="submit">
          Ingresar
        </Button>
      </form>
      <div className="mt-4 grid gap-3">
        {esStaff ? (
          <Button className="w-full" type="button" variant="secondary" onClick={entrarConGoogleMock}>
            Google staff
          </Button>
        ) : null}
        <div className="flex flex-wrap justify-between gap-3 text-sm">
          <Link className="font-semibold text-primario hover:underline" href="/recuperar">
            Recuperar contrasena
          </Link>
          <Link className="font-semibold text-primario hover:underline" href={esStaff ? "/portal/login" : "/portal/registro"}>
            {esStaff ? "Soy cliente" : "Crear cuenta"}
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
