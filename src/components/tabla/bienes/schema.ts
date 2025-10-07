import { string, z } from "zod";

// Definimos el esquema para Bienes alineado con la base de datos

export const bienesSchema = z.object({
  id: z.string(),
  codigo: z.string(),
  nombre: z.string(),

  categoria: z
    .object({
      id: z.string(),
      nombre: z.string(),
    })
    .optional(),
  categoria_id: z.string().optional(),
  categoriaNombre: z.string(),
  subcategoriaNombre: z.string(),

  subcategoria: z
    .object({
      id: z.string(),
      nombre: z.string(),
    })
    .optional(),
  subcategoria_id: z.string().optional(),

  proveedor: z
    .object({
      id: z.string(),
      nombre: z.string(),
    })
    .optional(),
  proveedor_id: z.string().optional(),

  espacio: z
    .object({
      id: z.string(),
      nombre: z.string(),
    })
    .optional(),
  espacio_id: z.string().optional(),

  cantidad: z.number(),
  fecha_adquisicion: z.string().optional(),
  valor: z.number(),
  estado: z.string(),
  disponibilidad: z.boolean(),
  observaciones: z.string().optional(),

  usuario: z
    .object({
      id: z.string(),
      nombre: z.string(),
    })
    .optional(),
  usuario_id: z.string().optional(),

  creado_en: z.string(),
  actualizado_en: z.string(),
});

// Inferimos el tipo automáticamente a partir del esquema
export type Bienes = z.infer<typeof bienesSchema>;
