"use client";

import { Loader2, Send } from "lucide-react";
import { FormEvent, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { construirUrlWhatsappContacto } from "@/services/contacto";
import { celularPeruSchema, correoSchema } from "@/validators/peru";
import { cn } from "@/lib/utils";

const contactoSchema = z.object({
  nombres: z.string().min(2, "Ingresa tus nombres.").max(100, "Maximo 100 caracteres."),
  correo: correoSchema,
  celular: z.union([celularPeruSchema, z.literal("")]).optional(),
  asunto: z.string().min(3, "Ingresa un asunto.").max(120, "Maximo 120 caracteres."),
  mensaje: z.string().min(10, "Cuentanos un poco mas.").max(800, "Maximo 800 caracteres.")
});

type ContactoErrores = Partial<Record<keyof z.infer<typeof contactoSchema> | "general", string>>;

export function ContactForm() {
  const [errores, setErrores] = useState<ContactoErrores>({});
  const [estado, setEstado] = useState<"inicial" | "abriendo">("inicial");

  async function enviarFormulario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const valores = {
      nombres: String(formData.get("nombres") ?? ""),
      correo: String(formData.get("correo") ?? ""),
      celular: String(formData.get("celular") ?? ""),
      asunto: String(formData.get("asunto") ?? ""),
      mensaje: String(formData.get("mensaje") ?? "")
    };
    const validacion = contactoSchema.safeParse(valores);

    if (!validacion.success) {
      setErrores(Object.fromEntries(validacion.error.issues.map((issue) => [issue.path[0], issue.message])));
      setEstado("inicial");
      return;
    }

    setErrores({});
    setEstado("abriendo");
    const whatsappUrl = construirUrlWhatsappContacto({
      ...validacion.data,
      celular: validacion.data.celular || undefined
    });

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    form.reset();
    setEstado("inicial");
  }

  return (
    <form className="rounded-md border border-borde bg-fondo p-4 sm:p-6" onSubmit={enviarFormulario}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input error={errores.nombres} label="Nombres" name="nombres" placeholder="Tu nombre" />
        <Input error={errores.celular} inputMode="numeric" label="Celular" name="celular" placeholder="987654321" />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Input error={errores.correo} label="Correo" name="correo" placeholder="tu@correo.com" type="email" />
        <Input error={errores.asunto} label="Asunto" name="asunto" placeholder="Consulta preventiva" />
      </div>
      <label className="mt-4 block" htmlFor="mensaje">
        <span className="mb-1.5 block text-sm font-medium text-texto/78">Mensaje</span>
        <textarea
          className={cn(
            "min-h-32 w-full resize-none rounded-md border border-borde bg-superficie px-3 py-3 text-sm text-texto outline-none transition placeholder:text-texto/38 focus:border-primario focus:ring-2 focus:ring-primario/18",
            errores.mensaje && "border-red-500 focus:border-red-500 focus:ring-red-500/18"
          )}
          id="mensaje"
          name="mensaje"
          placeholder="Cuentanos que necesita tu mascota"
        />
        {errores.mensaje ? <span className="mt-1.5 block text-xs font-medium text-red-600">{errores.mensaje}</span> : null}
      </label>
      {errores.general ? <p className="mt-4 text-sm font-semibold text-red-600">{errores.general}</p> : null}
      <Button className="mt-5 w-full" disabled={estado === "abriendo"} type="submit">
        {estado === "abriendo" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Enviar mensaje
      </Button>
    </form>
  );
}
