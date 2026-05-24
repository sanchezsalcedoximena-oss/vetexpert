import { NextResponse, type NextRequest } from "next/server";

const rutasAuth = ["/login", "/registro", "/recuperar", "/staff/login", "/portal/login", "/portal/registro"];
const rutasProtegidas = ["/dashboard"];

export function proxy(request: NextRequest) {
  const token = request.cookies.get("vetexpert_access_token")?.value;
  const pathname = request.nextUrl.pathname;
  const esRutaAuth = rutasAuth.some((ruta) => pathname.startsWith(ruta));
  const esRutaProtegida = rutasProtegidas.some((ruta) => pathname.startsWith(ruta));

  if (!token && esRutaProtegida) {
    return NextResponse.redirect(new URL("/staff/login", request.url));
  }

  if (token && esRutaAuth) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/registro", "/recuperar", "/staff/login", "/portal/login", "/portal/registro", "/dashboard/:path*"]
};
