// src/app/utils/supabase/server.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers"; // Importa 'cookies' de next/headers

export const createServerSupabaseClient = () => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // Llama a cookies() y haz un casting explícito a 'any' para resolver el error de tipo.
          return (cookies() as any).get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            // Llama a cookies() y haz un casting explícito a 'any'.
            (cookies() as any).set(name, value, options);
          } catch (error) {
            console.error(
              "Error al establecer la cookie en el servidor:",
              error
            );
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            // Llama a cookies() y haz un casting explícito a 'any'.
            (cookies() as any).set(name, "", options); // O (cookies() as any).delete(name)
          } catch (error) {
            console.error("Error al eliminar la cookie en el servidor:", error);
          }
        },
      },
    }
  );
};
