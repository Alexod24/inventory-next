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
      sedes: {
        Row: {
          id: string;
          nombre: string;
          direccion: string | null;
          telefono: string | null;
          es_principal: boolean;
          fecha_creacion: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          direccion?: string | null;
          telefono?: string | null;
          es_principal?: boolean;
          fecha_creacion?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          direccion?: string | null;
          telefono?: string | null;
          es_principal?: boolean;
          fecha_creacion?: string;
        };
      };
      inventario_sedes: {
        Row: {
          id: string;
          producto_id: string;
          sede_id: string;
          stock_actual: number;
          stock_minimo: number;
          ubicacion: string | null;
          fecha_actualizacion: string;
        };
        Insert: {
          id?: string;
          producto_id: string;
          sede_id: string;
          stock_actual?: number;
          stock_minimo?: number;
          ubicacion?: string | null;
          fecha_actualizacion?: string;
        };
        Update: {
          id?: string;
          producto_id?: string;
          sede_id?: string;
          stock_actual?: number;
          stock_minimo?: number;
          ubicacion?: string | null;
          fecha_actualizacion?: string;
        };
      };
      productos: {
        Row: {
          id: string;
          nombre: string;
          descripcion: string | null;
          precio_compra: number;
          // stock: number; // DEPRECATED: Usar inventario_sedes
          fecha_c: string;
          categoria: string | null;
          fecha_v: string | null;
          imagen_url: string | null;
          precio_venta: number | null;
          codigo: string | null; // Nuevo campo
        };
        Insert: {
          id?: string;
          nombre: string;
          descripcion?: string | null;
          precio_compra: number;
          // stock?: number;
          fecha_c?: string;
          categoria?: string | null;
          fecha_v?: string | null;
          imagen_url?: string | null;
          precio_venta?: number | null;
          codigo?: string | null;
        };
        Update: {
          id?: string;
          nombre?: string;
          descripcion?: string | null;
          precio_compra?: number;
          // stock?: number;
          fecha_c?: string;
          categoria?: string | null;
          fecha_v?: string | null;
          imagen_url?: string | null;
          precio_venta?: number | null;
          codigo?: string | null;
        };
      };
      usuarios: {
        Row: {
          id: string;
          nombre: string | null;
          rol: string | null;
          created_at: string | null;
          email: string;
          sede_asignada_id: string | null; // Nuevo campo
        };
        Insert: {
          id: string;
          nombre?: string | null;
          rol?: string | null;
          created_at?: string | null;
          email: string;
          sede_asignada_id?: string | null;
        };
        Update: {
          id?: string;
          nombre?: string | null;
          rol?: string | null;
          created_at?: string | null;
          email?: string;
          sede_asignada_id?: string | null;
        };
      };
      ingresos: {
        Row: {
          id: string;
          cantidad: number;
          fecha: string;
          descripcion: string | null;
          usuario_id: string | null;
          producto: number | null; // Nota: En esquema original era bigint -> bienes.id, revisar si cambiar a UUID -> productos.id
          sede_id: string | null; // Nuevo campo
        };
        Insert: {
          id?: string;
          cantidad: number;
          fecha?: string;
          descripcion?: string | null;
          usuario_id?: string | null;
          producto?: number | null;
          sede_id?: string | null;
        };
        Update: {
          id?: string;
          cantidad?: number;
          fecha?: string;
          descripcion?: string | null;
          usuario_id?: string | null;
          producto?: number | null;
          sede_id?: string | null;
        };
      };
      salidas: {
        Row: {
          id: string;
          producto: string; // UUID references productos
          cantidad: number;
          precio: number;
          fecha: string;
          total: number;
          sede_id: string | null; // Nuevo campo
        };
        Insert: {
          id?: string;
          producto: string;
          cantidad: number;
          precio: number;
          fecha?: string;
          total?: number;
          sede_id?: string | null;
        };
        Update: {
          id?: string;
          producto?: string;
          cantidad?: number;
          precio?: number;
          fecha?: string;
          total?: number;
          sede_id?: string | null;
        };
      };
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
          fecha: string;
          valor: number;
          estado: string;
          justificacion: string;
          type: "income" | "expense" | null;
        };
        Insert: {
          id?: string;
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
    Functions: object;
    Enums: object;
  };
}
