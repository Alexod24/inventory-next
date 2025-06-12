import { z } from "zod";

// Definimos el esquema para Bienes
export const bienesSchema = z.object({
  id: z.string(),
  codigo: z.string(),
  nombre: z.string(),
  categoria: z.string(), // Propiedad directa para el nombre de la categoría
  subcategoriaNombre: z.string(), // Propiedad directa para el nombre de la subcategoría
  proveedorNombre: z.string().optional(), // Propiedad directa para el proveedor, opcional
  espacioNombre: z.string(), // Propiedad directa para el nombre del espacio
  cantidad: z.number(),
  adquisicion: z.string().optional(), // Fecha como ISO string, opcional
  valor: z.number(),
  estado: z.string(),
  disponibilidad: z.boolean(), // Solo booleano para consistencia
  observaciones: z.string().optional(), // Observaciones opcionales
  usuario: z.string(),
  creado: z.string(),
  actualizado: z.string(),
});

// Inferimos el tipo automáticamente a partir del esquema
export type Bienes = z.infer<typeof bienesSchema>;
