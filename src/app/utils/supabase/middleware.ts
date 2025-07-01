// src/app/utils/supabase/middleware.ts
// CORRECCIÓN: Cambiado el import a '@supabase/ssr'
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // Crea una respuesta inicial que será modificada con las cookies
  let response = NextResponse.next({
    request: request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, // Usar NEXT_PUBLIC_ si está en el .env.local
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // Usar NEXT_PUBLIC_ si está en el .env.local
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        // CORRECCIÓN CLAVE AQUÍ: setAll debe establecer las cookies en la 'response' que se retornará
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Esto intentará refrescar la sesión si es necesario y llamará a setAll
  await supabase.auth.getUser();

  // Retorna la respuesta con las cookies actualizadas
  return response;
}

export async function getUser(
  request: NextRequest,
  initialResponse: NextResponse
) {
  // Crea una respuesta mutable que será modificada con las cookies
  let response = initialResponse;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, // Usar NEXT_PUBLIC_ si está en el .env.local
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // Usar NEXT_PUBLIC_ si está en el .env.local
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        // CORRECCIÓN CLAVE AQUÍ: setAll debe establecer las cookies en la 'response' que se retornará
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Esto intentará refrescar la sesión si es necesario y llamará a setAll
  const { data, error } = await supabase.auth.getUser();

  // Retorna los datos del usuario y la respuesta modificada
  return { data, error, response }; // Ahora también devuelve la respuesta modificada
}
