"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { obtenerUsuarioSesion } from "@/services/auth";
import {
  cerrarHistoriaClinica,
  listarHistoriasPorMascota,
  reabrirHistoriaClinica,
  type HistoriaClinica
} from "@/services/historias-clinicas";
import { HistoriaClinicaDetalleDrawer } from "./HistoriaClinicaDetalleDrawer";
import { HistoriaClinicaEmptyState } from "./HistoriaClinicaEmptyState";
import { HistoriaClinicaModal } from "./HistoriaClinicaModal";
import { HistoriaClinicaSkeleton } from "./HistoriaClinicaSkeleton";
import { HistoriaClinicaTimelineItem } from "./HistoriaClinicaTimelineItem";

type Toast = { tipo: "exito" | "error"; mensaje: string };
type UsuarioSesion = NonNullable<ReturnType<typeof obtenerUsuarioSesion>>;

type HistoriaClinicaTimelineProps = {
  citaIdParaCrear?: string;
  mascotaId: string;
  notificar?: (toast: Toast) => void;
};

export function HistoriaClinicaTimeline({ citaIdParaCrear, mascotaId, notificar }: HistoriaClinicaTimelineProps) {
  const [historias, setHistorias] = useState<HistoriaClinica[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState<{ modo: "crear" | "editar"; historia?: HistoriaClinica }>();
  const [detalle, setDetalle] = useState<HistoriaClinica>();
  const [usuario, setUsuario] = useState<UsuarioSesion>();
  const puedeEscribir = usuario?.rol === "ADMIN" || usuario?.rol === "VETERINARIO";
  const puedeCrear = puedeEscribir && Boolean(citaIdParaCrear);

  const historiasOrdenadas = useMemo(
    () => [...historias].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()),
    [historias]
  );

  useEffect(() => {
    setUsuario(obtenerUsuarioSesion());
  }, []);

  useEffect(() => {
    void cargarHistorias();
  }, [mascotaId]);

  async function cargarHistorias() {
    try {
      setCargando(true);
      const respuesta = await listarHistoriasPorMascota(mascotaId);
      setHistorias(respuesta.datos);
    } catch {
      notificar?.({ tipo: "error", mensaje: "No pudimos cargar las historias clinicas." });
    } finally {
      setCargando(false);
    }
  }

  async function cerrarHistoria(historia: HistoriaClinica) {
    try {
      await cerrarHistoriaClinica(historia.id);
      notificar?.({ tipo: "exito", mensaje: "Historia clinica cerrada." });
      await cargarHistorias();
    } catch {
      notificar?.({ tipo: "error", mensaje: "No pudimos cerrar la historia clinica." });
    }
  }

  async function reabrirHistoria(historia: HistoriaClinica) {
    try {
      await reabrirHistoriaClinica(historia.id);
      notificar?.({ tipo: "exito", mensaje: "Historia clinica reabierta." });
      await cargarHistorias();
    } catch {
      notificar?.({ tipo: "error", mensaje: "No pudimos reabrir la historia clinica." });
    }
  }

  return (
    <section className="rounded-md border border-borde bg-superficie p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-bold">Historia clinica</h3>
          <p className="mt-1 text-sm text-texto/60">Linea de tiempo medica ordenada por atenciones registradas.</p>
        </div>
        {puedeCrear ? (
          <Button size="sm" type="button" onClick={() => setModal({ modo: "crear" })}>
            <Plus className="h-4 w-4" />
            Nueva historia
          </Button>
        ) : null}
      </div>

      {cargando ? (
        <HistoriaClinicaSkeleton />
      ) : historiasOrdenadas.length ? (
        <div className="relative space-y-3 md:ml-3 md:border-l md:border-borde md:pl-5">
          {historiasOrdenadas.map((historia, index) => (
            <motion.div key={historia.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
              <HistoriaClinicaTimelineItem
                historia={historia}
                puedeCerrar={puedeEscribir && !historia.cerrada}
                puedeEditar={puedeEscribir && !historia.cerrada}
                puedeReabrir={usuario?.rol === "ADMIN" && historia.cerrada}
                onCerrar={cerrarHistoria}
                onEditar={(historiaSeleccionada) => setModal({ modo: "editar", historia: historiaSeleccionada })}
                onReabrir={reabrirHistoria}
                onVerDetalle={setDetalle}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <HistoriaClinicaEmptyState />
      )}

      <AnimatePresence>
        {modal ? (
          <HistoriaClinicaModal
            citaId={citaIdParaCrear}
            historia={modal.historia}
            modo={modal.modo}
            cerrar={() => setModal(undefined)}
            guardado={async () => {
              setModal(undefined);
              notificar?.({ tipo: "exito", mensaje: modal.modo === "crear" ? "Historia clinica creada." : "Historia clinica actualizada." });
              await cargarHistorias();
            }}
          />
        ) : null}
        {detalle ? <HistoriaClinicaDetalleDrawer historia={detalle} cerrar={() => setDetalle(undefined)} /> : null}
      </AnimatePresence>
    </section>
  );
}
