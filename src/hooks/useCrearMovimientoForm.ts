"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { supabase } from "@/app/utils/supabase/supabase";
import { Option } from "@/lib/options"; // Asumo que tienes un Option type

// Opciones de Selects
interface FormOptions {
  bienes: Option[];
  usuarios: Option[];
}

// Tipo para el formulario
interface MovimientoState {
  bien_id?: number | string; // ID del bien
  usuario_id?: string; // ID del usuario (UUID)
  cantidad?: number;
  tipo_movimiento?: string; // "Ingreso" o "Salida"
  fecha?: string;
  motivo?: string;
}

const opcionesMovimiento = [
  { value: "Ingreso", label: "Ingreso" },
  { value: "Salida", label: "Salida" },
];

// Estado Inicial del Formulario
const initialState: MovimientoState = {
  bien_id: undefined,
  usuario_id: undefined,
  cantidad: 1,
  tipo_movimiento: "Ingreso", // Valor por defecto
  fecha: new Date().toISOString().split("T")[0], // Fecha actual
  motivo: "",
};

// --- El Hook ---
export function useCrearMovimientoForm(
  onMovimientoCreated: () => void,
  onClose: () => void
) {
  const [newMovimiento, setNewMovimiento] =
    useState<MovimientoState>(initialState);
  const [options, setOptions] = useState<FormOptions>({
    bienes: [],
    usuarios: [],
  });
  const [formError, setFormError] = useState<string | null>(null);

  // --- Mini-Modal State (Igual que antes) ---
  const [isMiniModalOpen, setMiniModalOpen] = useState(false);
  const [newValue, setNewValue] = useState("");
  const [currentType, setCurrentType] = useState<string | null>(null);
  const [miniModalError, setMiniModalError] = useState<string | null>(null);

  // Carga de datos para los Selects (bienes y usuarios)
  const loadOptions = async () => {
    try {
      const [bienesData, usuariosData] = await Promise.all([
        supabase.from("bienes").select("id, nombre"),
        supabase.from("usuarios").select("id, nombre"),
      ]);

      setOptions({
        bienes:
          bienesData.data?.map((b) => ({ value: b.id, label: b.nombre })) || [],
        usuarios:
          usuariosData.data?.map((u) => ({ value: u.id, label: u.nombre })) ||
          [],
      });
    } catch (error) {
      console.error("Error en loadOptions:", error);
      setFormError("Error al cargar datos. Intente de nuevo.");
    }
  };

  // Carga inicial de datos
  useEffect(() => {
    loadOptions();
  }, []);

  // --- Handlers del Formulario Principal ---

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setNewMovimiento((prev) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleSelectChange = (
    name: string,
    value: string | number | boolean
  ) => {
    // Convertimos a número si es 'bien_id', si no, lo dejamos como string (para UUIDs)
    let processedValue: string | number | boolean | undefined = value;
    if (name === "bien_id" && typeof value === "string") {
      const numValue = parseInt(value, 10);
      processedValue = isNaN(numValue) ? undefined : numValue;
    }

    setNewMovimiento((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  const resetForm = () => {
    setNewMovimiento(initialState);
    setFormError(null);
  };

  const handleAddMovimiento = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // --- Validación (leyendo desde el estado) ---
    const { bien_id, usuario_id, cantidad, tipo_movimiento, fecha, motivo } =
      newMovimiento;

    if (typeof bien_id !== "number" || bien_id <= 0) {
      setFormError("Error: ID de bien inválido.");
      return;
    }
    if (usuario_id && !/^[0-9a-fA-F-]{36}$/.test(usuario_id)) {
      setFormError("Error: ID de usuario no es un UUID válido.");
      return;
    }
    if (!cantidad || cantidad <= 0) {
      setFormError("Error: Cantidad inválida.");
      return;
    }
    if (!tipo_movimiento || !["Ingreso", "Salida"].includes(tipo_movimiento)) {
      setFormError("Error: Tipo de movimiento inválido.");
      return;
    }
    if (!fecha || isNaN(new Date(fecha).getTime())) {
      setFormError("Error: Fecha no proporcionada o inválida.");
      return;
    }

    // --- Inserción en Supabase ---
    const dataToInsert = {
      bien_id,
      usuario_id: usuario_id || null,
      cantidad,
      tipo_movimiento,
      fecha: new Date(fecha).toISOString(),
      motivo: motivo || null,
    };

    console.log("Datos a insertar en movimientos:", dataToInsert);

    try {
      const { data, error } = await supabase
        .from("movimientos")
        .insert([dataToInsert])
        .select(); // Ya no necesitamos el select() largo

      if (error) throw error;

      console.log("✅ Movimiento creado:", data);

      resetForm();
      onMovimientoCreated(); // Refresca la tabla (prop del padre)
      onClose(); // Cierra el modal (prop del padre)
    } catch (err: any) {
      console.error("❌ Error al crear movimiento:", err);
      setFormError(`Error al guardar: ${err.message}`);
    }
  };

  // --- Handlers del Mini-Modal (Igual que antes) ---

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

      // Opcional: auto-selecciona el valor recién creado
      const newItem = insertedData?.[0];
      if (newItem && currentType) {
        const fieldMap: { [key: string]: keyof MovimientoState } = {
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
    newMovimiento,
    options,
    opcionesMovimiento, // Exportamos las opciones estáticas
    formError,
    handleInputChange,
    handleSelectChange,
    handleAddMovimiento,

    // Mini-Modal props
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
