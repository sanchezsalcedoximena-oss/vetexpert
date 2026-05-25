"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Eye, Loader2, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import { HistoriaClinicaTimeline } from "@/modules/historias-clinicas/components/HistoriaClinicaTimeline";
import { listarClientes, type Cliente } from "@/services/clientes";
import {
  actualizarMascota,
  crearMascota,
  eliminarMascota,
  listarMascotas,
  type Mascota,
  type MascotasMeta
} from "@/services/mascotas";

const mascotaSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres.").max(60, "El nombre no debe superar 60 caracteres."),
  especie: z.enum(["PERRO", "GATO", "AVE", "CONEJO", "HAMSTER", "REPTIL", "PEZ", "OTRO"], {
    errorMap: () => ({ message: "Selecciona una especie valida." })
  }),
  raza: z.string().max(60, "La raza no debe superar 60 caracteres.").optional(),
  sexo: z.enum(["MACHO", "HEMBRA"], {
    errorMap: () => ({ message: "El sexo debe ser MACHO o HEMBRA." })
  }),
  fechaNacimiento: z.string().refine((val) => {
    if (!val) return true;
    const fecha = new Date(val);
    return fecha <= new Date();
  }, { message: "La fecha de nacimiento no puede ser futura." }).optional(),
  peso: z
    .string()
    .optional()
    .transform((val) => (val === "" || val === undefined ? undefined : parseFloat(val)))
    .refine((val) => {
      if (val === undefined) return true;
      return !isNaN(val) && val > 0;
    }, { message: "El peso debe ser mayor a 0." }),
  color: z.string().max(40, "El color no debe superar 40 caracteres.").optional(),
  esterilizado: z.boolean(),
  alergias: z.string().max(300, "Las alergias no deben superar 300 caracteres.").optional(),
  observaciones: z.string().max(500, "Las observaciones no deben superar 500 caracteres.").optional(),
  clienteId: z.string().uuid("El cliente seleccionado no es valido."),
  activo: z.boolean()
});

type EstadoFiltro = "todos" | "activos" | "inactivos";
type Toast = { tipo: "exito" | "error"; mensaje: string };
type FormErrores = Partial<Record<keyof z.infer<typeof mascotaSchema> | "general", string>>;

const EMOJIS_ESPECIE: Record<string, string> = {
  PERRO: "🐕",
  GATO: "🐈",
  AVE: "🦜",
  CONEJO: "🐇",
  HAMSTER: "🐹",
  REPTIL: "🦎",
  PEZ: "🐠",
  OTRO: "🐾"
};

const metaInicial: MascotasMeta = {
  pagina: 1,
  limite: 10,
  total: 0,
  totalPaginas: 1
};

function calcularEdad(fechaNacimientoStr: string | null): string {
  if (!fechaNacimientoStr) return "-";
  const fechaNac = new Date(fechaNacimientoStr);
  const ahora = new Date();

  let años = ahora.getFullYear() - fechaNac.getFullYear();
  let meses = ahora.getMonth() - fechaNac.getMonth();
  let dias = ahora.getDate() - fechaNac.getDate();

  if (dias < 0) {
    meses--;
    const ultimoDiaMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth(), 0).getDate();
    dias += ultimoDiaMesAnterior;
  }

  if (meses < 0) {
    años--;
    meses += 12;
  }

  if (años > 0) {
    return `${años} ${años === 1 ? "año" : "años"}${meses > 0 ? ` y ${meses} ${meses === 1 ? "mes" : "meses"}` : ""}`;
  } else if (meses > 0) {
    return `${meses} ${meses === 1 ? "mes" : "meses"}${dias > 0 ? ` y ${dias} ${dias === 1 ? "dia" : "dias"}` : ""}`;
  } else {
    return `${dias} ${dias === 1 ? "dia" : "dias"}`;
  }
}

export function MascotasPage() {
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [meta, setMeta] = useState<MascotasMeta>(metaInicial);
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState<EstadoFiltro>("activos");
  const [especie, setEspecie] = useState<string>("");
  const [pagina, setPagina] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState<{ modo: "crear" | "editar"; mascota?: Mascota }>();
  const [detalle, setDetalle] = useState<Mascota>();
  const [toast, setToast] = useState<Toast>();

  const busquedaNormalizada = useMemo(() => busqueda.trim(), [busqueda]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void cargarMascotas();
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [pagina, estado, especie, busquedaNormalizada]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = window.setTimeout(() => setToast(undefined), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  async function cargarMascotas() {
    try {
      setCargando(true);
      const respuesta = await listarMascotas({
        pagina,
        limite: meta.limite,
        busqueda: busquedaNormalizada || undefined,
        estado,
        especie: especie || undefined
      });
      setMascotas(respuesta.datos);
      setMeta(respuesta.meta);
    } catch {
      setToast({ tipo: "error", mensaje: "No pudimos cargar las mascotas." });
    } finally {
      setCargando(false);
    }
  }

  async function confirmarEliminar(mascota: Mascota) {
    const confirmado = window.confirm(`¿Eliminar a la mascota ${mascota.nombre}?`);

    if (!confirmado) {
      return;
    }

    try {
      await eliminarMascota(mascota.id);
      setToast({ tipo: "exito", mensaje: "Mascota eliminada correctamente." });
      await cargarMascotas();
    } catch {
      setToast({ tipo: "error", mensaje: "No pudimos eliminar la mascota." });
    }
  }

  return (
    <div className="space-y-5">
      <ToastView toast={toast} />
      <section className="rounded-md border border-borde bg-superficie p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-bold">Gestion de mascotas</h2>
            <p className="mt-1 text-sm text-texto/60">Administra registros de mascotas, especies, datos clínicos y sus dueños.</p>
          </div>
          <Button type="button" onClick={() => setModal({ modo: "crear" })}>
            <Plus className="h-4 w-4" />
            Nueva mascota
          </Button>
        </div>
        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_180px_180px]">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-texto/40" />
            <input
              className="h-11 w-full rounded-md border border-borde bg-fondo pl-10 pr-3 text-sm outline-none transition focus:border-primario focus:ring-2 focus:ring-primario/18"
              placeholder="Buscar por nombre, raza o dueño"
              value={busqueda}
              onChange={(event) => {
                setPagina(1);
                setBusqueda(event.target.value);
              }}
            />
          </div>
          <select
            className="h-11 rounded-md border border-borde bg-fondo px-3 text-sm outline-none transition focus:border-primario focus:ring-2 focus:ring-primario/18"
            value={especie}
            onChange={(event) => {
              setPagina(1);
              setEspecie(event.target.value);
            }}
          >
            <option value="">Todas las especies</option>
            <option value="PERRO">Perro</option>
            <option value="GATO">Gato</option>
            <option value="AVE">Ave</option>
            <option value="CONEJO">Conejo</option>
            <option value="HAMSTER">Hámster</option>
            <option value="REPTIL">Reptil</option>
            <option value="PEZ">Pez</option>
            <option value="OTRO">Otro</option>
          </select>
          <select
            className="h-11 rounded-md border border-borde bg-fondo px-3 text-sm outline-none transition focus:border-primario focus:ring-2 focus:ring-primario/18"
            value={estado}
            onChange={(event) => {
              setPagina(1);
              setEstado(event.target.value as EstadoFiltro);
            }}
          >
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
            <option value="todos">Todos</option>
          </select>
        </div>
      </section>

      <MascotasTable
        cargando={cargando}
        mascotas={mascotas}
        editar={(mascota) => setModal({ modo: "editar", mascota })}
        eliminar={confirmarEliminar}
        verDetalle={setDetalle}
      />

      <div className="flex flex-col gap-3 rounded-md border border-borde bg-superficie p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-texto/60">
          {meta.total} mascotas - pagina {meta.pagina} de {meta.totalPaginas}
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
          <MascotaModal
            mascota={modal.mascota}
            modo={modal.modo}
            cerrar={() => setModal(undefined)}
            guardado={async () => {
              setModal(undefined);
              setToast({ tipo: "exito", mensaje: modal.modo === "crear" ? "Mascota creada." : "Mascota actualizada." });
              await cargarMascotas();
            }}
          />
        ) : null}
        {detalle ? <DetalleMascota mascota={detalle} cerrar={() => setDetalle(undefined)} notificar={setToast} /> : null}
      </AnimatePresence>
    </div>
  );
}

function MascotasTable({
  cargando,
  mascotas,
  editar,
  eliminar,
  verDetalle
}: {
  cargando: boolean;
  mascotas: Mascota[];
  editar: (mascota: Mascota) => void;
  eliminar: (mascota: Mascota) => void;
  verDetalle: (mascota: Mascota) => void;
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

  if (!mascotas.length) {
    return (
      <div className="rounded-md border border-borde bg-superficie p-8 text-center">
        <h3 className="text-lg font-bold">Sin mascotas</h3>
        <p className="mt-2 text-sm text-texto/60">Ajusta la busqueda o registra la primera mascota.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-borde bg-superficie">
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[860px] border-collapse text-left text-sm">
          <thead className="bg-fondo text-xs uppercase text-texto/55">
            <tr>
              <th className="px-4 py-3">Mascota</th>
              <th className="px-4 py-3">Dueño</th>
              <th className="px-4 py-3">Raza</th>
              <th className="px-4 py-3">Sexo</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {mascotas.map((mascota) => (
              <tr key={mascota.id} className="border-t border-borde">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl" title={mascota.especie}>
                      {EMOJIS_ESPECIE[mascota.especie] || "🐾"}
                    </span>
                    <div>
                      <p className="font-bold">{mascota.nombre}</p>
                      <p className="text-xs text-texto/55">{mascota.especie}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold">
                    {mascota.cliente.nombres} {mascota.cliente.apellidos}
                  </p>
                  <p className="text-xs text-texto/55">DNI: {mascota.cliente.dni ?? "-"}</p>
                </td>
                <td className="px-4 py-3">{mascota.raza ?? "-"}</td>
                <td className="px-4 py-3">{mascota.sexo}</td>
                <td className="px-4 py-3">
                  <EstadoBadge activo={mascota.activo} />
                </td>
                <td className="px-4 py-3">
                  <Acciones mascota={mascota} editar={editar} eliminar={eliminar} verDetalle={verDetalle} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 p-3 lg:hidden">
        {mascotas.map((mascota) => (
          <article key={mascota.id} className="rounded-md border border-borde bg-fondo p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{EMOJIS_ESPECIE[mascota.especie] || "🐾"}</span>
                <div>
                  <h3 className="font-bold">{mascota.nombre}</h3>
                  <p className="text-xs text-texto/60">
                    {mascota.especie} {mascota.raza ? `• ${mascota.raza}` : ""}
                  </p>
                </div>
              </div>
              <EstadoBadge activo={mascota.activo} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <p>
                <span className="text-texto/50">Dueño</span>
                <br />
                {mascota.cliente.nombres} {mascota.cliente.apellidos}
              </p>
              <p>
                <span className="text-texto/50">Sexo</span>
                <br />
                {mascota.sexo}
              </p>
            </div>
            <div className="mt-4">
              <Acciones mascota={mascota} editar={editar} eliminar={eliminar} verDetalle={verDetalle} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function Acciones({
  mascota,
  editar,
  eliminar,
  verDetalle
}: {
  mascota: Mascota;
  editar: (mascota: Mascota) => void;
  eliminar: (mascota: Mascota) => void;
  verDetalle: (mascota: Mascota) => void;
}) {
  return (
    <div className="flex justify-end gap-2">
      <Button aria-label="Ver detalle" size="icon" title="Ver detalle" type="button" variant="ghost" onClick={() => verDetalle(mascota)}>
        <Eye className="h-4 w-4" />
      </Button>
      <Button aria-label="Editar" size="icon" title="Editar" type="button" variant="ghost" onClick={() => editar(mascota)}>
        <Pencil className="h-4 w-4" />
      </Button>
      <Button aria-label="Eliminar" className="text-red-600 hover:bg-red-500/10" size="icon" title="Eliminar" type="button" variant="ghost" onClick={() => eliminar(mascota)}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

function MascotaModal({
  cerrar,
  mascota,
  guardado,
  modo
}: {
  cerrar: () => void;
  mascota?: Mascota;
  guardado: () => Promise<void>;
  modo: "crear" | "editar";
}) {
  const [errores, setErrores] = useState<FormErrores>({});
  const [guardando, setGuardando] = useState(false);

  // Estado para el selector de clientes
  const [clienteSeleccionado, setClienteSeleccionado] = useState<{ id: string; nombres: string; apellidos: string; dni: string | null } | null>(
    mascota
      ? {
          id: mascota.clienteId,
          nombres: mascota.cliente.nombres,
          apellidos: mascota.cliente.apellidos,
          dni: mascota.cliente.dni
        }
      : null
  );
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargandoClientes, setCargandoClientes] = useState(false);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);

  useEffect(() => {
    if (!mostrarDropdown) return;
    const timer = setTimeout(() => {
      void fetchClientes(busquedaCliente);
    }, 250);

    return () => clearTimeout(timer);
  }, [busquedaCliente, mostrarDropdown]);

  async function fetchClientes(search: string) {
    try {
      setCargandoClientes(true);
      const res = await listarClientes({
        pagina: 1,
        limite: 50,
        estado: "activos",
        busqueda: search || undefined
      });
      setClientes(res.datos);
    } catch (e) {
      console.error(e);
    } finally {
      setCargandoClientes(false);
    }
  }

  async function enviarFormulario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const validacion = mascotaSchema.safeParse({
      nombre: String(formData.get("nombre") ?? ""),
      especie: String(formData.get("especie") ?? ""),
      raza: String(formData.get("raza") ?? "") || undefined,
      sexo: String(formData.get("sexo") ?? ""),
      fechaNacimiento: String(formData.get("fechaNacimiento") ?? "") || undefined,
      peso: String(formData.get("peso") ?? ""),
      color: String(formData.get("color") ?? "") || undefined,
      esterilizado: formData.get("esterilizado") === "on",
      alergias: String(formData.get("alergias") ?? "") || undefined,
      observaciones: String(formData.get("observaciones") ?? "") || undefined,
      clienteId: String(formData.get("clienteId") ?? ""),
      activo: formData.get("activo") === "on"
    });

    if (!validacion.success) {
      setErrores(Object.fromEntries(validacion.error.issues.map((issue) => [issue.path[0], issue.message])));
      return;
    }

    try {
      setErrores({});
      setGuardando(true);
      const payload = {
        nombre: validacion.data.nombre,
        especie: validacion.data.especie,
        raza: validacion.data.raza || undefined,
        sexo: validacion.data.sexo,
        fechaNacimiento: validacion.data.fechaNacimiento || undefined,
        peso: validacion.data.peso,
        color: validacion.data.color || undefined,
        esterilizado: validacion.data.esterilizado,
        alergias: validacion.data.alergias || undefined,
        observaciones: validacion.data.observaciones || undefined,
        clienteId: validacion.data.clienteId,
        activo: validacion.data.activo
      };

      if (modo === "crear") {
        await crearMascota(payload);
      } else if (mascota) {
        await actualizarMascota(mascota.id, payload);
      }

      await guardado();
    } catch {
      setErrores({ general: "No pudimos guardar la mascota. Verifica los datos o el cliente seleccionado." });
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
            <h2 className="text-xl font-bold">{modo === "crear" ? "Nueva mascota" : "Editar mascota"}</h2>
            <p className="text-sm text-texto/60">Registra o edita los datos veterinarios de la mascota.</p>
          </div>
          <Button aria-label="Cerrar" size="icon" type="button" variant="ghost" onClick={cerrar}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input defaultValue={mascota?.nombre} error={errores.nombre} label="Nombre de la Mascota" name="nombre" />

          <div>
            <label className="text-xs font-semibold text-texto/60">Especie</label>
            <select
              name="especie"
              defaultValue={mascota?.especie ?? "PERRO"}
              className="mt-1 h-11 w-full rounded-md border border-borde bg-fondo px-3 text-sm outline-none transition focus:border-primario focus:ring-2 focus:ring-primario/18"
            >
              <option value="PERRO">Perro</option>
              <option value="GATO">Gato</option>
              <option value="AVE">Ave</option>
              <option value="CONEJO">Conejo</option>
              <option value="HAMSTER">Hámster</option>
              <option value="REPTIL">Reptil</option>
              <option value="PEZ">Pez</option>
              <option value="OTRO">Otro</option>
            </select>
            {errores.especie ? <p className="mt-1 text-xs text-red-600 font-semibold">{errores.especie}</p> : null}
          </div>

          <Input defaultValue={mascota?.raza ?? ""} error={errores.raza} label="Raza" name="raza" />

          <div>
            <label className="text-xs font-semibold text-texto/60">Sexo</label>
            <select
              name="sexo"
              defaultValue={mascota?.sexo ?? "MACHO"}
              className="mt-1 h-11 w-full rounded-md border border-borde bg-fondo px-3 text-sm outline-none transition focus:border-primario focus:ring-2 focus:ring-primario/18"
            >
              <option value="MACHO">Macho</option>
              <option value="HEMBRA">Hembra</option>
            </select>
            {errores.sexo ? <p className="mt-1 text-xs text-red-600 font-semibold">{errores.sexo}</p> : null}
          </div>

          <Input
            defaultValue={mascota?.fechaNacimiento ? mascota.fechaNacimiento.split("T")[0] : ""}
            error={errores.fechaNacimiento}
            label="Fecha de Nacimiento"
            name="fechaNacimiento"
            type="date"
          />

          <Input
            defaultValue={mascota?.peso ?? ""}
            error={errores.peso}
            label="Peso (kg)"
            name="peso"
            type="number"
            step="0.01"
          />

          <Input defaultValue={mascota?.color ?? ""} error={errores.color} label="Color" name="color" />

          {/* Selector de Cliente / Dueño */}
          <div className="relative">
            <label className="text-xs font-semibold text-texto/60">Dueño / Cliente</label>
            <div className="mt-1">
              <input
                type="text"
                className="h-11 w-full rounded-md border border-borde bg-fondo px-3 text-sm outline-none transition focus:border-primario focus:ring-2 focus:ring-primario/18"
                placeholder="Buscar dueño por nombre o DNI..."
                value={clienteSeleccionado ? `${clienteSeleccionado.nombres} ${clienteSeleccionado.apellidos} — ${clienteSeleccionado.dni ?? ""}` : busquedaCliente}
                onChange={(e) => {
                  setClienteSeleccionado(null);
                  setBusquedaCliente(e.target.value);
                  setMostrarDropdown(true);
                }}
                onFocus={() => setMostrarDropdown(true)}
              />
              <input type="hidden" name="clienteId" value={clienteSeleccionado?.id ?? ""} />
            </div>
            {mostrarDropdown && (
              <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-borde bg-superficie shadow-lg">
                {cargandoClientes ? (
                  <div className="p-3 text-sm text-texto/60 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primario" />
                    Cargando clientes...
                  </div>
                ) : clientes.length === 0 ? (
                  <div className="p-3 text-sm text-texto/60">No se encontraron clientes activos.</div>
                ) : (
                  clientes.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm hover:bg-primario/10 transition"
                      onClick={() => {
                        setClienteSeleccionado({
                          id: c.id,
                          nombres: c.nombres,
                          apellidos: c.apellidos,
                          dni: c.dni
                        });
                        setMostrarDropdown(false);
                      }}
                    >
                      {c.nombres} {c.apellidos} — {c.dni ?? "Sin DNI"}
                    </button>
                  ))
                )}
              </div>
            )}
            {errores.clienteId ? <p className="mt-1 text-xs text-red-600 font-semibold">{errores.clienteId}</p> : null}
          </div>

          <label className="flex items-center gap-3 rounded-md border border-borde bg-fondo px-3 py-3 text-sm font-semibold">
            <input defaultChecked={mascota?.esterilizado ?? false} name="esterilizado" type="checkbox" />
            Esterilizado / Castrado
          </label>

          <label className="flex items-center gap-3 rounded-md border border-borde bg-fondo px-3 py-3 text-sm font-semibold">
            <input defaultChecked={mascota?.activo ?? true} name="activo" type="checkbox" />
            Mascota activa
          </label>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-texto/60">Alergias</label>
            <textarea
              name="alergias"
              defaultValue={mascota?.alergias ?? ""}
              className="mt-1 w-full rounded-md border border-borde bg-fondo p-3 text-sm outline-none transition focus:border-primario focus:ring-2 focus:ring-primario/18 min-h-[80px]"
              placeholder="Especifica alergias o condiciones médicas..."
            />
            {errores.alergias ? <p className="mt-1 text-xs text-red-600 font-semibold">{errores.alergias}</p> : null}
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-texto/60">Observaciones</label>
            <textarea
              name="observaciones"
              defaultValue={mascota?.observaciones ?? ""}
              className="mt-1 w-full rounded-md border border-borde bg-fondo p-3 text-sm outline-none transition focus:border-primario focus:ring-2 focus:ring-primario/18 min-h-[100px]"
              placeholder="Notas o comentarios adicionales del veterinario..."
            />
            {errores.observaciones ? <p className="mt-1 text-xs text-red-600 font-semibold">{errores.observaciones}</p> : null}
          </div>
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

function DetalleMascota({ cerrar, mascota, notificar }: { cerrar: () => void; mascota: Mascota; notificar: (toast: Toast) => void }) {
  return (
    <motion.div className="fixed inset-0 z-50 flex justify-end bg-slate-950/55" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.aside className="h-full w-full max-w-2xl overflow-y-auto bg-superficie p-5" initial={{ x: 640 }} animate={{ x: 0 }} exit={{ x: 640 }}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Detalle mascota</h2>
          <Button aria-label="Cerrar" size="icon" type="button" variant="ghost" onClick={cerrar}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="space-y-4 text-sm">
          <div className="flex items-center gap-3 rounded-md border border-borde bg-fondo p-4">
            <span className="text-4xl">{EMOJIS_ESPECIE[mascota.especie] || "🐾"}</span>
            <div>
              <p className="text-lg font-bold">{mascota.nombre}</p>
              <p className="text-sm text-texto/60">
                {mascota.especie} {mascota.raza ? `• ${mascota.raza}` : ""}
              </p>
            </div>
          </div>
          <DetalleItem label="Dueño / Cliente" value={`${mascota.cliente.nombres} ${mascota.cliente.apellidos}`} />
          <DetalleItem label="DNI del Dueño" value={mascota.cliente.dni ?? "-"} />
          <DetalleItem label="Sexo" value={mascota.sexo} />
          <DetalleItem label="Edad" value={calcularEdad(mascota.fechaNacimiento)} />
          <DetalleItem label="Fecha de Nacimiento" value={mascota.fechaNacimiento ? new Date(mascota.fechaNacimiento).toLocaleDateString("es-PE") : "-"} />
          <DetalleItem label="Peso" value={mascota.peso ? `${mascota.peso} kg` : "-"} />
          <DetalleItem label="Color" value={mascota.color ?? "-"} />
          <DetalleItem label="Esterilizado" value={mascota.esterilizado ? "Sí" : "No"} />
          <DetalleItem label="Alergias" value={mascota.alergias ?? "Ninguna conocida"} />
          <DetalleItem label="Observaciones" value={mascota.observaciones ?? "-"} />
          <DetalleItem label="Estado" value={mascota.activo ? "Activo" : "Inactivo"} />
          <HistoriaClinicaTimeline mascotaId={mascota.id} notificar={notificar} />
        </div>
      </motion.aside>
    </motion.div>
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

function EstadoBadge({ activo }: { activo: boolean }) {
  return (
    <span className={cn("rounded-md px-2 py-1 text-xs font-bold", activo ? "bg-exito/10 text-exito" : "bg-red-500/10 text-red-600")}>
      {activo ? "Activo" : "Inactivo"}
    </span>
  );
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
