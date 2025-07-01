import { z } from "zod";

// Definimos el esquema para Movimientos
export const movimientosSchema = z.object({
  id: z.string(), // Identificador único del movimiento
  bien_id: z.string(), // Referencia al bien afectado
  usuario_id: z.string(), // Usuario responsable del movimiento
  tipo: z.enum(["Ingreso", "Salida", "Traslado"]), // Tipo de movimiento
  cantidad: z.number(), // Cantidad afectada
  fecha: z.number(),
  observaciones: z.string().optional(), // Observaciones opcionales
});

// Inferimos el tipo automáticamente a partir del esquema
export type Movimientos = z.infer<typeof movimientosSchema>;
