"use client";

import { useEffect, useState } from "react";

export function useMobile(breakpoint = 768) {
  const [esMobile, setEsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const actualizar = () => setEsMobile(mediaQuery.matches);

    actualizar();
    mediaQuery.addEventListener("change", actualizar);

    return () => mediaQuery.removeEventListener("change", actualizar);
  }, [breakpoint]);

  return esMobile;
}
