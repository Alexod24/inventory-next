"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { createClientComponentClient } from "@/app/utils/supabase/browser";
import { useUser } from "@/context/UserContext";
import { Database } from "@/types/supabase";

type Sede = Database["public"]["Tables"]["sedes"]["Row"];

interface SedeContextProps {
  sedes: Sede[];
  sedeActual: Sede | null;
  setSedeActual: (sede: Sede) => void;
  loading: boolean;
}

const SedeContext = createContext<SedeContextProps | undefined>(undefined);

export function SedeProvider({ children }: { children: ReactNode }) {
  const { user, loading: userLoading } = useUser();
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [sedeActual, setSedeActual] = useState<Sede | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const supabase = createClientComponentClient<Database>();

  const fetchSedes = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Obtener todas las sedes
      const { data: allSedes, error } = await supabase
        .from("sedes")
        .select("*")
        .order("es_principal", { ascending: false }); // Principal primero

      if (error) throw error;
      if (!allSedes) return;

      setSedes(allSedes);

      // 2. Lógica de Selección Automática
      if (user?.rol === "empleado") {
        // Buscar la sede asignada al empleado
        const { data: userRecord } = await supabase
          .from("usuarios")
          .select("sede_asignada_id")
          .eq("id", user.id)
          .single();

        if (userRecord?.sede_asignada_id) {
          const assignedSede = allSedes.find(
            (s) => s.id === userRecord.sede_asignada_id
          );
          if (assignedSede) setSedeActual(assignedSede);
        }
      } else {
        // Es ADMIN o no tiene rol específico:
        // Intentar recuperar del localStorage o usar la Principal
        const storedSedeId = localStorage.getItem("selectedSedeId");
        if (storedSedeId) {
          const stored = allSedes.find((s) => s.id === storedSedeId);
          if (stored) {
            setSedeActual(stored);
            return;
          }
        }

        // Fallback: Sede Principal
        const principal = allSedes.find((s) => s.es_principal);
        if (principal) setSedeActual(principal);
        else if (allSedes.length > 0) setSedeActual(allSedes[0]);
      }
    } catch (err) {
      console.error("Error fetching sedes:", err);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (!userLoading) {
      if (user) {
        fetchSedes();
      } else {
        setSedes([]);
        setSedeActual(null);
        setLoading(false);
      }
    }
  }, [user, userLoading, fetchSedes]);

  // Persistir seleccion en localStorage (Solo para admins realmente)
  const handleSetSede = (sede: Sede) => {
    setSedeActual(sede);
    localStorage.setItem("selectedSedeId", sede.id);
  };

  return (
    <SedeContext.Provider
      value={{ sedes, sedeActual, setSedeActual: handleSetSede, loading }}
    >
      {children}
    </SedeContext.Provider>
  );
}

export function useSede() {
  const context = useContext(SedeContext);
  if (context === undefined) {
    throw new Error("useSede debe ser usado dentro de un SedeProvider");
  }
  return context;
}
