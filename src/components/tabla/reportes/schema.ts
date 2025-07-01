import { z } from "zod";

// Definimos el esquema para Reportes
export const reportesSchema = z.object({
  id: z.string(), // Identificador único del reporte
  bien_id: z.string(), // Referencia al bien reportado
  responsable_id: z.string(), // Usuario que generó el reporte
  descripcion: z.string().min(1, "La descripción es obligatoria"), // Descripción del problema
  fecha: z.number(), // Fecha de creación del reporte (timestamp)
  motivos: z.string().optional(), // Motivos opcionales
  acciones: z.string().optional(), // Acciones realizadas (opcional)
  cantidad: z.number().min(1, "Debe ser al menos 1"), // Cantidad de bienes afectados
});

// Inferimos el tipo automáticamente a partir del esquema
export type Reportes = z.infer<typeof reportesSchema>;
