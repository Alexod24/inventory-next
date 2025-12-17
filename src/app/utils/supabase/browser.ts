// src/app/utils/supabase/browser.ts
// Este archivo crea y exporta una función para obtener el cliente Supabase del lado del navegador.

// Importa createBrowserClient de @supabase/ssr
import { createBrowserClient } from "@supabase/ssr";

// Asegúrate de que estas variables de entorno están configuradas en tu .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Exportamos una función para crear la instancia del cliente Supabase para el navegador.
// Nombrada 'createClientComponentClient' para evitar cualquier conflicto con 'createClient'
// que puedas tener en otros archivos o con 'createClient' de @supabase/supabase-js.
export function createClientComponentClient<T = any>() {
  return createBrowserClient<T>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true, // Persiste la sesión usando cookies, ideal para Next.js
      detectSessionInUrl: true, // Detecta la sesión en la URL (para callbacks de auth)
      // Puedes añadir aquí otras opciones de auth si las tenías en tu config original
    },
  });
}
