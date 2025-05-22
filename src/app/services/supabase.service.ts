"use client";

import { createSupabaseClient } from "@/app/utils/supabase/client";

export const getProductos = async () => {
  try {
    // Crea el cliente de Supabase
    const supabase = await createSupabaseClient();

    // Haz la consulta a la tabla 'productos'
    const { data, error } = await supabase.from("productos").select("*");

    // Maneja posibles errores
    if (error) {
      throw new Error(`Error al obtener productos: ${error.message}`);
    }

    // Devuelve los datos obtenidos
    return data;
  } catch {
  
    return []; // Retorna un array vacío en caso de error
  }
  
};
