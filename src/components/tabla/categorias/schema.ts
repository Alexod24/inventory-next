import { z } from "zod";

// Schema for Categories table
export const categoriaSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string(),
  descripcion: z.string().nullable(),
  fecha_creacion: z.string(),
});

export type Categoria = z.infer<typeof categoriaSchema>;
