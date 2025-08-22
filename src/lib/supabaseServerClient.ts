// src/lib/supabaseServerClient.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "../types/supabase"; // Ajusta la ruta según tu proyecto

// Ahora debe ser ASÍNCRONA
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookie = cookieStore.get(name);
          return cookie?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            console.warn(
              "⚠️ [createServerSupabaseClient] No se pueden establecer cookies (posiblemente en contexto de Cliente).",
              error
            );
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.delete(name);
          } catch (error) {
            console.warn(
              "⚠️ [createServerSupabaseClient] No se pueden eliminar cookies (posiblemente en contexto de Cliente).",
              error
            );
          }
        },
      },
    }
  );
}
