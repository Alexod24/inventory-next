import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseClient() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    throw new Error(
      "Faltan las variables de entorno necesarias para Supabase."
    );
  }

  const cookiesStore = cookies();

  return createServerClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookiesStore.getAll();
        },
        // Mejor no usar setAll aquí, porque no tiene efecto en SSR sin Response
        setAll() {
          // No hagas nada o lanza error para evitar confusiones
          console.warn("setAll no implementado en createSupabaseClient SSR");
        },
      },
    }
  );
}
