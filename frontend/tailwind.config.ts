import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/modules/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        fondo: "hsl(var(--fondo))",
        superficie: "hsl(var(--superficie))",
        borde: "hsl(var(--borde))",
        texto: "hsl(var(--texto))",
        primario: "hsl(var(--primario))",
        secundario: "hsl(var(--secundario))",
        exito: "hsl(var(--exito))"
      },
      borderRadius: {
        sm: "6px",
        md: "8px"
      }
    }
  },
  plugins: []
};

export default config;
