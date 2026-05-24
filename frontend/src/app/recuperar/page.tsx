"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { z } from "zod";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { GlobalLoader } from "@/components/ui/GlobalLoader";
import { Input } from "@/components/ui/Input";
import { recuperarContrasena } from "@/services/auth";
import { correoSchema } from "@/validators/peru";

const recuperarSchema = z.object({
  correo: correoSchema
});

export default function RecuperarPage() {
  const [error, setError] = useState<string>();
  const [mensaje, setMensaje] = useState<string>();
  const [cargando, setCargando] = useState(false);

  async function enviarFormulario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const validacion = recuperarSchema.safeParse({
      correo: String(formData.get("correo") ?? "")
    });

    if (!validacion.success) {
      setError(validacion.error.issues[0]?.message);
      return;
    }

    try {
      setError(undefined);
      setMensaje(undefined);
      setCargando(true);
      const respuesta = await recuperarContrasena(validacion.data);
      setMensaje(respuesta.mensaje);
    } catch {
      setError("No pudimos procesar la solicitud.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <AuthShell titulo="Recuperar contrasena" descripcion="Te enviaremos instrucciones si el correo esta registrado.">
      <GlobalLoader visible={cargando} texto="Cargando..." />
      <form className="space-y-4" onSubmit={enviarFormulario}>
        <Input
          autoComplete="email"
          error={error}
          label="Correo"
          name="correo"
          placeholder="tu-correo@correo.com"
          type="email"
        />
        {mensaje ? <p className="text-sm font-medium text-exito">{mensaje}</p> : null}
        <Button className="w-full" type="submit">
          Enviar instrucciones
        </Button>
      </form>
      <Link className="mt-4 inline-block text-sm font-semibold text-primario hover:underline" href="/staff/login">
        Volver al login
      </Link>
    </AuthShell>
  );
}
