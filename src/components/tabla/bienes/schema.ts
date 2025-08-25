import { z } from "zod";

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
  subcategoria: z // Cambiado a singular
    .object({
      id: z.string(),
      nombre: z.string(),
    })
    .optional(),
  proveedor: z // Cambiado a proveedor en lugar de proveedorNombre
    .object({
      id: z.string(),
      nombre: z.string(),
    })
    .optional(),
  espacio: z // Cambiado a espacio en lugar de espacioNombre
    .object({
      id: z.string(),
      nombre: z.string(),
    })
    .optional(),
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
  creado: z.string(),
  actualizado: z.string(),
});

// Inferimos el tipo automáticamente a partir del esquema
export type Bienes = z.infer<typeof bienesSchema>;
