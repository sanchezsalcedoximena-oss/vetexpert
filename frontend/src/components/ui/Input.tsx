import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function Input({ className, error, id, label, ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <label className="block" htmlFor={inputId}>
      <span className="mb-1.5 block text-sm font-medium text-texto/78">{label}</span>
      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={error && inputId ? `${inputId}-error` : undefined}
        className={cn(
          "h-11 w-full rounded-md border border-borde bg-superficie px-3 text-sm text-texto outline-none transition placeholder:text-texto/38 focus:border-primario focus:ring-2 focus:ring-primario/18",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/18",
          className
        )}
        {...props}
      />
      {error ? (
        <span id={inputId ? `${inputId}-error` : undefined} className="mt-1.5 block text-xs font-medium text-red-600">
          {error}
        </span>
      ) : null}
    </label>
  );
}
