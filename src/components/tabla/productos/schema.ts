import { z } from "zod";

// Asegúrate de que tu schema se llame 'bienesSchema'
export const bienesSchema = z.object({
  id: z.any(), // O el tipo que sea tu ID (string/number)
  nombre: z.string().optional(),
  codigo: z.string().optional(),
  codigo_barras: z.string().nullable().optional(), // <-- AÑADIDO (Dual Code)

  // ...otros campos planos...

  // --- CORRECCIÓN 1: CATEGORIA ---
  // (Asegúrate de que 'categoria_id' sea 'number' si así lo usa tu hook)
  categoria_id: z.number().optional(),
  categoria: z
    .object({
      nombre: z.string(),
    })
    .nullable()
    .optional(),

  // --- CORRECCIÓN 2: USUARIO ---
  usuario_id: z.string().nullable().optional(),
  usuario: z
    .object({
      nombre: z.string(),
    })
    .nullable()
    .optional(),

  // --- CORRECCIÓN 3: ESPACIO ---
  espacio_id: z.string().nullable().optional(),
  espacio: z
    .object({
      nombre: z.string(),
    })
    .nullable()
    .optional(),

  // --- CORRECIÓN 4: PROVEEDOR ---
  proveedor_id: z.string().nullable().optional(),
  proveedor: z
    .object({
      nombre: z.string(),
    })
    .nullable()
    .optional(),

  // --- CORRECCIÓN 5: PRECIO VENTA (Del error anterior) ---
  precio_venta: z.number().nullable().optional(),
  precio_mayor: z.number().nullable().optional(), // <-- AÑADIDO
  inventario: z
    .array(
      z.object({
        stock_actual: z.number(),
      })
    )
    .optional(),

  // --- Tus campos existentes ---
  cantidad: z.number().optional(),
  valor: z.number().optional(),
  estado: z.string().optional(),
  disponibilidad: z.boolean().optional(),
  observaciones: z.string().nullable().optional(),
  creado_en: z.string().optional(),
  actualizado_en: z.string().optional(),

  fecha_adquisicion: z.string().optional(), // <-- AÑADE ESTA LÍNEA
  // ... etc
});

export type Bienes = z.infer<typeof bienesSchema>;
