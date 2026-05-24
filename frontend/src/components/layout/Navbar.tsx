import { Bell, Moon, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";

type NavbarProps = {
  titulo: string;
};

export function Navbar({ titulo }: NavbarProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-borde bg-superficie/95 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-normal text-primario">VetExpert</p>
          <h1 className="truncate text-lg font-semibold md:text-xl">{titulo}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button aria-label="Buscar" title="Buscar" variant="ghost" size="icon">
            <Search className="h-5 w-5" />
          </Button>
          <Button aria-label="Cambiar tema" title="Cambiar tema" variant="ghost" size="icon">
            <Moon className="h-5 w-5" />
          </Button>
          <Button aria-label="Notificaciones" title="Notificaciones" variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
