import type { ReactNode } from "react";

type AuthShellProps = {
  titulo: string;
  descripcion: string;
  children: ReactNode;
};

export function AuthShell({ children, descripcion, titulo }: AuthShellProps) {
  return (
    <main className="min-h-screen bg-fondo text-texto">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="hidden bg-primario px-10 py-8 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="text-lg font-bold">VetExpert</div>
          <div className="max-w-md">
            <p className="text-sm font-semibold uppercase tracking-normal text-white/72">
              Gestion veterinaria segura
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-tight">
              Acceso protegido para staff y clientes.
            </h1>
            <p className="mt-4 text-base leading-7 text-white/76">
              Autenticacion modular con JWT, refresh token y roles preparados para crecer con el sistema.
            </p>
          </div>
          <div className="text-sm text-white/70">Fase 02 - Autenticacion</div>
        </section>
        <section className="flex items-center justify-center px-4 py-8 sm:px-6">
          <div className="w-full max-w-md">
            <div className="mb-7">
              <p className="text-sm font-bold text-primario">VetExpert</p>
              <h2 className="mt-2 text-2xl font-bold">{titulo}</h2>
              <p className="mt-2 text-sm leading-6 text-texto/68">{descripcion}</p>
            </div>
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
