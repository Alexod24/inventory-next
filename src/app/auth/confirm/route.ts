// src/app/auth/confirm/route.ts
// Este Route Handler procesa el enlace de confirmación de correo de Supabase.

import { createServerSupabaseClient } from "@/lib/supabaseServerClient"; // Importa tu cliente de Supabase para el servidor
import { NextResponse } from "next/server";
import { redirect } from "next/navigation"; // Para redirecciones server-side

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  // Define la ruta a la que quieres redirigir después de una confirmación exitosa
  // Puedes cambiar '/dashboard' a '/bienes' o la ruta que prefieras
  const redirectTo = searchParams.get("next") || "/base";

  console.log(
    `[auth/confirm/route.ts] Recibida solicitud de confirmación. Token: ${token_hash}, Tipo: ${type}`
  );

  if (token_hash && type) {
    try {
      // Inicializa el cliente de Supabase del lado del servidor
      const supabase = await createServerSupabaseClient();

      // Verifica el token OTP (One-Time Password) para confirmar el usuario
      // El 'type' puede ser 'email' para confirmaciones de registro o 'signup'
      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as any, // Casteamos a 'any' para manejar 'email' o 'signup'
      });

      if (!error) {
        console.log(
          `✅ [auth/confirm/route.ts] Confirmación exitosa para token: ${token_hash}. Redirigiendo a: ${redirectTo}`
        );
        // Redirige al usuario a la página deseada después de la confirmación exitosa
        redirect(redirectTo); // Redirección server-side
      } else {
        console.error(
          `❌ [auth/confirm/route.ts] Error en la verificación de OTP:`,
          error.message
        );
        // Si hay un error, redirige a una página de error o al login con un mensaje
        redirect(
          `/login?error=${encodeURIComponent(
            "Error al confirmar tu correo. Por favor, intenta de nuevo o contacta soporte."
          )}`
        );
      }
    } catch (e: any) {
      console.error(
        `🛑 [auth/confirm/route.ts] Error crítico inesperado al procesar confirmación:`,
        e.message,
        e
      );
      // En caso de un error inesperado, redirige a una página de error genérica
      redirect(
        `/login?error=${encodeURIComponent(
          "Ocurrió un error inesperado durante la confirmación."
        )}`
      );
    }
  }

  // Si se accede a esta ruta sin los parámetros necesarios, redirige al login
  console.warn(
    "⚠️ [auth/confirm/route.ts] Acceso directo a /auth/confirm sin token o tipo válido. Redirigiendo a /login."
  );
  redirect("/login");
}
