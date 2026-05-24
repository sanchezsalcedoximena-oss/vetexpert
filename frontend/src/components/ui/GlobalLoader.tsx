"use client";

import { motion } from "framer-motion";

type GlobalLoaderProps = {
  visible: boolean;
  texto?: string;
};

export function GlobalLoader({ texto = "Cargando sistema...", visible }: GlobalLoaderProps) {
  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-fondo/92 backdrop-blur">
      <div className="text-center">
        <motion.div
          aria-hidden
          className="mx-auto mb-4 h-12 w-20 rounded-full bg-primario"
          animate={{ x: [0, 18, 0], scaleY: [1, 0.92, 1] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
        />
        <p className="text-sm font-semibold text-texto">{texto}</p>
      </div>
    </div>
  );
}
