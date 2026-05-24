import { FileSearch } from "lucide-react";

type EmptyStateProps = {
  titulo: string;
  descripcion: string;
};

export function EmptyState({ titulo, descripcion }: EmptyStateProps) {
  return (
    <div className="w-full max-w-md text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-md border border-borde bg-superficie">
        <FileSearch className="h-7 w-7 text-primario" />
      </div>
      <h2 className="text-xl font-semibold">{titulo}</h2>
      <p className="mt-2 text-sm leading-6 text-texto/68">{descripcion}</p>
    </div>
  );
}
