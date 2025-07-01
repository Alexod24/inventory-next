// src/components/SupabaseSessionProvider.tsx
"use client";

import { createBrowserClient } from "@supabase/ssr";
import { type Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export default function SupabaseSessionProvider({
  children,
  initialSession, // Esta sesión viene del Server Component (layout.tsx)
}: {
  children: React.ReactNode;
  initialSession: Session | null;
}) {
  // Inicializa el cliente de navegador con la sesión inicial.
  // Esto es vital para la hidratación.
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        detectSessionInUrl: true,
      },
    }
  );

  // Escucha los cambios de estado de autenticación (login, logout, token refresh)
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, currentSession) => {
      // console.log(`🔑 [SupabaseSessionProvider] Evento de autenticación: ${event}. Sesión actual:`, currentSession);
      // Aquí podrías actualizar un estado global si lo necesitaras para re-renderizados finos
    });

    // Limpia la suscripción al desmontar el componente
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Solo renderiza los hijos. El objetivo principal es inicializar la instancia de Supabase
  // en el navegador con la sesión correcta.
  return <>{children}</>;
}
