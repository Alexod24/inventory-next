// src/lib/supabaseServerClient.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "../types/supabase"; // Asegúrate de que esta ruta sea correcta para tu tipo Database

// Esta función ahora es SÍNCRONA, como se recomienda en la documentación de Supabase SSR.
export function createServerSupabaseClient() {
  // Captura la instancia de 'cookies()' una sola vez aquí.
  const cookieStore = cookies();

  // --- LOGS DE DEPURACIÓN DE VARIABLES DE ENTORNO ---
  console.log(
    "createServerSupabaseClient: NEXT_PUBLIC_SUPABASE_URL:",
    process.env.NEXT_PUBLIC_SUPABASE_URL ? "DEFINIDA" : "NO DEFINIDA"
  );
  console.log(
    "createServerSupabaseClient: NEXT_PUBLIC_SUPABASE_ANON_KEY:",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "DEFINIDA" : "NO DEFINIDA"
  );
  // --- FIN LOGS DE DEPURACIÓN ---

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Los métodos 'get', 'set', 'remove' ahora son SÍNCRONOS y usan 'cookieStore'.
        get(name: string) {
          const cookie = cookieStore.get(name);
          return cookie?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Este catch es principalmente para depuración en desarrollo
            console.warn(
              "⚠️ [createServerSupabaseClient] No se pueden establecer cookies (posiblemente en contexto de Cliente, lo cual es incorrecto para este cliente de servidor).",
              error
            );
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.delete(name); // Usa .delete() para eliminar la cookie
          } catch (error) {
            // Este catch es principalmente para depuración en desarrollo
            console.warn(
              "⚠️ [createServerSupabaseClient] No se pueden eliminar cookies (posiblemente en contexto de Cliente, lo cual es incorrecto para este cliente de servidor).",
              error
            );
          }
        },
      },
    }
  );
}
