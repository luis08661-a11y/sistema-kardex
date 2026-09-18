import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "siskardex_session";

const secret = process.env.AUTH_SECRET;

if (!secret) {
  throw new Error("AUTH_SECRET no está configurado");
}

const SECRET_KEY = new TextEncoder().encode(secret);

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;

  const pathname = request.nextUrl.pathname;

  // Rutas públicas
  const publicRoutes = [
    "/login",
  ];

  const isPublicRoute = publicRoutes.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`)
  );

  // Si está en una ruta pública
  if (isPublicRoute) {
    // Si ya tiene sesión, no permitir volver al login
    if (token) {
      try {
        await jwtVerify(token, SECRET_KEY);

        return NextResponse.redirect(
          new URL("/dashboard", request.url)
        );
      } catch {
        // Token inválido → permitir entrar al login
        return NextResponse.next();
      }
    }

    return NextResponse.next();
  }

  // Verificar sesión para rutas privadas
  if (!token) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  try {
    await jwtVerify(token, SECRET_KEY);

    return NextResponse.next();
  } catch {
    // JWT inválido o expirado
    const response = NextResponse.redirect(
      new URL("/login", request.url)
    );

    // Eliminamos la cookie inválida
    response.cookies.delete(COOKIE_NAME);

    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Ejecutar en todas las rutas excepto:
     * - _next/static
     * - _next/image
     * - favicon.ico
     * - archivos públicos
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};