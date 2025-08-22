// services/bienesService.ts
import { supabase } from "@/app/utils/supabase/supabase";

export const fetchSimilarCodes = async (
  baseCode: string
): Promise<string[]> => {
  const { data, error } = await supabase
    .from("bienes")
    .select("codigo")
    .like("codigo", `${baseCode}%`);

  if (error) {
    console.error("Error al buscar códigos similares:", error);
    return [];
  }

  return data.map((item) => item.codigo);
};

export const insertarBien = async (bienData: any) => {
  return await supabase.from("bienes").insert([bienData]).select("*");
};

export const fetchOpciones = async () => {
  const tablas = [
    "categorias",
    "subcategorias",
    "proveedores",
    "espacios",
    "usuarios",
  ];
  const promises = tablas.map(async (tabla) => {
    const { data, error } = await supabase.from(tabla).select("id, nombre");
    if (error) {
      console.error(`Error al cargar ${tabla}:`, error);
      return { [tabla]: [] };
    }
    return {
      [tabla]: data.map((item) => ({
        value: item.id,
        label: item.nombre,
      })),
    };
  });

  const resultados = await Promise.all(promises);
  return Object.assign({}, ...resultados);
};
