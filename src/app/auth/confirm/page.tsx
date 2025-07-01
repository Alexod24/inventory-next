// src/app/auth/confirm/page.tsx
// Este archivo manejará la redirección de Supabase después de la confirmación de email.

import { createServerSupabaseClient } from "@/lib/supabaseServerClient"; // Tu cliente de Supabase para el servidor
import { redirect } from "next/navigation"; // Para redirecciones server-side

export default async function AuthConfirmPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const token_hash = searchParams.token_hash as string;
  const type = searchParams.type as string;
  const next = (searchParams.next as string) || "/base"; // Ruta por defecto

  if (token_hash && type) {
    const supabase = createServerSupabaseClient(); // Obtén el cliente de Supabase del servidor

    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    });

    if (!error) {
      console.log(
        `✅ [auth/confirm/page.tsx] Confirmación exitosa. Redirigiendo a: ${next}`
      );
      redirect(next);
    } else {
      console.error(
        `❌ [auth/confirm/page.tsx] Error en la confirmación:`,
        error.message
      );
      redirect(`/login?error=${encodeURIComponent(error.message)}`);
    }
  }

  console.warn(
    "⚠️ [auth/confirm/page.tsx] Acceso directo a /auth/confirm sin token válido."
  );
  redirect("/login"); // O a tu página de inicio

  // Este componente no renderiza nada visible, solo maneja la redirección
  return null;
}
