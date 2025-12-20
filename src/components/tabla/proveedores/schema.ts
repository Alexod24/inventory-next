import { z } from "zod";

// Schema for Proveedores table
export const proveedorSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string(),
  ruc: z.string().nullable(),
  telefono: z.string().nullable(),
  email: z.string().nullable(),
  direccion: z.string().nullable(),
  fecha_creacion: z.string(),
});

export type Proveedor = z.infer<typeof proveedorSchema>;
