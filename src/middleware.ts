import { NextRequest, NextResponse } from "next/server";
import { getUser, updateSession } from "./app/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const protectedRoutesList = ["/dashboard", "/profile"]; // Rutas que requieren autenticación
  const authRoutesList = ["/login", "/register"]; // Rutas públicas para no autenticados
  const currentPath = new URL(request.url).pathname;

  console.log("Middleware ejecutado para la ruta:", currentPath);

  // Actualizar sesión
  await updateSession(request);
  console.log("Cookies después de updateSession:", request.cookies.getAll());

  // Obtener usuario
  const {
    data: { user },
    error,
  } = await getUser(request, NextResponse.next());

  if (error) {
    console.error("Error al obtener usuario:", error);
  } else {
    console.log("Usuario obtenido:", user);
  }

  // Redirección para rutas protegidas
  if (protectedRoutesList.includes(currentPath) && !user) {
    console.log("Redirigiendo a login: Usuario no autenticado");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Evitar que usuarios autenticados accedan a rutas públicas
  if (authRoutesList.includes(currentPath) && user) {
    console.log("Redirigiendo a dashboard: Usuario ya autenticado");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Permitir acceso
  return NextResponse.next();
}

// Configuración del matcher
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"], // Captura rutas dinámicas
};
