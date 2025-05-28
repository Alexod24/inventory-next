// @/types/supabase.ts

export type Json = 
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  public: {
    Tables: {
      base_operativa: {
        Row: {
          id: string;
          proveedor: string;
          descripcion: string;
          marca: string;
          color: string;
          cantidad: number;
          tamano: string;
          material: string;
          fecha: string; // ISO string
          valor: number;
          estado: string;
          justificacion: string;
          type: "income" | "expense" | null; // optional
        };
        Insert: {
          id?: string; // opcional si usas UUID generado en backend
          proveedor: string;
          descripcion: string;
          marca: string;
          color: string;
          cantidad: number;
          tamano: string;
          material: string;
          fecha: string;
          valor: number;
          estado: string;
          justificacion: string;
          type?: "income" | "expense" | null;
        };
        Update: {
          id?: string;
          proveedor?: string;
          descripcion?: string;
          marca?: string;
          color?: string;
          cantidad?: number;
          tamano?: string;
          material?: string;
          fecha?: string;
          valor?: number;
          estado?: string;
          justificacion?: string;
          type?: "income" | "expense" | null;
        };
      };
    };
    Functions: {};
    Enums: {};
  };
}
