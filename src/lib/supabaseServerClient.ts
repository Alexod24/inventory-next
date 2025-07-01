// src/lib/supabaseServerClient.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers"; // <--- CORRECCIÓN DE SINTAXIS AQUÍ
import { Database } from "../types/supabase"; // Asegúrate de que esta ruta sea correcta para tu tipo Database

// Asegúrate de que esta función sea async
export async function createServerSupabaseClient() {
  // Ya no necesitamos 'const cookieStore = cookies();' aquí.
  // La función 'cookies()' se llamará directamente dentro de los métodos 'get', 'set', 'remove'.

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
        get: async (name: string) => {
          // <--- CORRECCIÓN CLAVE AQUÍ: Llamar a cookies() directamente
          const cookie = await cookies().get(name);
          return cookie?.value;
        },
        set: async (name: string, value: string, options: CookieOptions) => {
          try {
            // <--- CORRECCIÓN CLAVE AQUÍ: Llamar a cookies() directamente
            await cookies().set({ name, value, ...options });
          } catch (error) {
            console.warn(
              "⚠️ [createServerSupabaseClient] No se pueden establecer cookies desde un contexto de Cliente.",
              error
            );
          }
        },
        remove: async (name: string, options: CookieOptions) => {
          try {
            // <--- CORRECCIÓN CLAVE AQUÍ: Llamar a cookies() directamente y usar .delete
            await cookies().delete(name);
          } catch (error) {
            console.warn(
              "⚠️ [createServerSupabaseClient] No se pueden eliminar cookies desde un contexto de Cliente.",
              error
            );
          }
        },
      },
    }
  );
}
