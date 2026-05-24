"use client";

import { motion } from "framer-motion";
import {
  CalendarDays,
  ChevronRight,
  HeartPulse,
  Home,
  LogOut,
  Menu,
  Moon,
  PawPrint,
  Search,
  Stethoscope,
  Sun,
  Users,
  X
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { GlobalLoader } from "@/components/ui/GlobalLoader";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

type RolDashboard = "ADMIN" | "SECRETARIA" | "VETERINARIO" | "CLIENTE";

const enlacesBase: Array<{
  nombre: string;
  href: string;
  icono: LucideIcon;
  roles: RolDashboard[];
}> = [
  { nombre: "Dashboard", href: "/dashboard", icono: Home, roles: ["ADMIN", "SECRETARIA", "VETERINARIO", "CLIENTE"] },
  { nombre: "Clientes", href: "/dashboard/clientes", icono: Users, roles: ["ADMIN", "SECRETARIA"] },
  { nombre: "Mascotas", href: "/dashboard/mascotas", icono: PawPrint, roles: ["ADMIN", "SECRETARIA", "VETERINARIO", "CLIENTE"] },
  { nombre: "Citas", href: "/dashboard/citas", icono: CalendarDays, roles: ["ADMIN", "SECRETARIA", "VETERINARIO", "CLIENTE"] }
];

type DashboardShellProps = {
  children: ReactNode;
  titulo: string;
  descripcion: string;
};

export function DashboardShell({ children, descripcion, titulo }: DashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const usuario = useAuthStore((state) => state.usuario);
  const hidratado = useAuthStore((state) => state.hidratado);
  const hidratarSesion = useAuthStore((state) => state.hidratarSesion);
  const cerrarSesion = useAuthStore((state) => state.cerrarSesion);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    hidratarSesion();
  }, [hidratarSesion]);

  useEffect(() => {
    const preferencia = localStorage.getItem("vetexpert_tema");
    const activo = preferencia === "dark";
    setDarkMode(activo);
    document.documentElement.classList.toggle("dark", activo);
  }, []);

  useEffect(() => {
    if (hidratado && !usuario) {
      router.replace("/staff/login");
    }
  }, [hidratado, router, usuario]);

  const enlaces = useMemo(
    () => enlacesBase.filter((enlace) => (usuario ? enlace.roles.includes(usuario.rol) : true)),
    [usuario]
  );

  function alternarTema() {
    const nuevoValor = !darkMode;
    setDarkMode(nuevoValor);
    document.documentElement.classList.toggle("dark", nuevoValor);
    localStorage.setItem("vetexpert_tema", nuevoValor ? "dark" : "light");
  }

  function salir() {
    cerrarSesion();
    router.replace("/");
  }

  if (!hidratado || !usuario) {
    return <GlobalLoader visible texto="Cargando sistema..." />;
  }

  return (
    <main className="min-h-screen bg-fondo text-texto">
      <div className="flex min-h-screen">
        <Sidebar
          enlaces={enlaces}
          menuAbierto={menuAbierto}
          pathname={pathname}
          cerrarMenu={() => setMenuAbierto(false)}
          salir={salir}
        />
        <section className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-borde bg-superficie/92 px-4 py-3 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <Button aria-label="Abrir menu" className="md:hidden" size="icon" type="button" variant="ghost" onClick={() => setMenuAbierto(true)}>
                  <Menu className="h-5 w-5" />
                </Button>
                <div className="min-w-0">
                  <div className="flex items-center gap-1 text-xs font-semibold text-texto/55">
                    VetExpert <ChevronRight className="h-3 w-3" /> Sistema interno
                  </div>
                  <h1 className="truncate text-lg font-bold md:text-xl">{titulo}</h1>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button aria-label="Buscar" size="icon" title="Buscar" type="button" variant="ghost">
                  <Search className="h-5 w-5" />
                </Button>
                <Button aria-label="Cambiar tema" size="icon" title="Cambiar tema" type="button" variant="ghost" onClick={alternarTema}>
                  {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
                <div className="hidden items-center gap-3 rounded-md border border-borde bg-fondo px-3 py-2 sm:flex">
                  <Avatar nombre={usuario.nombres} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{usuario.nombres}</p>
                    <p className="text-xs text-texto/55">{usuario.rol}</p>
                  </div>
                </div>
              </div>
            </div>
          </header>
          <div className="p-4 md:p-6">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <div className="mb-5">
                <p className="text-sm leading-6 text-texto/68">{descripcion}</p>
              </div>
              {children}
            </motion.div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Sidebar({
  cerrarMenu,
  enlaces,
  menuAbierto,
  pathname,
  salir
}: {
  cerrarMenu: () => void;
  enlaces: (typeof enlacesBase)[number][];
  menuAbierto: boolean;
  pathname: string;
  salir: () => void;
}) {
  return (
    <>
      <aside className="hidden w-72 shrink-0 border-r border-borde bg-superficie px-4 py-5 md:flex md:flex-col">
        <SidebarContent enlaces={enlaces} pathname={pathname} salir={salir} />
      </aside>
      {menuAbierto ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button aria-label="Cerrar menu" className="absolute inset-0 bg-slate-950/45" type="button" onClick={cerrarMenu} />
          <motion.aside
            className="relative flex h-full w-72 flex-col border-r border-borde bg-superficie px-4 py-5"
            initial={{ x: -288 }}
            animate={{ x: 0 }}
          >
            <div className="mb-4 flex justify-end">
              <Button aria-label="Cerrar menu" size="icon" type="button" variant="ghost" onClick={cerrarMenu}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <SidebarContent enlaces={enlaces} pathname={pathname} salir={salir} />
          </motion.aside>
        </div>
      ) : null}
    </>
  );
}

function SidebarContent({
  enlaces,
  pathname,
  salir
}: {
  enlaces: (typeof enlacesBase)[number][];
  pathname: string;
  salir: () => void;
}) {
  return (
    <>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primario text-white">
          <HeartPulse className="h-6 w-6" />
        </div>
        <div>
          <p className="font-bold">VetExpert</p>
          <p className="text-xs text-texto/55">Panel veterinario</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1">
        {enlaces.map((enlace) => {
          const Icono = enlace.icono;
          const activo = pathname === enlace.href;

          return (
            <Link
              key={enlace.href}
              className={cn(
                "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold transition",
                activo ? "bg-primario text-white" : "text-texto/70 hover:bg-primario/10 hover:text-texto"
              )}
              href={enlace.href}
            >
              <Icono className="h-5 w-5" />
              {enlace.nombre}
            </Link>
          );
        })}
      </nav>
      <div className="rounded-md border border-borde bg-fondo p-3">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Stethoscope className="h-4 w-4 text-primario" />
          Operacion estable
        </div>
        <Skeleton className="mb-2 h-2 w-full" />
        <Skeleton className="h-2 w-2/3" />
      </div>
      <Button className="mt-4 w-full" type="button" variant="ghost" onClick={salir}>
        <LogOut className="h-4 w-4" />
        Cerrar sesion
      </Button>
    </>
  );
}

function Avatar({ nombre }: { nombre: string }) {
  const iniciales = nombre
    .split(" ")
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();

  return <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primario text-sm font-bold text-white">{iniciales}</div>;
}
