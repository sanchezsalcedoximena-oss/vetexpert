"use client";

import { motion } from "framer-motion";
import { CalendarClock, Stethoscope, X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import type { HistoriaClinica } from "@/services/historias-clinicas";
import { HistoriaClinicaBadge } from "./HistoriaClinicaBadge";

type HistoriaClinicaDetalleDrawerProps = {
  cerrar: () => void;
  historia: HistoriaClinica;
};

export function HistoriaClinicaDetalleDrawer({ cerrar, historia }: HistoriaClinicaDetalleDrawerProps) {
  return (
    <motion.div className="fixed inset-0 z-50 flex justify-end bg-slate-950/55" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.aside className="h-full w-full max-w-lg overflow-y-auto bg-superficie p-5" initial={{ x: 480 }} animate={{ x: 0 }} exit={{ x: 480 }}>
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Detalle historia clinica</h2>
            <p className="mt-1 text-sm text-texto/60">{formatearFecha(historia.fecha)}</p>
          </div>
          <Button aria-label="Cerrar" size="icon" type="button" variant="ghost" onClick={cerrar}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-4 text-sm">
          <div className="flex items-center gap-3 rounded-md border border-borde bg-fondo p-4">
            <Stethoscope className="h-8 w-8 text-primario" />
            <div>
              <p className="text-lg font-bold">{historia.mascota.nombre}</p>
              <p className="text-sm text-texto/60">{historia.mascota.raza ?? historia.mascota.especie}</p>
              <div className="mt-2">
                <HistoriaClinicaBadge cerrada={historia.cerrada} />
              </div>
            </div>
          </div>

          <DetalleItem label="Fecha de atencion" value={formatearFecha(historia.fecha)} icono={<CalendarClock className="h-4 w-4 text-primario" />} />
          <DetalleItem label="Veterinario" value={`${historia.veterinario.nombres} ${historia.veterinario.apellidos}`} />
          <DetalleItem label="Correo veterinario" value={historia.veterinario.correo} />
          <DetalleItem label="Dueno" value={`${historia.cita.cliente.nombres} ${historia.cita.cliente.apellidos}`} />
          <DetalleItem label="Celular dueno" value={historia.cita.cliente.celular ?? "-"} />
          <DetalleItem label="Cita origen" value={`${formatearFecha(historia.cita.fecha)} - ${historia.cita.motivo}`} />
          <DetalleTexto label="Diagnostico" value={historia.diagnostico} />
          <DetalleTexto label="Tratamiento" value={historia.tratamiento} />
          <DetalleTexto label="Observaciones" value={historia.observaciones ?? "-"} />
        </div>
      </motion.aside>
    </motion.div>
  );
}

function DetalleItem({ icono, label, value }: { icono?: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-md border border-borde bg-fondo p-3">
      <div className="flex items-center gap-2">
        {icono}
        <p className="text-xs font-bold uppercase text-texto/45">{label}</p>
      </div>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

function DetalleTexto({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-borde bg-fondo p-3">
      <p className="text-xs font-bold uppercase text-texto/45">{label}</p>
      <p className="mt-2 whitespace-pre-wrap leading-6 text-texto/78">{value}</p>
    </div>
  );
}

function formatearFecha(fecha: string) {
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(fecha));
}
