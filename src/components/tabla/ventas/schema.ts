import { z } from "zod";

export const ventasSchema = z.object({
  id: z.number().optional(), // id is usually serial int in supabase for some tables, or uuid string. 'salidas' uses serial int? Let's assume number or string based on previous usage. database_migration.sql says: 'id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY'. So number.
  producto: z.number().or(z.string()), // It's a foreign key. schema says 'producto UUID REFERENCES bienes(id)'. Wait, bienes(id) is uuid?
  // Checking database_migration.sql: "CREATE TABLE bienes (id UUID PRIMARY KEY DEFAULT uuid_generate_v4() ...)"
  // So 'producto' is UUID (string).
  cantidad: z.number(),
  precio: z.number(),
  total: z.number(),
  fecha: z.string(),
  sede_id: z.string().optional(),
  // Relations for displaying names
  bienes: z
    .object({
      nombre: z.string(),
    })
    .optional(),
});

export type Ventas = z.infer<typeof ventasSchema>;
