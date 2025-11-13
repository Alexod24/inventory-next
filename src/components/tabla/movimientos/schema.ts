import { z } from "zod";

// Definimos el esquema para Movimientos (Ventas)
export const movimientosSchema = z.object({
  // Columnas directas de la tabla 'movimientos'
  id: z.any(), // Puede ser número o string, z.any() es seguro
  bien_id: z.number(), // Lo descubrimos en el debug, era un número
  usuario_id: z.string().uuid().nullable().optional(), // Es un UUID y es opcional
  cantidad: z.number(),
  fecha: z.string(), // Es un string de fecha ISO
  total_venta: z.number().nullable().optional(), // La nueva columna de total

  // --- Las Relaciones (Joins) ---
  // Esto es lo que soluciona el error de TypeScript.
  // Son los datos que Supabase anida.

  bien: z
    .object({
      nombre: z.string(),
    })
    .nullable()
    .optional(), // La relación puede no existir

  usuario: z
    .object({
      nombre: z.string(),
    })
    .nullable()
    .optional(), // La relación puede no existir
});

// Inferimos el tipo automáticamente a partir del esquema
export type Movimientos = z.infer<typeof movimientosSchema>;
