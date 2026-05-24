"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Eye, Loader2, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import {
  actualizarCliente,
  crearCliente,
  eliminarCliente,
  listarClientes,
  type Cliente,
  type ClientesMeta
} from "@/services/clientes";
import { celularPeruSchema, correoSchema, dniSchema } from "@/validators/peru";

const clienteSchema = z.object({
  nombres: z.string().min(2, "Ingresa nombres validos."),
  apellidos: z.string().min(2, "Ingresa apellidos validos."),
  dni: dniSchema,
  celular: celularPeruSchema,
  correo: correoSchema,
  direccion: z.string().max(160, "Maximo 160 caracteres.").optional(),
  contrasena: z.union([
    z.literal(""),
    z
      .string()
      .min(8, "Minimo 8 caracteres.")
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, "Incluye mayuscula, minuscula y numero.")
  ]),
  activo: z.boolean()
});

type EstadoFiltro = "todos" | "activos" | "inactivos";
type Toast = { tipo: "exito" | "error"; mensaje: string };
type FormErrores = Partial<Record<keyof z.infer<typeof clienteSchema> | "general", string>>;

const metaInicial: ClientesMeta = {
  pagina: 1,
  limite: 10,
  total: 0,
  totalPaginas: 1
};

export function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [meta, setMeta] = useState<ClientesMeta>(metaInicial);
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState<EstadoFiltro>("activos");
  const [pagina, setPagina] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState<{ modo: "crear" | "editar"; cliente?: Cliente }>();
  const [detalle, setDetalle] = useState<Cliente>();
  const [toast, setToast] = useState<Toast>();

  const busquedaNormalizada = useMemo(() => busqueda.trim(), [busqueda]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void cargarClientes();
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [pagina, estado, busquedaNormalizada]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = window.setTimeout(() => setToast(undefined), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  async function cargarClientes() {
    try {
      setCargando(true);
      const respuesta = await listarClientes({
        pagina,
        limite: meta.limite,
        busqueda: busquedaNormalizada || undefined,
        estado
      });
      setClientes(respuesta.datos);
      setMeta(respuesta.meta);
    } catch {
      setToast({ tipo: "error", mensaje: "No pudimos cargar los clientes." });
    } finally {
      setCargando(false);
    }
  }

  async function confirmarEliminar(cliente: Cliente) {
    const confirmado = window.confirm(`Eliminar a ${cliente.nombres} ${cliente.apellidos}?`);

    if (!confirmado) {
      return;
    }

    try {
      await eliminarCliente(cliente.id);
      setToast({ tipo: "exito", mensaje: "Cliente eliminado correctamente." });
      await cargarClientes();
    } catch {
      setToast({ tipo: "error", mensaje: "No pudimos eliminar el cliente." });
    }
  }

  return (
    <div className="space-y-5">
      <ToastView toast={toast} />
      <section className="rounded-md border border-borde bg-superficie p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-bold">Gestion de clientes</h2>
            <p className="mt-1 text-sm text-texto/60">Administra clientes activos, datos de contacto y acceso base.</p>
          </div>
          <Button type="button" onClick={() => setModal({ modo: "crear" })}>
            <Plus className="h-4 w-4" />
            Nuevo cliente
          </Button>
        </div>
        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-texto/40" />
            <input
              className="h-11 w-full rounded-md border border-borde bg-fondo pl-10 pr-3 text-sm outline-none transition focus:border-primario focus:ring-2 focus:ring-primario/18"
              placeholder="Buscar por nombre, DNI, correo o celular"
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
              setEstado(event.target.value as EstadoFiltro);
            }}
          >
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
            <option value="todos">Todos</option>
          </select>
        </div>
      </section>

      <ClientesTable
        cargando={cargando}
        clientes={clientes}
        editar={(cliente) => setModal({ modo: "editar", cliente })}
        eliminar={confirmarEliminar}
        verDetalle={setDetalle}
      />

      <div className="flex flex-col gap-3 rounded-md border border-borde bg-superficie p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-texto/60">
          {meta.total} clientes - pagina {meta.pagina} de {meta.totalPaginas}
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
          <ClienteModal
            cliente={modal.cliente}
            modo={modal.modo}
            cerrar={() => setModal(undefined)}
            guardado={async () => {
              setModal(undefined);
              setToast({ tipo: "exito", mensaje: modal.modo === "crear" ? "Cliente creado." : "Cliente actualizado." });
              await cargarClientes();
            }}
          />
        ) : null}
        {detalle ? <DetalleCliente cliente={detalle} cerrar={() => setDetalle(undefined)} /> : null}
      </AnimatePresence>
    </div>
  );
}

function ClientesTable({
  cargando,
  clientes,
  editar,
  eliminar,
  verDetalle
}: {
  cargando: boolean;
  clientes: Cliente[];
  editar: (cliente: Cliente) => void;
  eliminar: (cliente: Cliente) => void;
  verDetalle: (cliente: Cliente) => void;
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

  if (!clientes.length) {
    return (
      <div className="rounded-md border border-borde bg-superficie p-8 text-center">
        <h3 className="text-lg font-bold">Sin clientes</h3>
        <p className="mt-2 text-sm text-texto/60">Ajusta la busqueda o crea el primer cliente.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-borde bg-superficie">
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[860px] border-collapse text-left text-sm">
          <thead className="bg-fondo text-xs uppercase text-texto/55">
            <tr>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">DNI</th>
              <th className="px-4 py-3">Celular</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente.id} className="border-t border-borde">
                <td className="px-4 py-3">
                  <p className="font-bold">{cliente.nombres} {cliente.apellidos}</p>
                  <p className="text-xs text-texto/55">{cliente.correo}</p>
                </td>
                <td className="px-4 py-3">{cliente.dni}</td>
                <td className="px-4 py-3">{cliente.celular}</td>
                <td className="px-4 py-3">
                  <EstadoBadge activo={cliente.activo} />
                </td>
                <td className="px-4 py-3">
                  <Acciones cliente={cliente} editar={editar} eliminar={eliminar} verDetalle={verDetalle} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 p-3 lg:hidden">
        {clientes.map((cliente) => (
          <article key={cliente.id} className="rounded-md border border-borde bg-fondo p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold">{cliente.nombres} {cliente.apellidos}</h3>
                <p className="mt-1 text-sm text-texto/60">{cliente.correo}</p>
              </div>
              <EstadoBadge activo={cliente.activo} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <p><span className="text-texto/50">DNI</span><br />{cliente.dni}</p>
              <p><span className="text-texto/50">Celular</span><br />{cliente.celular}</p>
            </div>
            <div className="mt-4">
              <Acciones cliente={cliente} editar={editar} eliminar={eliminar} verDetalle={verDetalle} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function Acciones({
  cliente,
  editar,
  eliminar,
  verDetalle
}: {
  cliente: Cliente;
  editar: (cliente: Cliente) => void;
  eliminar: (cliente: Cliente) => void;
  verDetalle: (cliente: Cliente) => void;
}) {
  return (
    <div className="flex justify-end gap-2">
      <Button aria-label="Ver detalle" size="icon" title="Ver detalle" type="button" variant="ghost" onClick={() => verDetalle(cliente)}>
        <Eye className="h-4 w-4" />
      </Button>
      <Button aria-label="Editar" size="icon" title="Editar" type="button" variant="ghost" onClick={() => editar(cliente)}>
        <Pencil className="h-4 w-4" />
      </Button>
      <Button aria-label="Eliminar" className="text-red-600 hover:bg-red-500/10" size="icon" title="Eliminar" type="button" variant="ghost" onClick={() => eliminar(cliente)}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

function ClienteModal({
  cerrar,
  cliente,
  guardado,
  modo
}: {
  cerrar: () => void;
  cliente?: Cliente;
  guardado: () => Promise<void>;
  modo: "crear" | "editar";
}) {
  const [errores, setErrores] = useState<FormErrores>({});
  const [guardando, setGuardando] = useState(false);

  async function enviarFormulario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const validacion = clienteSchema.safeParse({
      nombres: String(formData.get("nombres") ?? ""),
      apellidos: String(formData.get("apellidos") ?? ""),
      dni: String(formData.get("dni") ?? ""),
      celular: String(formData.get("celular") ?? ""),
      correo: String(formData.get("correo") ?? ""),
      direccion: String(formData.get("direccion") ?? ""),
      contrasena: String(formData.get("contrasena") ?? ""),
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

        nombres: validacion.data.nombres,
        apellidos: validacion.data.apellidos,
        dni: validacion.data.dni,
        celular: validacion.data.celular,
        correo: validacion.data.correo,
        direccion: validacion.data.direccion || undefined,
        contrasena: validacion.data.contrasena || undefined,
        activo: validacion.data.activo
        /*
        ...validacion.data,
        direccion: validacion.data.direccion || undefined,
        contrasena: validacion.data.contrasena || undefined
        */
      };

      if (modo === "crear") {
        await crearCliente(payload);
      } else if (cliente) {
        await actualizarCliente(cliente.id, payload);
      }

      await guardado();
    } catch {
      setErrores({ general: "No pudimos guardar el cliente. Revisa duplicados o validaciones." });
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
            <h2 className="text-xl font-bold">{modo === "crear" ? "Nuevo cliente" : "Editar cliente"}</h2>
            <p className="text-sm text-texto/60">Valida DNI, celular y correo antes de guardar.</p>
          </div>
          <Button aria-label="Cerrar" size="icon" type="button" variant="ghost" onClick={cerrar}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input defaultValue={cliente?.nombres} error={errores.nombres} label="Nombres" name="nombres" />
          <Input defaultValue={cliente?.apellidos} error={errores.apellidos} label="Apellidos" name="apellidos" />
          <Input defaultValue={cliente?.dni ?? ""} error={errores.dni} inputMode="numeric" label="DNI" name="dni" />
          <Input defaultValue={cliente?.celular ?? ""} error={errores.celular} inputMode="numeric" label="Celular" name="celular" />
          <Input defaultValue={cliente?.correo} error={errores.correo} label="Correo" name="correo" type="email" />
          <Input defaultValue={cliente?.direccion ?? ""} error={errores.direccion} label="Direccion" name="direccion" />
          <Input error={errores.contrasena} label={modo === "crear" ? "Contrasena inicial" : "Nueva contrasena"} name="contrasena" type="password" />
          <label className="flex items-center gap-3 rounded-md border border-borde bg-fondo px-3 py-3 text-sm font-semibold">
            <input defaultChecked={cliente?.activo ?? true} name="activo" type="checkbox" />
            Cliente activo
          </label>
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

function DetalleCliente({ cerrar, cliente }: { cerrar: () => void; cliente: Cliente }) {
  return (
    <motion.div className="fixed inset-0 z-50 flex justify-end bg-slate-950/55" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.aside className="h-full w-full max-w-md overflow-y-auto bg-superficie p-5" initial={{ x: 420 }} animate={{ x: 0 }} exit={{ x: 420 }}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Detalle cliente</h2>
          <Button aria-label="Cerrar" size="icon" type="button" variant="ghost" onClick={cerrar}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="space-y-4 text-sm">
          <DetalleItem label="Nombre" value={`${cliente.nombres} ${cliente.apellidos}`} />
          <DetalleItem label="DNI" value={cliente.dni ?? "-"} />
          <DetalleItem label="Celular" value={cliente.celular ?? "-"} />
          <DetalleItem label="Correo" value={cliente.correo} />
          <DetalleItem label="Direccion" value={cliente.direccion ?? "-"} />
          <DetalleItem label="Estado" value={cliente.activo ? "Activo" : "Inactivo"} />
        </div>
      </motion.aside>
    </motion.div>
  );
}

function DetalleItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-borde bg-fondo p-3">
      <p className="text-xs font-bold uppercase text-texto/45">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
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
