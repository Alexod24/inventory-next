import { NextRequest, NextResponse } from "next/server";
import { getUser, updateSession } from "./app/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const protectedRoutesList = ["/dashboard", "/profile"]; // Ejemplo de rutas protegidas
  const authRoutesList = ["/login", "/register"];
  const currentPath = new URL(request.url).pathname;

  // Actualizar sesión
  await updateSession(request);

  // Obtener usuario
  const {
    data: { user },
    error,
  } = await getUser(request, NextResponse.next());

  if (error) {
    console.error("Error al obtener usuario:", error);
  }

  // Manejar redirección para rutas protegidas
  if (protectedRoutesList.includes(currentPath) && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Evitar que usuarios autenticados accedan a páginas públicas
  if (authRoutesList.includes(currentPath) && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Permitir acceso
  return NextResponse.next();
}

// Configuración del matcher
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"], // Captura rutas dinámicas
};
