import { FileSearch } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  action?: ReactNode;
  className?: string;
  titulo: string;
  descripcion: string;
};

export function EmptyState({ action, className, titulo, descripcion }: EmptyStateProps) {
  return (
    <div className={cn("mx-auto w-full max-w-md rounded-md border border-dashed border-borde bg-fondo p-8 text-center", className)}>
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-md border border-borde bg-superficie">
        <FileSearch className="h-7 w-7 text-primario" />
      </div>
      <h2 className="text-xl font-semibold">{titulo}</h2>
      <p className="mt-2 text-sm leading-6 text-texto/68">{descripcion}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
