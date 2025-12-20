import { z } from "zod";

export const cajaSesionSchema = z.object({
  id: z.string(),
  sede_id: z.string(),
  usuario_apertura_id: z.string().nullable(),
  usuario_cierre_id: z.string().nullable(),
  fecha_apertura: z.string(),
  fecha_cierre: z.string().nullable(),
  monto_apertura: z.number(),
  monto_cierre_real: z.number().nullable(),
  monto_teorico: z.number().nullable(),
  diferencia: z.number().nullable(),
  estado: z.enum(["abierta", "cerrada"]),
  observaciones: z.string().nullable(),
});

export type CajaSesion = z.infer<typeof cajaSesionSchema>;
