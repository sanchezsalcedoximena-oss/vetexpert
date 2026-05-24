import { Construction } from "lucide-react";

type PlaceholderPanelProps = {
  titulo: string;
  descripcion: string;
};

export function PlaceholderPanel({ descripcion, titulo }: PlaceholderPanelProps) {
  return (
    <section className="rounded-md border border-borde bg-superficie p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primario/12 text-primario">
        <Construction className="h-6 w-6" />
      </div>
      <h2 className="mt-5 text-xl font-bold">{titulo}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-texto/65">{descripcion}</p>
    </section>
  );
}
