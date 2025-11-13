import { z } from "zod";

// Esquema para el objeto anidado (para relaciones)
const UserRelationSchema = z
  .object({
    nombre: z.string(),
  })
  .nullable()
  .optional();

// Este es el schema para tu tabla 'ingresos'
export const ingresosSchema = z.object({
  id: z.string().uuid().optional(),

  // Columna Producto (Corregida a string/uuid, ya que es el FK)
  producto: z.string().nullable().optional(),
  cantidad: z.number(),
  fecha: z.string(),
  descripcion: z.string().nullable().optional(),

  // --- LA CORRECCIÓN: AÑADIMOS USUARIO_ID Y LA RELACIÓN ---
  usuario_id: z.string().uuid().nullable().optional(),
  usuarios: UserRelationSchema, // El objeto que columns.tsx intenta leer
  // --------------------------------------------------------

  // Relación de productos (ya existente)
  bienes: z
    .object({
      nombre: z.string(),
      codigo: z.string().optional(),
    })
    .nullable()
    .optional(),
});

export type Ingresos = z.infer<typeof ingresosSchema>;
