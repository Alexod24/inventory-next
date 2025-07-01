// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { Database } from "./types/supabase"; // Asegúrate de que esta ruta sea correcta para tu tipo Database

export async function middleware(request: NextRequest) {
  const currentPath = request.nextUrl.pathname;

  // <--- CAMBIO CLAVE: Permitir siempre el acceso a las rutas de restablecimiento de contraseña sin checks de autenticación ---
  // Estas rutas deben ser accesibles para usuarios autenticados y no autenticados,
  // ya que son parte del flujo de gestión de contraseña y no deben ser redirigidas por el middleware.
  if (currentPath === "/reset-password" || currentPath === "/update-password") {
    console.log(
      `[Middleware] Permitir acceso directo a ${currentPath} (flujo de restablecimiento de contraseña).`
    );
    // Crucial: No inicializar Supabase client ni llamar getUser() para estas rutas
    return NextResponse.next({ request: request });
  }
  // --- FIN CAMBIO CLAVE ---

  // Crea un nuevo objeto de respuesta que será retornado,
  // y que Supabase usará para establecer/actualizar las cookies.
  const response = NextResponse.next({
    request: request,
  });

  // Inicializa el cliente de Supabase para el lado del servidor (contexto del middleware).
  // Este cliente leerá automáticamente las cookies de la solicitud entrante
  // y escribirá las cookies actualizadas en la respuesta saliente.
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: "", ...options, maxAge: -1 });
        },
      },
    }
  );

  // Refresca la sesión del usuario.
  // Esta llamada es crucial: si la sesión ha expirado, Supabase intentará refrescarla
  // y automáticamente actualizará las cookies de sesión en el objeto 'response'.
  // También obtiene los datos del usuario actual.
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(); // Usa getUser directamente aquí

  console.log("Middleware ejecutado para la ruta:", currentPath);
  console.log(
    "Usuario obtenido en middleware (después de getUser):",
    user ? user.id : "null"
  );
  if (error) {
    console.error(
      "Error al obtener usuario en middleware (después de getUser):",
      error.message
    );
  }

  // --- REVISA Y EDITA ESTA LISTA DE RUTAS PROTEGIDAS ---
  const protectedRoutesList = [
    "/base", // Tu dashboard principal
    "/bienes",
    "/movimientos",
    "/reportes",
    "/documentos",
    "/espacios", // Si quieres proteger el menú padre
    "/espacios/phone-booth",
    "/espacios/el-hangar",
    "/espacios/bunkers",
    "/espacios/unidades",
    "/espacios/la-brigada",
    "/espacios/counter",
    "/espacios/limpieza",
    "/espacios/almacen",
    "/calendario",
    "/usuarios", // Asegúrate de que esta ruta esté protegida
    "/perfil", // Añadida ruta de perfil si no estaba explícitamente
  ];
  // --- FIN REVISIÓN ---

  // Rutas de autenticación que deben ser accesibles para no autenticados
  // y redirigir a autenticados (excepto las de restablecimiento de contraseña).
  const authRoutesList = ["/login", "/auth/callback", "/auth/confirm"];

  // Lógica de Redirección:

  // Caso 1: Usuario NO autenticado
  if (!user) {
    if (protectedRoutesList.includes(currentPath)) {
      console.log(
        "Redirigiendo a login: Usuario no autenticado intentó acceder a ruta protegida",
        currentPath
      );
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (authRoutesList.includes(currentPath) || currentPath === "/") {
      return response; // Permite el acceso
    }

    console.log(
      "Redirigiendo a login: Usuario no autenticado intentó acceder a ruta no autorizada/inexistente",
      currentPath
    );
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Caso 2: Usuario SÍ autenticado
  if (user) {
    if (authRoutesList.includes(currentPath)) {
      console.log(
        "Redirigiendo a /base: Usuario ya autenticado intentó acceder a ruta de autenticación",
        currentPath
      );
      const redirectUrl = new URL("/base", request.url);
      return NextResponse.redirect(redirectUrl);
    }
    // Para todas las demás rutas (protegidas, existentes, no existentes), permitir acceso.
    // Esto incluye /reset-password y /update-password para usuarios autenticados.
    return response;
  }

  return response;
}

// Configuración del matcher del middleware:
// Esto le dice a Next.js qué rutas debe interceptar el middleware.
// Hemos añadido exclusiones para archivos estáticos comunes en la carpeta 'public'.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files generated by Next.js)
     * - _next/image (image optimization files generated by Next.js)
     * - favicon.ico (favicon file)
     * - Cualquier otro archivo o carpeta estática en 'public/' que no necesite autenticación
     * (ej. /images/, /fonts/, /videos/, etc.)
     * - /api/ (si tienes APIs públicas que no requieren autenticación)
     */
    "/((?!_next/static|_next/image|favicon.ico|images/|test-image.jpg|api).*)",
  ],
};
