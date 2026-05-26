"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CalendarClock, Check, Eye, FileText, Loader2, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import { HistoriaClinicaDetalleDrawer } from "@/modules/historias-clinicas/components/HistoriaClinicaDetalleDrawer";
import { HistoriaClinicaModal } from "@/modules/historias-clinicas/components/HistoriaClinicaModal";
import { obtenerUsuarioSesion } from "@/services/auth";
import { listarClientes, type Cliente } from "@/services/clientes";
import {
  actualizarCita,
  crearCita,
  eliminarCita,
  listarCitas,
  type Cita,
  type CitasMeta,
  type EstadoCita
} from "@/services/citas";
import { obtenerHistoriaClinica, type HistoriaClinica } from "@/services/historias-clinicas";
import { listarMascotas, type Mascota } from "@/services/mascotas";
import { listarVeterinarios, type Veterinario } from "@/services/usuarios";

const estadosCita: EstadoCita[] = ["PENDIENTE", "CONFIRMADA", "COMPLETADA", "CANCELADA"];

const citaSchema = z.object({
  fecha: z.string().min(1, "Selecciona fecha y hora.").refine((valor) => new Date(valor).getTime() >= Date.now(), {
    message: "La fecha de la cita no puede ser pasada."
  }),
  motivo: z.string().min(3, "El motivo debe tener al menos 3 caracteres.").max(200, "El motivo no debe superar 200 caracteres."),
  observaciones: z.string().max(1000, "Las observaciones no deben superar 1000 caracteres.").optional(),
  estado: z.enum(["PENDIENTE", "CONFIRMADA", "COMPLETADA", "CANCELADA"]),
  clienteId: z.string().uuid("Selecciona un cliente valido."),
  mascotaId: z.string().uuid("Selecciona una mascota valida."),
  veterinarioId: z.string().uuid("Selecciona un veterinario valido.")
});

const citaVeterinarioSchema = z.object({
  observaciones: z.string().max(1000, "Las observaciones no deben superar 1000 caracteres.").optional(),
  estado: z.enum(["COMPLETADA", "CANCELADA"])
});

type Toast = { tipo: "exito" | "error"; mensaje: string };
type FormErrores = Partial<Record<keyof z.infer<typeof citaSchema> | "general", string>>;
type UsuarioSesion = NonNullable<ReturnType<typeof obtenerUsuarioSesion>>;
type VeterinarioOption = { id: string; nombre: string; correo?: string };

const metaInicial: CitasMeta = {
  pagina: 1,
  limite: 10,
  total: 0,
  totalPaginas: 1
};

const EMOJIS_ESPECIE: Record<string, string> = {
  PERRO: "Dog",
  GATO: "Cat",
  AVE: "Bird",
  CONEJO: "Rabbit",
  HAMSTER: "Hamster",
  REPTIL: "Reptile",
  PEZ: "Fish",
  OTRO: "Pet"
};

export function CitasPage() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [meta, setMeta] = useState<CitasMeta>(metaInicial);
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState<EstadoCita | "">("");
  const [veterinarioId, setVeterinarioId] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [pagina, setPagina] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState<{ modo: "crear" | "editar"; cita?: Cita }>();
  const [modalHistoria, setModalHistoria] = useState<{ modo: "crear"; cita: Cita }>();
  const [detalle, setDetalle] = useState<Cita>();
  const [detalleHistoria, setDetalleHistoria] = useState<HistoriaClinica>();
  const [toast, setToast] = useState<Toast>();
  const [usuario, setUsuario] = useState<UsuarioSesion>();
  const [veterinarios, setVeterinarios] = useState<VeterinarioOption[]>([]);
  const [historiaCargandoId, setHistoriaCargandoId] = useState<string>();

  const busquedaNormalizada = useMemo(() => busqueda.trim(), [busqueda]);
  const puedeGestionar = usuario?.rol === "ADMIN" || usuario?.rol === "SECRETARIA";
  const puedeCrearHistoria = usuario?.rol === "ADMIN" || usuario?.rol === "VETERINARIO";

  useEffect(() => {
    setUsuario(obtenerUsuarioSesion());
    void cargarVeterinarios();
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void cargarCitas();
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [pagina, estado, veterinarioId, fechaInicio, fechaFin, busquedaNormalizada]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = window.setTimeout(() => setToast(undefined), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  async function cargarCitas() {
    try {
      setCargando(true);
      const respuesta = await listarCitas({
        pagina,
        limite: meta.limite,
        busqueda: busquedaNormalizada || undefined,
        estado: estado || undefined,
        veterinarioId: veterinarioId || undefined,
        fechaInicio: fechaInicio ? new Date(`${fechaInicio}T00:00:00`).toISOString() : undefined,
        fechaFin: fechaFin ? new Date(`${fechaFin}T23:59:59`).toISOString() : undefined
      });
      setCitas(respuesta.datos);
      setMeta(respuesta.meta);
    } catch {
      setToast({ tipo: "error", mensaje: "No pudimos cargar las citas." });
    } finally {
      setCargando(false);
    }
  }

  async function cargarVeterinarios() {
    try {
      const respuesta = await listarVeterinarios();
      setVeterinarios(mapearVeterinarios(respuesta));
    } catch {
      setToast({ tipo: "error", mensaje: "No pudimos cargar los veterinarios." });
    }
  }

  async function confirmarEliminar(cita: Cita) {
    const confirmado = window.confirm(`Eliminar la cita de ${cita.mascota.nombre}?`);

    if (!confirmado) {
      return;
    }

    try {
      await eliminarCita(cita.id);
      setToast({ tipo: "exito", mensaje: "Cita eliminada correctamente." });
      await cargarCitas();
    } catch {
      setToast({ tipo: "error", mensaje: "No pudimos eliminar la cita." });
    }
  }

  async function gestionarHistoria(cita: Cita) {
    if (historiaCargandoId) {
      return;
    }

    const historia = obtenerHistoriaActiva(cita);

    if (historia) {
      try {
        setHistoriaCargandoId(cita.id);
        const detalle = await obtenerHistoriaClinica(historia.id);
        setDetalleHistoria(detalle);
      } catch {
        setToast({ tipo: "error", mensaje: "No pudimos abrir la historia clinica." });
      } finally {
        setHistoriaCargandoId(undefined);
      }
      return;
    }

    if (cita.estado !== "COMPLETADA") {
      setToast({ tipo: "error", mensaje: "Solo una cita completada puede generar historia clinica." });
      return;
    }

    if (!puedeCrearHistoria) {
      setToast({ tipo: "error", mensaje: "No tienes permisos para crear historias clinicas." });
      return;
    }

    setModalHistoria({ modo: "crear", cita });
  }

  return (
    <div className="space-y-5">
      <ToastView toast={toast} />
      <section className="rounded-md border border-borde bg-superficie p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-bold">Gestion de citas</h2>
            <p className="mt-1 text-sm text-texto/60">Administra agenda, pacientes, duenos y estados de atencion.</p>
          </div>
          {puedeGestionar ? (
            <Button type="button" onClick={() => setModal({ modo: "crear" })}>
              <Plus className="h-4 w-4" />
              Nueva cita
            </Button>
          ) : null}
        </div>
        <div className="mt-5 grid gap-3 xl:grid-cols-[1fr_170px_220px_160px_160px]">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-texto/40" />
            <input
              className="h-11 w-full rounded-md border border-borde bg-fondo pl-10 pr-3 text-sm outline-none transition focus:border-primario focus:ring-2 focus:ring-primario/18"
              placeholder="Buscar por motivo, paciente, dueno o veterinario"
              value={busqueda}
              onChange={(event) => {
                setPagina(1);
                setBusqueda(event.target.value);
              }}
            />
          </div>
          <select
            className="h-11 rounded-md border border-borde bg-fondo px-3 text-sm outline-none transition focus:border-primario focus:ring-2 focus:ring-primario/18"
            value={estado}
            onChange={(event) => {
              setPagina(1);
              setEstado(event.target.value as EstadoCita | "");
            }}
          >
            <option value="">Todos los estados</option>
            {estadosCita.map((valor) => (
              <option key={valor} value={valor}>
                {formatearEstado(valor)}
              </option>
            ))}
          </select>
          <select
            className="h-11 rounded-md border border-borde bg-fondo px-3 text-sm outline-none transition focus:border-primario focus:ring-2 focus:ring-primario/18"
            value={veterinarioId}
            onChange={(event) => {
              setPagina(1);
              setVeterinarioId(event.target.value);
            }}
            disabled={usuario?.rol === "VETERINARIO"}
          >
            <option value="">Todos los veterinarios</option>
            {veterinarios.map((veterinario) => (
              <option key={veterinario.id} value={veterinario.id}>
                {veterinario.nombre}
              </option>
            ))}
          </select>
          <input
            className="h-11 rounded-md border border-borde bg-fondo px-3 text-sm outline-none transition focus:border-primario focus:ring-2 focus:ring-primario/18"
            type="date"
            value={fechaInicio}
            onChange={(event) => {
              setPagina(1);
              setFechaInicio(event.target.value);
            }}
          />
          <input
            className="h-11 rounded-md border border-borde bg-fondo px-3 text-sm outline-none transition focus:border-primario focus:ring-2 focus:ring-primario/18"
            type="date"
            value={fechaFin}
            onChange={(event) => {
              setPagina(1);
              setFechaFin(event.target.value);
            }}
          />
        </div>
      </section>

      <CitasTable
        cargando={cargando}
        citas={citas}
        editar={(cita) => setModal({ modo: "editar", cita })}
        eliminar={confirmarEliminar}
        gestionarHistoria={gestionarHistoria}
        historiaCargandoId={historiaCargandoId}
        puedeEliminar={puedeGestionar}
        puedeCrearHistoria={puedeCrearHistoria}
        verDetalle={setDetalle}
      />

      <div className="flex flex-col gap-3 rounded-md border border-borde bg-superficie p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-texto/60">
          {meta.total} citas - pagina {meta.pagina} de {meta.totalPaginas}
        </p>
        <div className="flex gap-2">
          <Button disabled={pagina <= 1 || cargando} type="button" variant="ghost" onClick={() => setPagina((valor) => Math.max(1, valor - 1))}>
            Anterior
          </Button>
          <Button disabled={pagina >= meta.totalPaginas || cargando} type="button" variant="ghost" onClick={() => setPagina((valor) => valor + 1)}>
            Siguiente
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {modal ? (
          <CitaModal
            cita={modal.cita}
            modo={modal.modo}
            usuario={usuario}
            veterinarios={veterinarios}
            cerrar={() => setModal(undefined)}
            guardado={async () => {
              setModal(undefined);
              setToast({ tipo: "exito", mensaje: modal.modo === "crear" ? "Cita creada." : "Cita actualizada." });
              await cargarCitas();
            }}
          />
        ) : null}
        {detalle ? <DetalleCita cita={detalle} cerrar={() => setDetalle(undefined)} gestionarHistoria={gestionarHistoria} historiaCargandoId={historiaCargandoId} puedeCrearHistoria={puedeCrearHistoria} /> : null}
        {modalHistoria ? (
          <HistoriaClinicaModal
            citaId={modalHistoria.cita.id}
            modo="crear"
            cerrar={() => setModalHistoria(undefined)}
            guardado={async (historia) => {
              setModalHistoria(undefined);
              setDetalle(undefined);
              setDetalleHistoria(historia);
              setToast({ tipo: "exito", mensaje: "Historia clinica creada." });
              await cargarCitas();
            }}
          />
        ) : null}
        {detalleHistoria ? <HistoriaClinicaDetalleDrawer historia={detalleHistoria} cerrar={() => setDetalleHistoria(undefined)} /> : null}
      </AnimatePresence>
    </div>
  );
}

function CitasTable({
  cargando,
  citas,
  editar,
  eliminar,
  gestionarHistoria,
  historiaCargandoId,
  puedeCrearHistoria,
  puedeEliminar,
  verDetalle
}: {
  cargando: boolean;
  citas: Cita[];
  editar: (cita: Cita) => void;
  eliminar: (cita: Cita) => void;
  gestionarHistoria: (cita: Cita) => void;
  historiaCargandoId?: string;
  puedeCrearHistoria: boolean;
  puedeEliminar: boolean;
  verDetalle: (cita: Cita) => void;
}) {
  if (cargando) {
    return (
      <div className="rounded-md border border-borde bg-superficie p-4">
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!citas.length) {
    return (
      <div className="rounded-md border border-borde bg-superficie p-8 text-center">
        <h3 className="text-lg font-bold">Sin citas</h3>
        <p className="mt-2 text-sm text-texto/60">Ajusta la busqueda o agenda la primera cita.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-borde bg-superficie">
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[980px] border-collapse text-left text-sm">
          <thead className="bg-fondo text-xs uppercase text-texto/55">
            <tr>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Paciente</th>
              <th className="px-4 py-3">Dueno</th>
              <th className="px-4 py-3">Veterinario</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {citas.map((cita) => (
              <tr key={cita.id} className="border-t border-borde">
                <td className="px-4 py-3">
                  <p className="font-bold">{formatearFecha(cita.fecha)}</p>
                  <p className="text-xs text-texto/55">{cita.motivo}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold">{cita.mascota.nombre}</p>
                  <p className="text-xs text-texto/55">{EMOJIS_ESPECIE[cita.mascota.especie] ?? "Pet"} - {cita.mascota.raza ?? cita.mascota.especie}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold">{cita.cliente.nombres} {cita.cliente.apellidos}</p>
                  <p className="text-xs text-texto/55">{cita.cliente.celular ?? "Sin celular"}</p>
                </td>
                <td className="px-4 py-3">{cita.veterinario.nombres} {cita.veterinario.apellidos}</td>
                <td className="px-4 py-3">
                  <EstadoCitaBadge estado={cita.estado} />
                  {cita.estado === "COMPLETADA" ? (
                    <p className="mt-2">
                      <HistoriaCitaBadge cita={cita} />
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <Acciones
                    cita={cita}
                    editar={editar}
                    eliminar={eliminar}
                    gestionarHistoria={gestionarHistoria}
                    historiaCargandoId={historiaCargandoId}
                    puedeCrearHistoria={puedeCrearHistoria}
                    puedeEliminar={puedeEliminar}
                    verDetalle={verDetalle}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 p-3 lg:hidden">
        {citas.map((cita) => (
          <article key={cita.id} className="rounded-md border border-borde bg-fondo p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold">{cita.mascota.nombre}</h3>
                <p className="mt-1 text-sm text-texto/60">{formatearFecha(cita.fecha)}</p>
              </div>
              <EstadoCitaBadge estado={cita.estado} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <p><span className="text-texto/50">Dueno</span><br />{cita.cliente.nombres} {cita.cliente.apellidos}</p>
              <p><span className="text-texto/50">Veterinario</span><br />{cita.veterinario.nombres} {cita.veterinario.apellidos}</p>
            </div>
            <p className="mt-3 text-sm text-texto/70">{cita.motivo}</p>
            {cita.estado === "COMPLETADA" ? (
              <p className="mt-3">
                <HistoriaCitaBadge cita={cita} />
              </p>
            ) : null}
            <div className="mt-4">
              <Acciones
                cita={cita}
                editar={editar}
                eliminar={eliminar}
                gestionarHistoria={gestionarHistoria}
                historiaCargandoId={historiaCargandoId}
                puedeCrearHistoria={puedeCrearHistoria}
                puedeEliminar={puedeEliminar}
                verDetalle={verDetalle}
              />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function Acciones({
  cita,
  editar,
  eliminar,
  gestionarHistoria,
  historiaCargandoId,
  puedeCrearHistoria,
  puedeEliminar,
  verDetalle
}: {
  cita: Cita;
  editar: (cita: Cita) => void;
  eliminar: (cita: Cita) => void;
  gestionarHistoria: (cita: Cita) => void;
  historiaCargandoId?: string;
  puedeCrearHistoria: boolean;
  puedeEliminar: boolean;
  verDetalle: (cita: Cita) => void;
}) {
  const historia = obtenerHistoriaActiva(cita);
  const tieneHistoriaAnulada = Boolean(cita.historiaClinica?.eliminadoEn);
  const puedeMostrarHistoria = cita.estado === "COMPLETADA" && (Boolean(historia) || (puedeCrearHistoria && !tieneHistoriaAnulada));

  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Button aria-label="Ver detalle" size="icon" title="Ver detalle" type="button" variant="ghost" onClick={() => verDetalle(cita)}>
        <Eye className="h-4 w-4" />
      </Button>
      {puedeMostrarHistoria ? (
        <Button
          aria-label={historia ? "Ver historia clinica" : "Crear historia clinica"}
          disabled={Boolean(historiaCargandoId)}
          size="icon"
          title={historia ? "Ver historia clinica" : "Crear historia clinica"}
          type="button"
          variant="ghost"
          onClick={() => gestionarHistoria(cita)}
        >
          {historiaCargandoId === cita.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
        </Button>
      ) : null}
      <Button aria-label="Editar" size="icon" title="Editar" type="button" variant="ghost" onClick={() => editar(cita)}>
        <Pencil className="h-4 w-4" />
      </Button>
      {puedeEliminar ? (
        <Button aria-label="Eliminar" className="text-red-600 hover:bg-red-500/10" size="icon" title="Eliminar" type="button" variant="ghost" onClick={() => eliminar(cita)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );
}

function CitaModal({
  cerrar,
  cita,
  guardado,
  modo,
  usuario,
  veterinarios
}: {
  cerrar: () => void;
  cita?: Cita;
  guardado: () => Promise<void>;
  modo: "crear" | "editar";
  usuario?: UsuarioSesion;
  veterinarios: VeterinarioOption[];
}) {
  const esVeterinario = usuario?.rol === "VETERINARIO";
  const [errores, setErrores] = useState<FormErrores>({});
  const [guardando, setGuardando] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Pick<Cliente, "id" | "nombres" | "apellidos" | "dni"> | null>(
    cita
      ? {
          id: cita.clienteId,
          nombres: cita.cliente.nombres,
          apellidos: cita.cliente.apellidos,
          dni: cita.cliente.dni
        }
      : null
  );
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargandoClientes, setCargandoClientes] = useState(false);
  const [mostrarClientes, setMostrarClientes] = useState(false);
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [cargandoMascotas, setCargandoMascotas] = useState(false);
  const [mascotaId, setMascotaId] = useState(cita?.mascotaId ?? "");
  const [veterinarioId, setVeterinarioId] = useState(cita?.veterinarioId ?? "");

  useEffect(() => {
    if (!mostrarClientes) {
      return;
    }

    const timer = window.setTimeout(() => {
      void cargarClientes(busquedaCliente);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [busquedaCliente, mostrarClientes]);

  useEffect(() => {
    if (!clienteSeleccionado) {
      setMascotas([]);
      setMascotaId("");
      return;
    }

    void cargarMascotas(clienteSeleccionado.id);
  }, [clienteSeleccionado?.id]);

  async function cargarClientes(search: string) {
    try {
      setCargandoClientes(true);
      const res = await listarClientes({
        pagina: 1,
        limite: 50,
        estado: "activos",
        busqueda: search || undefined
      });
      setClientes(res.datos);
    } finally {
      setCargandoClientes(false);
    }
  }

  async function cargarMascotas(clienteId: string) {
    try {
      setCargandoMascotas(true);
      const res = await listarMascotas({
        pagina: 1,
        limite: 50,
        estado: "activos",
        clienteId
      });
      setMascotas(res.datos);
    } finally {
      setCargandoMascotas(false);
    }
  }

  async function enviarFormulario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    if (esVeterinario && modo === "editar") {
      await enviarFormularioVeterinario(formData);
      return;
    }

    const validacion = citaSchema.safeParse({
      fecha: String(formData.get("fecha") ?? ""),
      motivo: String(formData.get("motivo") ?? ""),
      observaciones: String(formData.get("observaciones") ?? "") || undefined,
      estado: String(formData.get("estado") ?? "PENDIENTE"),
      clienteId: String(formData.get("clienteId") ?? ""),
      mascotaId: String(formData.get("mascotaId") ?? ""),
      veterinarioId: String(formData.get("veterinarioId") ?? "")
    });

    if (!validacion.success) {
      setErrores(Object.fromEntries(validacion.error.issues.map((issue) => [issue.path[0], issue.message])));
      return;
    }

    try {
      setErrores({});
      setGuardando(true);
      const payload = {
        fecha: new Date(validacion.data.fecha).toISOString(),
        motivo: validacion.data.motivo,
        observaciones: validacion.data.observaciones || undefined,
        estado: validacion.data.estado,
        mascotaId: validacion.data.mascotaId,
        veterinarioId: validacion.data.veterinarioId
      };

      if (modo === "crear") {
        await crearCita(payload);
      } else if (cita) {
        await actualizarCita(cita.id, payload);
      }

      await guardado();
    } catch {
      setErrores({ general: "No pudimos guardar la cita. Verifica disponibilidad y datos seleccionados." });
    } finally {
      setGuardando(false);
    }
  }

  async function enviarFormularioVeterinario(formData: FormData) {
    const validacion = citaVeterinarioSchema.safeParse({
      observaciones: String(formData.get("observaciones") ?? "") || undefined,
      estado: String(formData.get("estado") ?? "COMPLETADA")
    });

    if (!validacion.success) {
      setErrores(Object.fromEntries(validacion.error.issues.map((issue) => [issue.path[0], issue.message])) as FormErrores);
      return;
    }

    try {
      setErrores({});
      setGuardando(true);
      if (cita) {
        await actualizarCita(cita.id, validacion.data);
      }
      await guardado();
    } catch {
      setErrores({ general: "No pudimos actualizar la cita." });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <motion.div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.form
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-md border border-borde bg-superficie p-5 shadow-xl"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        onSubmit={enviarFormulario}
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">{modo === "crear" ? "Nueva cita" : "Editar cita"}</h2>
            <p className="text-sm text-texto/60">Agenda paciente, veterinario y estado de atencion.</p>
          </div>
          <Button aria-label="Cerrar" size="icon" type="button" variant="ghost" onClick={cerrar}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {esVeterinario && modo === "editar" ? (
          <div className="grid gap-4">
            <DetalleItem label="Paciente" value={`${cita?.mascota.nombre ?? "-"} - ${formatearFecha(cita?.fecha ?? "")}`} />
            <div>
              <label className="text-xs font-semibold text-texto/60">Estado</label>
              <select name="estado" defaultValue={cita?.estado === "CANCELADA" ? "CANCELADA" : "COMPLETADA"} className="mt-1 h-11 w-full rounded-md border border-borde bg-fondo px-3 text-sm outline-none transition focus:border-primario focus:ring-2 focus:ring-primario/18">
                <option value="COMPLETADA">Completada</option>
                <option value="CANCELADA">Cancelada</option>
              </select>
              {errores.estado ? <p className="mt-1 text-xs font-semibold text-red-600">{errores.estado}</p> : null}
            </div>
            <TextareaField defaultValue={cita?.observaciones ?? ""} error={errores.observaciones} label="Observaciones" name="observaciones" />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input defaultValue={cita ? toDateTimeLocal(cita.fecha) : ""} error={errores.fecha} label="Fecha y hora" name="fecha" type="datetime-local" />
            <div>
              <label className="text-xs font-semibold text-texto/60">Estado</label>
              <select name="estado" defaultValue={cita?.estado ?? "PENDIENTE"} className="mt-1 h-11 w-full rounded-md border border-borde bg-fondo px-3 text-sm outline-none transition focus:border-primario focus:ring-2 focus:ring-primario/18">
                {estadosCita.map((valor) => (
                  <option key={valor} value={valor}>{formatearEstado(valor)}</option>
                ))}
              </select>
              {errores.estado ? <p className="mt-1 text-xs font-semibold text-red-600">{errores.estado}</p> : null}
            </div>
            <Input className="sm:col-span-2" defaultValue={cita?.motivo ?? ""} error={errores.motivo} label="Motivo" name="motivo" />

            <div className="relative">
              <label className="text-xs font-semibold text-texto/60">Cliente</label>
              <input
                className="mt-1 h-11 w-full rounded-md border border-borde bg-fondo px-3 text-sm outline-none transition focus:border-primario focus:ring-2 focus:ring-primario/18"
                placeholder="Buscar cliente por nombre o DNI"
                value={clienteSeleccionado ? `${clienteSeleccionado.nombres} ${clienteSeleccionado.apellidos} - ${clienteSeleccionado.dni ?? "Sin DNI"}` : busquedaCliente}
                onChange={(event) => {
                  setClienteSeleccionado(null);
                  setBusquedaCliente(event.target.value);
                  setMostrarClientes(true);
                }}
                onFocus={() => setMostrarClientes(true)}
              />
              <input name="clienteId" type="hidden" value={clienteSeleccionado?.id ?? ""} />
              {mostrarClientes ? (
                <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-borde bg-superficie shadow-lg">
                  {cargandoClientes ? (
                    <div className="flex items-center gap-2 p-3 text-sm text-texto/60">
                      <Loader2 className="h-4 w-4 animate-spin text-primario" />
                      Cargando clientes...
                    </div>
                  ) : clientes.length ? (
                    clientes.map((cliente) => (
                      <button
                        key={cliente.id}
                        type="button"
                        className="w-full px-3 py-2 text-left text-sm transition hover:bg-primario/10"
                        onClick={() => {
                          setClienteSeleccionado(cliente);
                          setMostrarClientes(false);
                        }}
                      >
                        {cliente.nombres} {cliente.apellidos} - {cliente.dni ?? "Sin DNI"}
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-sm text-texto/60">No se encontraron clientes activos.</div>
                  )}
                </div>
              ) : null}
              {errores.clienteId ? <p className="mt-1 text-xs font-semibold text-red-600">{errores.clienteId}</p> : null}
            </div>

            <div>
              <label className="text-xs font-semibold text-texto/60">Mascota</label>
              <select
                name="mascotaId"
                value={mascotaId}
                disabled={!clienteSeleccionado || cargandoMascotas}
                className="mt-1 h-11 w-full rounded-md border border-borde bg-fondo px-3 text-sm outline-none transition focus:border-primario focus:ring-2 focus:ring-primario/18 disabled:opacity-60"
                onChange={(event) => setMascotaId(event.target.value)}
              >
                <option value="">{cargandoMascotas ? "Cargando mascotas..." : "Selecciona mascota"}</option>
                {mascotas.map((mascota) => (
                  <option key={mascota.id} value={mascota.id}>
                    {mascota.nombre} - {mascota.especie}
                  </option>
                ))}
              </select>
              {errores.mascotaId ? <p className="mt-1 text-xs font-semibold text-red-600">{errores.mascotaId}</p> : null}
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-texto/60">Veterinario</label>
              <select
                name="veterinarioId"
                value={veterinarioId}
                className="mt-1 h-11 w-full rounded-md border border-borde bg-fondo px-3 text-sm outline-none transition focus:border-primario focus:ring-2 focus:ring-primario/18"
                onChange={(event) => setVeterinarioId(event.target.value)}
              >
                <option value="">Selecciona un veterinario</option>
                {veterinarios.map((veterinario) => (
                  <option key={veterinario.id} value={veterinario.id}>
                    {veterinario.nombre}
                  </option>
                ))}
              </select>
              {errores.veterinarioId ? <p className="mt-1 text-xs font-semibold text-red-600">{errores.veterinarioId}</p> : null}
            </div>

            <div className="sm:col-span-2">
              <TextareaField defaultValue={cita?.observaciones ?? ""} error={errores.observaciones} label="Observaciones" name="observaciones" />
            </div>
          </div>
        )}

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

function DetalleCita({
  cerrar,
  cita,
  gestionarHistoria,
  historiaCargandoId,
  puedeCrearHistoria
}: {
  cerrar: () => void;
  cita: Cita;
  gestionarHistoria: (cita: Cita) => void;
  historiaCargandoId?: string;
  puedeCrearHistoria: boolean;
}) {
  const historia = obtenerHistoriaActiva(cita);
  const tieneHistoriaAnulada = Boolean(cita.historiaClinica?.eliminadoEn);
  const puedeMostrarHistoria = cita.estado === "COMPLETADA" && (Boolean(historia) || (puedeCrearHistoria && !tieneHistoriaAnulada));

  return (
    <motion.div className="fixed inset-0 z-50 flex justify-end bg-slate-950/55" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.aside className="h-full w-full max-w-md overflow-y-auto bg-superficie p-5" initial={{ x: 420 }} animate={{ x: 0 }} exit={{ x: 420 }}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Detalle cita</h2>
          <Button aria-label="Cerrar" size="icon" type="button" variant="ghost" onClick={cerrar}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="space-y-4 text-sm">
          <div className="flex items-center gap-3 rounded-md border border-borde bg-fondo p-4">
            <CalendarClock className="h-8 w-8 text-primario" />
            <div>
              <p className="text-lg font-bold">{formatearFecha(cita.fecha)}</p>
              <EstadoCitaBadge estado={cita.estado} />
            </div>
          </div>
          <DetalleItem label="Paciente" value={`${cita.mascota.nombre} - ${cita.mascota.raza ?? cita.mascota.especie}`} />
          <DetalleItem label="Dueno" value={`${cita.cliente.nombres} ${cita.cliente.apellidos}`} />
          <DetalleItem label="Celular" value={cita.cliente.celular ?? "-"} />
          <DetalleItem label="Veterinario" value={`${cita.veterinario.nombres} ${cita.veterinario.apellidos}`} />
          <DetalleItem label="Correo veterinario" value={cita.veterinario.correo} />
          <DetalleItem label="Motivo" value={cita.motivo} />
          <DetalleItem label="Observaciones" value={cita.observaciones ?? "-"} />
          {cita.estado === "COMPLETADA" ? (
            <div className="rounded-md border border-borde bg-fondo p-3">
              <p className="text-xs font-bold uppercase text-texto/45">Historia clinica</p>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <HistoriaCitaBadge cita={cita} />
                {puedeMostrarHistoria ? (
                  <Button disabled={Boolean(historiaCargandoId)} size="sm" type="button" onClick={() => gestionarHistoria(cita)}>
                    {historiaCargandoId === cita.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                    {historia ? "Ver historia clinica" : "Crear historia clinica"}
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </motion.aside>
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
          "mt-1 min-h-[100px] w-full rounded-md border border-borde bg-fondo p-3 text-sm outline-none transition focus:border-primario focus:ring-2 focus:ring-primario/18",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/18"
        )}
      />
      {error ? <p className="mt-1 text-xs font-semibold text-red-600">{error}</p> : null}
    </div>
  );
}

function DetalleItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-borde bg-fondo p-3">
      <p className="text-xs font-bold uppercase text-texto/45">{label}</p>
      <p className="mt-1 break-words font-semibold">{value}</p>
    </div>
  );
}

function EstadoCitaBadge({ estado }: { estado: EstadoCita }) {
  const estilos: Record<EstadoCita, string> = {
    PENDIENTE: "bg-amber-500/10 text-amber-600",
    CONFIRMADA: "bg-primario/10 text-primario",
    COMPLETADA: "bg-exito/10 text-exito",
    CANCELADA: "bg-red-500/10 text-red-600"
  };

  return <span className={cn("inline-flex rounded-md px-2 py-1 text-xs font-bold", estilos[estado])}>{formatearEstado(estado)}</span>;
}

function HistoriaCitaBadge({ cita }: { cita: Cita }) {
  const historia = obtenerHistoriaActiva(cita);

  if (historia) {
    return (
      <span className={cn("inline-flex rounded-md px-2 py-1 text-xs font-bold", historia.cerrada ? "bg-exito/10 text-exito" : "bg-amber-500/10 text-amber-600")}>
        Historia {historia.cerrada ? "cerrada" : "abierta"}
      </span>
    );
  }

  if (cita.historiaClinica?.eliminadoEn) {
    return <span className="inline-flex rounded-md bg-red-500/10 px-2 py-1 text-xs font-bold text-red-600">Historia anulada</span>;
  }

  return <span className="inline-flex rounded-md bg-primario/10 px-2 py-1 text-xs font-bold text-primario">Sin historia clinica</span>;
}

function obtenerHistoriaActiva(cita: Cita) {
  return cita.historiaClinica && !cita.historiaClinica.eliminadoEn ? cita.historiaClinica : null;
}

function ToastView({ toast }: { toast?: Toast }) {
  return (
    <AnimatePresence>
      {toast ? (
        <motion.div
          className={cn(
            "fixed right-4 top-4 z-50 rounded-md px-4 py-3 text-sm font-semibold text-white shadow-lg",
            toast.tipo === "exito" ? "bg-exito" : "bg-red-600"
          )}
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
        >
          {toast.mensaje}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function mapearVeterinarios(veterinarios: Veterinario[]): VeterinarioOption[] {
  return veterinarios
    .map((veterinario) => ({
      id: veterinario.id,
      nombre: `${veterinario.nombres} ${veterinario.apellidos}`,
      correo: veterinario.correo
    }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
}

function formatearEstado(estado: EstadoCita) {
  return estado.charAt(0) + estado.slice(1).toLowerCase();
}

function formatearFecha(fecha: string) {
  if (!fecha) {
    return "-";
  }

  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(fecha));
}

function toDateTimeLocal(fecha: string) {
  const date = new Date(fecha);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}
