import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { EmptyState } from "@/components/ui/EmptyState";
import { GlobalLoader } from "@/components/ui/GlobalLoader";

export default function InicioPage() {
  return (
    <main className="min-h-screen bg-fondo text-texto">
      <GlobalLoader visible={false} />
      <div className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 md:grid-cols-[260px_1fr]">
        <Sidebar />
        <section className="flex min-w-0 flex-col">
          <Navbar titulo="Arquitectura base" />
          <div className="flex flex-1 items-center justify-center p-4 md:p-8">
            <EmptyState
              titulo="VetExpert listo para construir"
              descripcion="La base modular del sistema esta preparada para las siguientes fases."
            />
          </div>
        </section>
      </div>
    </main>
  );
}
