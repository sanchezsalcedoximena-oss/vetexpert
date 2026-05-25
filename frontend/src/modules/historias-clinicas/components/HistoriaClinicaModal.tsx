"use client";

import { motion } from "framer-motion";
import { Check, Loader2, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  actualizarHistoriaClinica,
  crearHistoriaDesdeCita,
  type HistoriaClinica,
  type HistoriaClinicaPayload
} from "@/services/historias-clinicas";

const historiaSchema = z.object({
  diagnostico: z.string().min(3, "El diagnostico debe tener al menos 3 caracteres.").max(2000, "El diagnostico no debe superar 2000 caracteres."),
  tratamiento: z.string().min(3, "El tratamiento debe tener al menos 3 caracteres.").max(2000, "El tratamiento no debe superar 2000 caracteres."),
  observaciones: z.string().max(3000, "Las observaciones no deben superar 3000 caracteres.").optional(),
  cerrada: z.boolean()
});

type FormErrores = Partial<Record<keyof z.infer<typeof historiaSchema> | "general", string>>;

type HistoriaClinicaModalProps = {
  citaId?: string;
  cerrar: () => void;
  guardado: (historia: HistoriaClinica) => Promise<void> | void;
  historia?: HistoriaClinica;
  modo: "crear" | "editar";
};

export function HistoriaClinicaModal({ cerrar, citaId, guardado, historia, modo }: HistoriaClinicaModalProps) {
  const [errores, setErrores] = useState<FormErrores>({});
  const [guardando, setGuardando] = useState(false);

  async function enviarFormulario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const validacion = historiaSchema.safeParse({
      diagnostico: String(formData.get("diagnostico") ?? ""),
      tratamiento: String(formData.get("tratamiento") ?? ""),
      observaciones: String(formData.get("observaciones") ?? "") || undefined,
      cerrada: formData.get("cerrada") === "on"
    });

    if (!validacion.success) {
      setErrores(Object.fromEntries(validacion.error.issues.map((issue) => [issue.path[0], issue.message])));
      return;
    }

    if (modo === "crear" && !citaId) {
      setErrores({ general: "Selecciona una cita completada para crear la historia clinica." });
      return;
    }

    try {
      setErrores({});
      setGuardando(true);
      const payload: HistoriaClinicaPayload = {
        diagnostico: validacion.data.diagnostico,
        tratamiento: validacion.data.tratamiento,
        observaciones: validacion.data.observaciones || undefined,
        cerrada: validacion.data.cerrada
      };

      const respuesta =
        modo === "crear" && citaId
          ? await crearHistoriaDesdeCita(citaId, payload)
          : await actualizarHistoriaClinica(historia?.id ?? "", {
              diagnostico: payload.diagnostico,
              tratamiento: payload.tratamiento,
              observaciones: payload.observaciones
            });

      await guardado(respuesta);
    } catch {
      setErrores({ general: "No pudimos guardar la historia clinica. Verifica los datos y permisos." });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <motion.div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.form
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-md border border-borde bg-superficie p-5 shadow-xl"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        onSubmit={enviarFormulario}
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">{modo === "crear" ? "Nueva historia clinica" : "Editar historia clinica"}</h2>
            <p className="text-sm text-texto/60">Registra diagnostico, tratamiento y observaciones de la atencion.</p>
          </div>
          <Button aria-label="Cerrar" size="icon" type="button" variant="ghost" onClick={cerrar}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-4">
          <TextareaField defaultValue={historia?.diagnostico ?? ""} error={errores.diagnostico} label="Diagnostico" name="diagnostico" />
          <TextareaField defaultValue={historia?.tratamiento ?? ""} error={errores.tratamiento} label="Tratamiento" name="tratamiento" />
          <TextareaField defaultValue={historia?.observaciones ?? ""} error={errores.observaciones} label="Observaciones" name="observaciones" />
          {modo === "crear" ? (
            <label className="flex items-center gap-3 rounded-md border border-borde bg-fondo px-3 py-3 text-sm font-semibold">
              <input defaultChecked={historia?.cerrada ?? false} name="cerrada" type="checkbox" />
              Crear como historia cerrada
            </label>
          ) : null}
        </div>

        {errores.general ? <p className="mt-4 text-sm font-semibold text-red-600">{errores.general}</p> : null}
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={cerrar}>
            Cancelar
          </Button>
          <Button disabled={guardando} type="submit">
            {guardando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Guardar
          </Button>
        </div>
      </motion.form>
    </motion.div>
  );
}

function TextareaField({ defaultValue, error, label, name }: { defaultValue?: string; error?: string; label: string; name: string }) {
  return (
    <div>
      <label className="text-xs font-semibold text-texto/60">{label}</label>
      <textarea
        name={name}
        defaultValue={defaultValue}
        className={cn(
          "mt-1 min-h-[112px] w-full rounded-md border border-borde bg-fondo p-3 text-sm outline-none transition focus:border-primario focus:ring-2 focus:ring-primario/18",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/18"
        )}
      />
      {error ? <p className="mt-1 text-xs font-semibold text-red-600">{error}</p> : null}
    </div>
  );
}
