"use client";

import React from "react";
import { useSede } from "@/context/SedeContext";
import { useUser } from "@/context/UserContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin } from "lucide-react";

export default function SedeSelector() {
  const { sedes, sedeActual, setSedeActual, loading } = useSede();
  const { user } = useUser();

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 bg-gray-100 rounded-lg animate-pulse dark:bg-gray-800">
        <MapPin className="w-4 h-4" />
        <span className="w-24 h-4 bg-gray-200 rounded dark:bg-gray-700"></span>
      </div>
    );
  }

  // Si no hay sedes o usuario, no mostrar nada
  if (!sedes.length || !user) return null;

  const isAdmin = user.rol !== "empleado";
  // Ojo: Ajustar lógica si tu rol de admin tiene otro nombre exacto, ej 'admin' o 'superadmin'

  const handleValueChange = (value: string) => {
    const selected = sedes.find((s) => s.id === value);
    if (selected) {
      setSedeActual(selected);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
        <MapPin className="w-4 h-4" />
      </div>

      <Select
        value={sedeActual?.id}
        onValueChange={handleValueChange}
        disabled={!isAdmin} // Solo admin puede cambiar
      >
        <SelectTrigger className="w-[180px] h-9 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <SelectValue placeholder="Seleccionar Sede" />
        </SelectTrigger>
        <SelectContent className="z-[999999]">
          {sedes.length === 0 && (
            <div className="p-2 text-xs">No hay sedes</div>
          )}
          {sedes.map((sede) => (
            <SelectItem key={sede.id} value={sede.id}>
              {sede.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
