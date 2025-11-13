"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { supabase } from "@/app/utils/supabase/supabase";
import { Option } from "@/lib/options";

// Opciones de Selects
interface FormOptions {
  bienes: Option[]; // Solo necesitamos el ID y nombre
}

// Tipo para el formulario de Ingreso
interface IngresoState {
  producto?: string; // Columna 'producto' (UUID)
  cantidad?: number;
  fecha?: string;
  descripcion?: string;
}

// Estado Inicial del Formulario
const initialState: IngresoState = {
  producto: undefined,
  cantidad: 1,
  fecha: new Date().toISOString().split("T")[0],
  descripcion: "",
};

// --- El Hook ---
export function useRegistrarIngresoForm(
  onIngresoCreated: () => void,
  onClose: () => void
) {
  const [newIngreso, setNewIngreso] = useState<IngresoState>(initialState);
  const [options, setOptions] = useState<FormOptions>({
    bienes: [],
  });
  const [formError, setFormError] = useState<string | null>(null);

  // --- Mini-Modal State (para crear productos al vuelo) ---
  const [isMiniModalOpen, setMiniModalOpen] = useState(false);
  const [newValue, setNewValue] = useState("");
  const [currentType, setCurrentType] = useState<string | null>(null);
  const [miniModalError, setMiniModalError] = useState<string | null>(null);

  // Carga de datos (solo 'bienes')
  const loadOptions = async () => {
    try {
      const { data: bienesData, error } = await supabase
        .from("bienes")
        .select("id, nombre");

      if (error) throw error;

      setOptions({
        bienes:
          bienesData?.map((b) => ({
            value: b.id,
            label: b.nombre,
          })) || [],
      });
    } catch (error) {
      console.error("Error en loadOptions:", error);
      setFormError("Error al cargar productos. Intente de nuevo.");
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
    setNewIngreso((prev) => ({
      ...prev,
      // Convierte la cantidad a número, el resto déjalo como texto/fecha
      [name]: name === "cantidad" ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleSelectChange = (
    name: string,
    value: string | number | boolean
  ) => {
    setNewIngreso((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setNewIngreso(initialState);
    setFormError(null);
  };

  const handleAddIngreso = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const { producto, cantidad, fecha, descripcion } = newIngreso;

    // --- Validación (tu código existente) ---
    if (typeof producto !== "string" || !producto) {
      setFormError("Error: Debe seleccionar un producto.");
      return;
    }
    if (!cantidad || cantidad <= 0) {
      setFormError("Error: La cantidad debe ser mayor a 0.");
      return;
    }

    // --- Inserción en Supabase ---
    const dataToInsert = {
      producto, // Esta es la columna UUID/string en 'ingresos'
      cantidad,
      fecha: new Date(fecha || new Date()).toISOString(),
      descripcion: descripcion || null,
    };

    // --- LOGGING STEP 1: Data Check ---
    console.log("LOG 1: FINAL DATA SENT:", dataToInsert);
    // --- END LOGGING STEP 1 ---

    try {
      const { data, error } = await supabase
        .from("ingresos")
        .insert([dataToInsert])
        .select();

      if (error) throw error;

      console.log("LOG 2: ✅ Ingreso registrado, DB response:", data);

      // El trigger debe ejecutarse aquí para sumar el stock.

      resetForm();
      onIngresoCreated();
      onClose();
    } catch (err: any) {
      // --- LOGGING STEP 3: Detailed Error Check ---
      console.error("LOG 3: ❌ Error al registrar ingreso. Detalles:", {
        code: err.code,
        message: err.message,
        details: err.details,
        hint: err.hint,
      });
      // Fallback display error
      setFormError(
        `Error al guardar: ${
          err.message || "Error desconocido. Revise la consola para detalles."
        }`
      );
      // --- END LOGGING STEP 3 ---
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
      // Asumimos que 'currentType' es 'bienes'
      const { data: insertedData, error } = await supabase
        .from(currentType)
        .insert([{ nombre: newValue }])
        .select("id, nombre");

      if (error) throw error;

      console.log(
        "LOG 4: ✅ Nuevo bien creado desde Mini-Modal:",
        insertedData
      ); // <-- LOG AÑADIDO

      await loadOptions();

      // Auto-selecciona el 'bien' recién creado
      const newItem = insertedData?.[0];
      if (newItem && currentType === "bienes") {
        handleSelectChange("producto", newItem.id);
      }

      closeMiniModal();
    } catch (err: any) {
      // --- LOGGING STEP 5: Mini-Modal Error Check ---
      console.error("LOG 5: ❌ Error al crear bien (Mini-Modal). Detalles:", {
        code: err.code,
        message: err.message,
        details: err.details,
      });
      setMiniModalError(`Error: ${err.message || "Error desconocido"}`);
      // --- END LOGGING STEP 5 ---
    }
  };

  // --- Valores Retornados ---
  return {
    newIngreso,
    options,
    formError,
    handleInputChange,
    handleSelectChange,
    handleAddIngreso,

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
