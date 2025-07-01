// src/context/UserContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { createClientComponentClient } from "@/app/utils/supabase/browser"; // Cliente de Supabase para el navegador
import { User as SupabaseUser } from "@supabase/supabase-js"; // Importa el tipo User de Supabase

// Define la interfaz para el objeto de usuario que almacenarás en el contexto
export interface UserProfile {
  id: string;
  email: string | undefined; // El email puede ser undefined en algunos casos
  nombre: string | null;
  rol: string | null; // Añade la propiedad rol
}

// Define la interfaz para el contexto del usuario
export interface UserContextProps {
  user: UserProfile | null;
  loading: boolean;
  refreshUser: () => Promise<void>; // <--- DEBE ESTAR AQUÍ
}

// Crea el contexto con un valor inicial por defecto
const UserContext = createContext<UserContextProps | undefined>(undefined);

// Componente proveedor del contexto
export function UserProvider({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: UserProfile | null;
}) {
  // Inicializa user con initialUser. loading es true inicialmente para asegurar que el perfil se cargue.
  const [user, setUser] = useState<UserProfile | null>(initialUser);
  const [loading, setLoading] = useState<boolean>(true); // Siempre true al inicio para cargar el perfil

  const supabase = createClientComponentClient();

  // Función para obtener el perfil del usuario desde Supabase
  const fetchUserProfile = useCallback(
    async (supabaseUser: SupabaseUser | null) => {
      setLoading(true); // Activa el estado de carga
      if (!supabaseUser) {
        setUser(null);
        setLoading(false);
        console.log(
          "[UserContext] No hay usuario de Supabase para cargar perfil."
        );
        return;
      }

      console.log(
        `[UserContext] Cargando perfil para el usuario ID: ${supabaseUser.id}`
      );
      const { data: profile, error } = await supabase
        .from("usuarios")
        .select("nombre, rol")
        .eq("id", supabaseUser.id)
        .single();

      if (error) {
        console.error("[UserContext] Error al cargar perfil:", error.message);
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email,
          nombre: null,
          rol: null,
        });
      } else if (profile) {
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email,
          nombre: profile.nombre,
          rol: profile.rol,
        });
        console.log("[UserContext] Perfil cargado exitosamente:", profile);
      } else {
        // Usuario autenticado pero sin perfil en la tabla 'usuarios'
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email,
          nombre: null,
          rol: null,
        });
        console.warn(
          "[UserContext] Usuario autenticado sin perfil en la tabla 'usuarios'."
        );
      }
      setLoading(false); // Desactiva el estado de carga
    },
    [supabase]
  ); // Dependencia en supabase

  // Función para forzar la recarga del usuario (expuesta a través del contexto)
  const refreshUser = useCallback(async () => {
    console.log("[UserContext] Forzando recarga de usuario...");
    const {
      data: { user: sessionUser },
    } = await supabase.auth.getUser();
    await fetchUserProfile(sessionUser);
  }, [supabase, fetchUserProfile]);

  useEffect(() => {
    // 1. Carga inicial del perfil al montar el componente
    const getInitialUser = async () => {
      if (initialUser) {
        setUser(initialUser); // Set initial user immediately for faster first render
        setLoading(false); // No loading state for initial render if user is present
      }

      const {
        data: { user: sessionUser },
      } = await supabase.auth.getUser();
      await fetchUserProfile(sessionUser);
    };
    getInitialUser();

    // 2. Escuchar cambios en el estado de autenticación de Supabase
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`[UserContext] Evento de Auth: ${event}, Sesión:`, session);
      fetchUserProfile(session?.user || null);
    });

    // Limpiar la suscripción al desmontar el componente
    return () => {
      console.log(
        "🧹 [UserContext] Limpiando suscripción de onAuthStateChange."
      );
      subscription.unsubscribe();
    };
  }, [supabase, fetchUserProfile, initialUser]); // Dependencias: supabase, fetchUserProfile, initialUser

  return (
    <UserContext.Provider value={{ user, loading, refreshUser }}>
      {" "}
      {/* <--- refreshUser SE PASA AQUÍ */}
      {children}
    </UserContext.Provider>
  );
}

// Hook personalizado para usar el contexto del usuario
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser debe ser usado dentro de un UserProvider");
  }
  return context;
}
