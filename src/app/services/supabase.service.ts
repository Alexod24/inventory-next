// src/app/services/supabase.service.ts
"use client";

// Importa la constante 'supabase' que se exporta desde "@/app/utils/supabase/client"
import { supabase } from "@/app/utils/supabase/client";

export const getProductos = async () => {
  try {
    const { data, error } = await supabase.from("productos").select("*"); // Asumiendo que 'productos' es tu tabla

    if (error) {
      console.error("Error al obtener productos:", error.message);
      return [];
    }
    return data;
  } catch (e: any) {
    console.error("Error inesperado al obtener productos:", e.message);
    return [];
  }
};

// Puedes añadir más funciones de servicio aquí que utilicen la instancia 'supabase'
export const addProducto = async (newProducto: any) => {
  try {
    const { data, error } = await supabase
      .from("productos")
      .insert([newProducto]);

    if (error) {
      console.error("Error al añadir producto:", error.message);
      return null;
    }
    return data;
  } catch (e: any) {
    console.error("Error inesperado al añadir producto:", e.message);
    return null;
  }
};

// Ejemplo: obtener un producto por ID
export const getProductoById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from("productos")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(`Error al obtener producto con ID ${id}:`, error.message);
      return null;
    }
    return data;
  } catch (e: any) {
    console.error(
      `Error inesperado al obtener producto con ID ${id}:`,
      e.message
    );
    return null;
  }
};

// Ejemplo: actualizar un producto
export const updateProducto = async (id: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from("productos")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error(
        `Error al actualizar producto con ID ${id}:`,
        error.message
      );
      return null;
    }
    return data;
  } catch (e: any) {
    console.error(
      `Error inesperado al actualizar producto con ID ${id}:`,
      e.message
    );
    return null;
  }
};

// Ejemplo: eliminar un producto
export const deleteProducto = async (id: string) => {
  try {
    const { error } = await supabase.from("productos").delete().eq("id", id);

    if (error) {
      console.error(`Error al eliminar producto con ID ${id}:`, error.message);
      return false;
    }
    return true;
  } catch (e: any) {
    console.error(
      `Error inesperado al eliminar producto con ID ${id}:`,
      e.message
    );
    return false;
  }
};
