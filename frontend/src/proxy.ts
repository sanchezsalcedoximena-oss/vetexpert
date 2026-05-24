import { NextResponse, type NextRequest } from "next/server";

const rutasAuth = ["/login", "/registro", "/recuperar"];

export function proxy(request: NextRequest) {
  const token = request.cookies.get("vetexpert_access_token")?.value;
  const pathname = request.nextUrl.pathname;
  const esRutaAuth = rutasAuth.some((ruta) => pathname.startsWith(ruta));

  if (token && esRutaAuth) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/registro", "/recuperar"]
};
