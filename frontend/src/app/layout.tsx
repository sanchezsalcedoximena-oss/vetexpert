import type { Metadata } from "next";
import "./globals.css";
import { Proveedores } from "./providers";

export const metadata: Metadata = {
  title: "VetExpert",
  description: "Sistema veterinario integral"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <Proveedores>{children}</Proveedores>
      </body>
    </html>
  );
}
