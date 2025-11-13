"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { supabase } from "@/app/utils/supabase/supabase";
import { Option } from "@/lib/options";

// Opciones de Selects (ahora incluye precio y stock)
interface FormOptions {
  bienes: (Option & { precio_venta: number; stock_actual: number })[];
  usuarios: Option[];
}

// Tipo para el formulario de Venta
interface VentaState {
  bien_id?: number | string;
  usuario_id?: string;
  cantidad?: number;
  tipo_movimiento?: string; // Se hardcodeará
  fecha?: string; // Se hardcodeará
  motivo?: string; // Se hardcodeará
  total_venta?: number; // ¡Nuevo!
}

// Estado Inicial del Formulario (Hardcodeado para "Venta")
const initialState: VentaState = {
  bien_id: undefined,
  usuario_id: undefined,
  cantidad: 1,
  tipo_movimiento: "Salida", // <-- Hardcodeado
  fecha: new Date().toISOString().split("T")[0], // <-- Hardcodeado
  motivo: "Venta", // <-- Hardcodeado
  total_venta: 0,
};

// --- El Hook ---
export function useRegistrarVentaForm(
  onMovimientoCreated: () => void,
  onClose: () => void
) {
  const [newVenta, setNewVenta] = useState<VentaState>(initialState);
  const [options, setOptions] = useState<FormOptions>({
    bienes: [],
    usuarios: [],
  });

  // Nuevo estado para guardar la info del producto seleccionado
  const [selectedBienInfo, setSelectedBienInfo] = useState<{
    precio_venta: number;
    stock_actual: number;
  }>({ precio_venta: 0, stock_actual: 0 });

  const [formError, setFormError] = useState<string | null>(null);

  // --- Mini-Modal State ---
  const [isMiniModalOpen, setMiniModalOpen] = useState(false);
  const [newValue, setNewValue] = useState("");
  const [currentType, setCurrentType] = useState<string | null>(null);
  const [miniModalError, setMiniModalError] = useState<string | null>(null);

  // Carga de datos (ahora trae precio_venta y cantidad/stock)
  const loadOptions = async () => {
    try {
      const [bienesData, usuariosData] = await Promise.all([
        supabase.from("bienes").select("id, nombre, precio_venta, cantidad"), // <-- ACTUALIZADO
        supabase.from("usuarios").select("id, nombre"),
      ]);

      setOptions({
        bienes:
          bienesData.data?.map((b) => ({
            value: b.id,
            label: b.nombre,
            precio_venta: b.precio_venta || 0, // Asigna 0 si es null
            stock_actual: b.cantidad || 0, // Asigna 0 si es null
          })) || [],
        usuarios:
          usuariosData.data?.map((u) => ({ value: u.id, label: u.nombre })) ||
          [],
      });
    } catch (error) {
      console.error("Error en loadOptions:", error);
      setFormError("Error al cargar datos. Intente de nuevo.");
    }
  };

  useEffect(() => {
    loadOptions();
  }, []);

  // --- Handlers del Formulario Principal ---

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "cantidad") {
      let newCantidad = parseInt(value, 10) || 0;
      setFormError(null); // Limpia error previo

      // Validar contra el stock
      if (newCantidad > selectedBienInfo.stock_actual) {
        setFormError(
          `Stock insuficiente. Solo hay ${selectedBienInfo.stock_actual} unidades.`
        );
        newCantidad = selectedBienInfo.stock_actual; // Fija al máximo
      }

      setNewVenta((prev) => ({
        ...prev,
        cantidad: newCantidad,
      }));
    }
  };

  const handleSelectChange = (
    name: string,
    value: string | number | boolean
  ) => {
    // Esta variable SÓLO se usará para los campos que NO son 'bien_id'
    let processedValue: string | number | boolean | undefined = value;

    // Lógica para cuando se selecciona un BIEN (Producto)
    if (name === "bien_id") {
      setFormError(null); // Limpia errores

      // --- CORRECCIÓN INICIA ---
      // 1. 'bien_id' es un string (UUID), no un número.
      //    No necesitamos 'parseInt'. 'processedValue' ya tiene el valor (string).
      //    Solo nos aseguramos de que newBienId sea string o undefined.
      const newBienId = typeof value === "string" ? value : undefined;
      // --- CORRECCIÓN TERMINA ---

      // 2. Usamos la nueva variable 'newBienId' (que ahora es string | undefined)
      //    'b.value' (string) y 'newBienId' (string | undefined) AHORA SÍ COINCIDEN.
      const bien = options.bienes.find((b) => b.value === newBienId);

      if (bien) {
        setSelectedBienInfo({
          precio_venta: bien.precio_venta,
          stock_actual: bien.stock_actual,
        });
        // 3. Usamos 'newBienId' aquí
        setNewVenta((prev) => ({
          ...prev,
          bien_id: newBienId, // <-- Asigna string | undefined
          cantidad: 1, // Resetea cantidad
        }));
      } else {
        // Limpia si no se encuentra
        setSelectedBienInfo({ precio_venta: 0, stock_actual: 0 });
        // 4. Usamos 'newBienId' aquí también
        setNewVenta((prev) => ({
          ...prev,
          bien_id: newBienId, // <-- Asigna string | undefined
        }));
      }
      return; // Sal de la función
    }

    // Lógica para otros selects (ej. usuario_id).
    // Esta parte ahora usa el 'processedValue' original, lo cual es correcto.
    setNewVenta((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  const resetForm = () => {
    setNewVenta(initialState);
    setSelectedBienInfo({ precio_venta: 0, stock_actual: 0 });
    setFormError(null);
  };

  const handleAddMovimiento = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const { bien_id, usuario_id, cantidad } = newVenta;

    // --- Validación ---
    if (typeof bien_id !== "number" || bien_id <= 0) {
      // <-- CORREGIDO
      setFormError("Error: Debe seleccionar un producto.");
      return;
    }
    if (!cantidad || cantidad <= 0) {
      setFormError("Error: La cantidad debe ser mayor a 0.");
      return;
    }
    if (cantidad > selectedBienInfo.stock_actual) {
      setFormError(
        `Stock insuficiente. Solo hay ${selectedBienInfo.stock_actual} unidades.`
      );
      return;
    }

    // Calcular el total
    const totalVenta = (cantidad || 0) * selectedBienInfo.precio_venta;

    // --- Inserción en Supabase ---
    const dataToInsert = {
      bien_id,
      usuario_id: usuario_id || null,
      cantidad,
      tipo_movimiento: "Salida", // Hardcodeado
      fecha: new Date().toISOString(), // Hardcodeado
      motivo: "Venta", // Hardcodeado
      total_venta: totalVenta, // ¡Nuevo!
    };

    console.log("Datos a insertar en movimientos:", dataToInsert);

    try {
      const { data, error } = await supabase
        .from("movimientos")
        .insert([dataToInsert])
        .select();

      if (error) throw error;

      console.log("✅ Venta registrada:", data);

      // ¡IMPORTANTE! Aquí es donde deberías restar el stock.
      // La mejor forma es con un Trigger en Supabase (como te comenté).
      // La forma rápida (pero menos segura) es hacer otra llamada aquí:
      // await supabase.rpc('restar_stock', { bien_id_param: bien_id, cantidad_param: cantidad })

      resetForm();
      onMovimientoCreated(); // Refresca la tabla
      onClose(); // Cierra el modal
    } catch (err: any) {
      console.error("❌ Error al registrar venta:", err);
      setFormError(`Error al guardar: ${err.message}`);
    }
  };

  // --- Handlers del Mini-Modal ---

  const openMiniModal = (type: string) => {
    setCurrentType(type);
    setMiniModalOpen(true);
    setNewValue("");
    setMiniModalError(null);
  };

  const closeMiniModal = () => {
    setMiniModalOpen(false);
    setCurrentType(null);
    setNewValue("");
    setMiniModalError(null);
  };

  const handleCreateOption = async (e: FormEvent) => {
    e.preventDefault();
    if (!newValue.trim() || !currentType) {
      setMiniModalError("El nombre no puede estar vacío.");
      return;
    }

    try {
      const { data: insertedData, error } = await supabase
        .from(currentType)
        .insert([{ nombre: newValue }])
        .select("id, nombre");

      if (error) throw error;

      await loadOptions(); // Recarga todas las opciones

      const newItem = insertedData?.[0];
      if (newItem && currentType) {
        const fieldMap: { [key: string]: keyof VentaState } = {
          bienes: "bien_id",
          usuarios: "usuario_id",
        };
        const fieldToUpdate = fieldMap[currentType];
        if (fieldToUpdate) {
          handleSelectChange(fieldToUpdate, newItem.id);
        }
      }

      closeMiniModal();
    } catch (err: any) {
      console.error(`Error al crear ${currentType}:`, err);
      setMiniModalError(`Error: ${err.message || "Error desconocido"}`);
    }
  };

  // --- Valores Retornados ---
  return {
    newVenta, // Renombrado (antes newMovimiento)
    options,
    formError,
    handleInputChange,
    handleSelectChange,
    handleAddMovimiento, // Sigue siendo el mismo nombre de función

    selectedBienInfo, // ¡Nuevo!

    isMiniModalOpen,
    newValue,
    setNewValue,
    currentType,
    miniModalError,
    openMiniModal,
    closeMiniModal,
    handleCreateOption,
  };
}
