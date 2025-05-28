import { z } from "zod";

// Definimos el esquema para BaseOperativa
export const baseOperativaSchema = z.object({
  id: z.string(),
  proveedor: z.string(),
  descripcion: z.string(),
  marca: z.string(),
  color: z.string(),
  cantidad: z.number(),
  tamaño: z.string(),
  material: z.string(),
  fecha: z.string(), // Fecha como cadena en formato ISO
  valor: z.number(),
  estado: z.string(),
  justificacion: z.string(),
  type: z.enum(["income", "expense"]).optional(), // Opcional si aplica
});

// Inferimos el tipo automáticamente a partir del esquema
export type BaseOperativa = z.infer<typeof baseOperativaSchema>;
