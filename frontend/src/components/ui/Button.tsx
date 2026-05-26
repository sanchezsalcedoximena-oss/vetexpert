import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const estilosBoton = cva(
  "inline-flex min-w-0 items-center justify-center gap-2 rounded-md text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primario text-white hover:bg-primario/90 focus-visible:outline-primario",
        secondary: "bg-secundario text-slate-950 hover:bg-secundario/90 focus-visible:outline-secundario",
        ghost: "text-texto hover:bg-primario/10 focus-visible:outline-primario",
        destructive: "bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600"
      },
      size: {
        default: "h-10 px-4",
        sm: "h-9 px-3",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "default"
    }
  }
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof estilosBoton> & {
    asChild?: boolean;
    loading?: boolean;
  };

export function Button({ asChild, children, className, disabled, loading, size, variant, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp className={cn(estilosBoton({ className, size, variant }))} disabled={disabled || loading} {...props}>
      {loading ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> : null}
      {children}
    </Comp>
  );
}
