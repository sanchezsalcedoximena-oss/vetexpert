"use client";

import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Eye, Pencil, Plus, Power, PowerOff, Search, ShieldAlert, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import {
  activarStaff,
  actualizarStaff,
  crearStaff,
  inactivarStaff,
  listarStaff,
  type EstadoStaffFiltro,
  type RolStaff,
  type Staff,
  type StaffMeta
} from "@/services/staff";
import { useAuthStore } from "@/store/auth-store";
import { celularPeruSchema, correoSchema, dniSchema } from "@/validators/peru";

const rolesStaff = ["ADMIN", "VETERINARIO", "SECRETARIA"] as const;

const staffBaseSchema = z.object({
  nombres: z.string().min(2, "Ingresa nombres validos.").max(80, "Maximo 80 caracteres."),
  apellidos: z.string().min(2, "Ingresa apellidos validos.").max(80, "Maximo 80 caracteres."),
  correo: correoSchema,
  dni: z.union([dniSchema, z.literal("")]).optional(),
  celular: z.union([celularPeruSchema, z.literal("")]).optional(),
  direccion: z.string().max(160, "Maximo 160 caracteres.").optional(),
  rol: z.enum(rolesStaff, { errorMap: () => ({ message: "Selecciona un rol válido." }) })
});

const crearStaffSchema = staffBaseSchema.extend({
  contrasena: z.string().min(8, "La contraseña debe tener al menos 8 caracteres.").max(72, "Maximo 72 caracteres."),
  activo: z.boolean()
});

const editarStaffSchema = staffBaseSchema;

type Toast = { tipo: "exito" | "error"; mensaje: string };
type StaffFormValores = z.infer<typeof crearStaffSchema>;
type FormErrores = Partial<Record<keyof StaffFormValores | "general", string>>;

const metaInicial: StaffMeta = {
  pagina: 1,
  limite: 10,
  total: 0,
  totalPaginas: 1
};

export function StaffPage() {
  const usuario = useAuthStore((state) => state.usuario);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [meta, setMeta] = useState<StaffMeta>(metaInicial);
  const [busqueda, setBusqueda] = useState("");
  const [rol, setRol] = useState<RolStaff | "">("");
  const [estado, setEstado] = useState<EstadoStaffFiltro>("activos");
  const [pagina, setPagina] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState<{ modo: "crear" | "editar"; staff?: Staff }>();
  const [detalle, setDetalle] = useState<Staff>();
  const [toast, setToast] = useState<Toast>();

  const busquedaNormalizada = useMemo(() => busqueda.trim(), [busqueda]);
  const esAdmin = usuario?.rol === "ADMIN";

  useEffect(() => {
    if (!esAdmin) {
      setCargando(false);
      return;
    }

    const timeout = window.setTimeout(() => {
      void cargarStaff();
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [pagina, estado, rol, busquedaNormalizada, esAdmin]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = window.setTimeout(() => setToast(undefined), 3600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  async function cargarStaff() {
    try {
      setCargando(true);
      const respuesta = await listarStaff({
        pagina,
        limite: meta.limite,
        busqueda: busquedaNormalizada || undefined,
        rol: rol || undefined,
        estado
      });
      setStaff(respuesta.datos);
      setMeta(respuesta.meta);
    } catch (error) {
      setToast({ tipo: "error", mensaje: obtenerMensajeError(error, "No pudimos cargar el staff.") });
    } finally {
      setCargando(false);
    }
  }

  async function cambiarEstado(registro: Staff) {
    const accion = registro.activo ? "inactivar" : "activar";
    const confirmado = window.confirm(`${registro.activo ? "Inactivar" : "Activar"} a ${registro.nombres} ${registro.apellidos}?`);

    if (!confirmado) {
      return;
    }

    try {
      if (registro.activo) {
        await inactivarStaff(registro.id);
      } else {
        await activarStaff(registro.id);
      }

      setToast({ tipo: "exito", mensaje: `Staff ${accion === "activar" ? "activado" : "inactivado"} correctamente.` });
      await cargarStaff();
    } catch (error) {
      setToast({ tipo: "error", mensaje: obtenerMensajeError(error, `No pudimos ${accion} el staff.`) });
    }
  }

  if (!esAdmin) {
    return (
      <div className="rounded-md border border-borde bg-superficie p-8 text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-red-600" />
        <h2 className="mt-4 text-lg font-bold">Acceso restringido</h2>
        <p className="mt-2 text-sm text-texto/60">Solo ADMIN puede gestionar usuarios staff.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ToastView toast={toast} />
      <section className="rounded-md border border-borde bg-superficie p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-bold">Gestion de staff</h2>
            <p className="mt-1 text-sm text-texto/60">Administra personal interno y estado de acceso.</p>
          </div>
          <Button type="button" onClick={() => setModal({ modo: "crear" })}>
            <Plus className="h-4 w-4" />
            Nuevo staff
          </Button>
        </div>
        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_190px_190px]">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-texto/40" />
            <input
              className="h-11 w-full rounded-md border border-borde bg-fondo pl-10 pr-3 text-sm outline-none transition focus:border-primario focus:ring-2 focus:ring-primario/18"
              placeholder="Buscar por nombre, correo, DNI o celular"
              value={busqueda}
              onChange={(event) => {
                setPagina(1);
                setBusqueda(event.target.value);
              }}
            />
          </div>
          <select
            className="h-11 rounded-md border border-borde bg-fondo px-3 text-sm outline-none transition focus:border-primario focus:ring-2 focus:ring-primario/18"
            value={rol}
            onChange={(event) => {
              setPagina(1);
              setRol(event.target.value as RolStaff | "");
            }}
          >
            <option value="">Todos los roles</option>
            {rolesStaff.map((item) => (
              <option key={item} value={item}>
                {etiquetaRol(item)}
              </option>
            ))}
          </select>
          <select
            className="h-11 rounded-md border border-borde bg-fondo px-3 text-sm outline-none transition focus:border-primario focus:ring-2 focus:ring-primario/18"
            value={estado}
            onChange={(event) => {
              setPagina(1);
              setEstado(event.target.value as EstadoStaffFiltro);
            }}
          >
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
            <option value="todos">Todos</option>
          </select>
        </div>
      </section>

      <StaffTable
        cargando={cargando}
        staff={staff}
        cambiarEstado={cambiarEstado}
        editar={(registro) => setModal({ modo: "editar", staff: registro })}
        verDetalle={setDetalle}
      />

      <div className="flex flex-col gap-3 rounded-md border border-borde bg-superficie p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-texto/60">
          {meta.total} usuarios staff - página {meta.pagina} de {meta.totalPaginas}
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
          <StaffModal
            modo={modal.modo}
            staff={modal.staff}
            cerrar={() => setModal(undefined)}
            guardado={async () => {
              setModal(undefined);
              setToast({ tipo: "exito", mensaje: modal.modo === "crear" ? "Staff creado." : "Staff actualizado." });
              await cargarStaff();
            }}
          />
        ) : null}
        {detalle ? <DetalleStaff staff={detalle} cerrar={() => setDetalle(undefined)} /> : null}
      </AnimatePresence>
    </div>
  );
}

function StaffTable({
  cambiarEstado,
  cargando,
  editar,
  staff,
  verDetalle
}: {
  cambiarEstado: (staff: Staff) => void;
  cargando: boolean;
  editar: (staff: Staff) => void;
  staff: Staff[];
  verDetalle: (staff: Staff) => void;
}) {
  if (cargando) {
    return <TableSkeleton />;
  }

  if (!staff.length) {
    return (
      <div className="rounded-md border border-borde bg-superficie p-4">
        <EmptyState titulo="Sin staff" descripcion="Ajusta la busqueda o crea el primer usuario interno." />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-borde bg-superficie">
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[920px] border-collapse text-left text-sm">
          <thead className="bg-fondo text-xs uppercase text-texto/55">
            <tr>
              <th className="px-4 py-3">Staff</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">DNI</th>
              <th className="px-4 py-3">Celular</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((registro) => (
              <tr key={registro.id} className="border-t border-borde">
                <td className="px-4 py-3">
                  <p className="font-bold">
                    {registro.nombres} {registro.apellidos}
                  </p>
                  <p className="max-w-[320px] break-words text-xs text-texto/55">{registro.correo}</p>
                </td>
                <td className="px-4 py-3">
                  <RolBadge rol={registro.rol} />
                </td>
                <td className="px-4 py-3">{registro.dni ?? "-"}</td>
                <td className="px-4 py-3">{registro.celular ?? "-"}</td>
                <td className="px-4 py-3">
                  <EstadoBadge activo={registro.activo} />
                </td>
                <td className="px-4 py-3">
                  <Acciones staff={registro} cambiarEstado={cambiarEstado} editar={editar} verDetalle={verDetalle} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 p-3 lg:hidden">
        {staff.map((registro) => (
          <article key={registro.id} className="rounded-md border border-borde bg-fondo p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-bold">
                  {registro.nombres} {registro.apellidos}
                </h3>
                <p className="mt-1 break-words text-sm text-texto/60">{registro.correo}</p>
              </div>
              <EstadoBadge activo={registro.activo} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <RolBadge rol={registro.rol} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <p>
                <span className="text-texto/50">DNI</span>
                <br />
                {registro.dni ?? "-"}
              </p>
              <p>
                <span className="text-texto/50">Celular</span>
                <br />
                {registro.celular ?? "-"}
              </p>
            </div>
            <div className="mt-4">
              <Acciones staff={registro} cambiarEstado={cambiarEstado} editar={editar} verDetalle={verDetalle} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function Acciones({
  cambiarEstado,
  editar,
  staff,
  verDetalle
}: {
  cambiarEstado: (staff: Staff) => void;
  editar: (staff: Staff) => void;
  staff: Staff;
  verDetalle: (staff: Staff) => void;
}) {
  return (
    <div className="flex justify-end gap-2">
      <Button aria-label="Ver detalle" size="icon" title="Ver detalle" type="button" variant="ghost" onClick={() => verDetalle(staff)}>
        <Eye className="h-4 w-4" />
      </Button>
      <Button aria-label="Editar" size="icon" title="Editar" type="button" variant="ghost" onClick={() => editar(staff)}>
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        aria-label={staff.activo ? "Inactivar" : "Activar"}
        className={staff.activo ? "text-red-600 hover:bg-red-500/10" : "text-exito hover:bg-exito/10"}
        size="icon"
        title={staff.activo ? "Inactivar" : "Activar"}
        type="button"
        variant="ghost"
        onClick={() => cambiarEstado(staff)}
      >
        {staff.activo ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
      </Button>
    </div>
  );
}

function StaffModal({
  cerrar,
  guardado,
  modo,
  staff
}: {
  cerrar: () => void;
  guardado: () => Promise<void>;
  modo: "crear" | "editar";
  staff?: Staff;
}) {
  const [errores, setErrores] = useState<FormErrores>({});
  const [guardando, setGuardando] = useState(false);

  async function enviarFormulario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const valores = {
      nombres: String(formData.get("nombres") ?? ""),
      apellidos: String(formData.get("apellidos") ?? ""),
      correo: String(formData.get("correo") ?? ""),
      dni: String(formData.get("dni") ?? ""),
      celular: String(formData.get("celular") ?? ""),
      direccion: String(formData.get("direccion") ?? ""),
      rol: String(formData.get("rol") ?? ""),
      contrasena: String(formData.get("contrasena") ?? ""),
      activo: formData.get("activo") === "on"
    };
    const validacion = modo === "crear" ? crearStaffSchema.safeParse(valores) : editarStaffSchema.safeParse(valores);

    if (!validacion.success) {
      setErrores(Object.fromEntries(validacion.error.issues.map((issue) => [issue.path[0], issue.message])));
      return;
    }

    try {
      setErrores({});
      setGuardando(true);
      const payloadBase = {
        nombres: validacion.data.nombres,
        apellidos: validacion.data.apellidos,
        correo: validacion.data.correo,
        dni: normalizarOpcional(validacion.data.dni),
        celular: normalizarOpcional(validacion.data.celular),
        direccion: normalizarOpcional(validacion.data.direccion),
        rol: validacion.data.rol
      };

      if (modo === "crear") {
        const datosCrear = validacion.data as z.infer<typeof crearStaffSchema>;
        await crearStaff({
          ...payloadBase,
          contrasena: datosCrear.contrasena,
          activo: datosCrear.activo
        });
      } else if (staff) {
        await actualizarStaff(staff.id, payloadBase);
      }

      await guardado();
    } catch (error) {
      setErrores({ general: obtenerMensajeError(error, "No pudimos guardar el staff. Revisa duplicados o validaciones.") });
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
            <h2 className="text-xl font-bold">{modo === "crear" ? "Nuevo staff" : "Editar staff"}</h2>
            <p className="text-sm text-texto/60">Gestión administrativa de usuarios internos.</p>
          </div>
          <Button aria-label="Cerrar" size="icon" type="button" variant="ghost" onClick={cerrar}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input defaultValue={staff?.nombres} error={errores.nombres} label="Nombres" name="nombres" />
          <Input defaultValue={staff?.apellidos} error={errores.apellidos} label="Apellidos" name="apellidos" />
          <Input defaultValue={staff?.correo} error={errores.correo} label="Correo" name="correo" type="email" />
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-texto/78">Rol</span>
            <select
              className={cn(
                "h-11 w-full rounded-md border border-borde bg-superficie px-3 text-sm text-texto outline-none transition focus:border-primario focus:ring-2 focus:ring-primario/18",
                errores.rol && "border-red-500 focus:border-red-500 focus:ring-red-500/18"
              )}
              defaultValue={staff?.rol ?? "VETERINARIO"}
              name="rol"
            >
              {rolesStaff.map((item) => (
                <option key={item} value={item}>
                  {etiquetaRol(item)}
                </option>
              ))}
            </select>
            {errores.rol ? <span className="mt-1.5 block text-xs font-medium text-red-600">{errores.rol}</span> : null}
          </label>
          <Input defaultValue={staff?.dni ?? ""} error={errores.dni} inputMode="numeric" label="DNI" name="dni" />
          <Input defaultValue={staff?.celular ?? ""} error={errores.celular} inputMode="numeric" label="Celular" name="celular" />
          <Input defaultValue={staff?.direccion ?? ""} error={errores.direccion} label="Direccion" name="direccion" />
          {modo === "crear" ? (
            <Input error={errores.contrasena} label="Contrasena inicial" name="contrasena" type="password" />
          ) : null}
          {modo === "crear" ? (
            <label className="flex items-center gap-3 rounded-md border border-borde bg-fondo px-3 py-3 text-sm font-semibold">
              <input defaultChecked name="activo" type="checkbox" />
              Staff activo
            </label>
          ) : null}
        </div>
        {errores.general ? <p className="mt-4 text-sm font-semibold text-red-600">{errores.general}</p> : null}
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={cerrar}>
            Cancelar
          </Button>
          <Button loading={guardando} type="submit">
            {!guardando ? <Check className="h-4 w-4" /> : null}
            Guardar
          </Button>
        </div>
      </motion.form>
    </motion.div>
  );
}

function DetalleStaff({ cerrar, staff }: { cerrar: () => void; staff: Staff }) {
  return (
    <motion.div className="fixed inset-0 z-50 flex justify-end bg-slate-950/55" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.aside className="h-full w-full max-w-md overflow-y-auto bg-superficie p-5" initial={{ x: 420 }} animate={{ x: 0 }} exit={{ x: 420 }}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Detalle staff</h2>
          <Button aria-label="Cerrar" size="icon" type="button" variant="ghost" onClick={cerrar}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="space-y-4 text-sm">
          <DetalleItem label="Nombre" value={`${staff.nombres} ${staff.apellidos}`} />
          <DetalleItem label="Rol" value={etiquetaRol(staff.rol)} />
          <DetalleItem label="Estado" value={staff.activo ? "Activo" : "Inactivo"} />
          <DetalleItem label="Correo" value={staff.correo} />
          <DetalleItem label="DNI" value={staff.dni ?? "-"} />
          <DetalleItem label="Celular" value={staff.celular ?? "-"} />
          <DetalleItem label="Direccion" value={staff.direccion ?? "-"} />
          <DetalleItem label="Ultimo acceso" value={formatearFecha(staff.ultimoAccesoEn)} />
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

function RolBadge({ rol }: { rol: RolStaff }) {
  const estilos: Record<RolStaff, string> = {
    ADMIN: "bg-primario/10 text-primario",
    VETERINARIO: "bg-exito/10 text-exito",
    SECRETARIA: "bg-secundario/20 text-texto"
  };

  return <span className={cn("rounded-md px-2 py-1 text-xs font-bold", estilos[rol])}>{etiquetaRol(rol)}</span>;
}

function EstadoBadge({ activo }: { activo: boolean }) {
  return (
    <span className={cn("rounded-md px-2 py-1 text-xs font-bold", activo ? "bg-exito/10 text-exito" : "bg-red-500/10 text-red-600")}>
      {activo ? "ACTIVO" : "INACTIVO"}
    </span>
  );
}

function ToastView({ toast }: { toast?: Toast }) {
  return (
    <AnimatePresence>
      {toast ? (
        <motion.div
          className={cn(
            "fixed right-4 top-4 z-50 max-w-[calc(100vw-2rem)] rounded-md px-4 py-3 text-sm font-semibold text-white shadow-lg",
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

function etiquetaRol(rol: RolStaff) {
  const etiquetas: Record<RolStaff, string> = {
    ADMIN: "ADMIN",
    VETERINARIO: "VETERINARIO",
    SECRETARIA: "SECRETARIA"
  };

  return etiquetas[rol];
}

function normalizarOpcional(valor?: string) {
  const normalizado = valor?.trim();
  return normalizado || undefined;
}

function formatearFecha(valor: string | null) {
  if (!valor) {
    return "-";
  }

  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(valor));
}

function obtenerMensajeError(error: unknown, fallback: string) {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  const data = error.response?.data as { message?: string | string[]; error?: string } | undefined;
  const mensaje = data?.message;

  if (Array.isArray(mensaje)) {
    return mensaje.join(" ");
  }

  return mensaje || data?.error || fallback;
}
