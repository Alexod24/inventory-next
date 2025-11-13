"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { supabase } from "@/app/utils/supabase/supabase";
import { Bienes } from "@/components/tabla/bienes/schema"; // Asumo que este path es correcto
import { Option, opcionesEstado, opcionesDisponibilidad } from "@/lib/options"; // Asumo que este path es correcto

// --- Helpers (Funciones Puras) ---

// 1. NUEVA FUNCIÓN: Genera solo la base del código (Ej: CEM-CON)
const getBaseCode = (nombre: string, categoriaNombre: string) => {
  // 3 primeras letras del nombre (Ej: "Cemento Sol" -> "CEM")
  const nombreCode = nombre.slice(0, 3).toUpperCase();
  // 3 primeras letras de la categoría (Ej: "Construccion" -> "CON")
  const categoriaCode = categoriaNombre.slice(0, 3).toUpperCase();
  return `${nombreCode}-${categoriaCode}`; // Devuelve "CEM-CON"
};

// 2. Modificada para usar la base y REQUERIR un sufijo
const generateCode = (
  nombre: string,
  categoriaNombre: string,
  suffix: string // Ya no es opcional
) => {
  const base = getBaseCode(nombre, categoriaNombre);
  // Ej: "CEM-CON" + "-" + "001" -> "CEM-CON-001"
  return `${base}-${suffix}`;
};

const fetchSimilarCodes = async (baseCode: string) => {
  const { data, error } = await supabase
    .from("bienes")
    .select("codigo")
    .like("codigo", `${baseCode}%`); // Busca "CEM-CON%"

  if (error) {
    console.error("Error al buscar códigos similares:", error);
    return [];
  }
  return data.map((item) => item.codigo);
};

const calculateNextSuffix = (existingCodes: string[], baseCode: string) => {
  const suffixes = existingCodes
    .map((code) => {
      const match = code.match(/-(\d{3})$/);
      return match ? parseInt(match[1], 10) : null;
    })
    .filter((num) => num !== null);

  const nextSuffix = Math.max(0, ...suffixes) + 1;
  return nextSuffix.toString().padStart(3, "0");
};

// --- Opciones de Selects ---
interface FormOptions {
  categorias: Option[];
  // subcategorias: Option[]; // Eliminado
  proveedores: Option[];
  espacios: Option[];
  usuarios: Option[];
}

// --- Estado Inicial del Formulario ---
const initialState: Partial<Bienes> = {
  codigo: "",
  nombre: "",
  categoria_id: undefined,
  // subcategoria_id: undefined, // Eliminado
  proveedor_id: undefined,
  espacio_id: undefined,
  cantidad: 1, // Es mejor empezar en 1 que en 0
  fecha_adquisicion: new Date().toISOString().split("T")[0],
  valor: 0, // <-- Este es tu 'precio_compra'
  precio_venta: 0, // <-- AÑADIDO
  estado: opcionesEstado[0]?.value as string,
  disponibilidad: Boolean(opcionesDisponibilidad[0]?.value),
  observaciones: "",
  usuario_id: undefined,
};

// --- El Hook ---
export function useCrearBienForm(
  onBienCreated: () => void,
  onClose: () => void
) {
  const [newBien, setNewBien] = useState<Partial<Bienes>>(initialState);
  const [options, setOptions] = useState<FormOptions>({
    categorias: [],
    // subcategorias: [], // Eliminado
    proveedores: [],
    espacios: [],
    usuarios: [],
  });

  // *** ESTADO TEMPORAL ***
  // Para guardar el *nombre* de la categoría seleccionada
  const [tempCategoriaNombre, setTempCategoriaNombre] = useState("");

  const [formError, setFormError] = useState<string | null>(null);

  // --- Mini-Modal State ---
  const [isMiniModalOpen, setMiniModalOpen] = useState(false);
  const [newValue, setNewValue] = useState("");
  const [currentType, setCurrentType] = useState<string | null>(null);
  const [miniModalError, setMiniModalError] = useState<string | null>(null);

  // Carga de datos para todos los Selects
  const loadDataAndOptions = async () => {
    try {
      const [
        categoriasData,
        // subcategoriasData, // Eliminado
        proveedoresData,
        espaciosData,
        usuariosData,
      ] = await Promise.all([
        supabase.from("categorias").select("id, nombre"),
        // supabase.from("subcategorias").select("id, nombre, categoria_id"), // Eliminado
        supabase.from("proveedores").select("id, nombre"),
        supabase.from("espacios").select("id, nombre"),
        supabase.from("usuarios").select("id, nombre"),
      ]);

      setOptions({
        categorias:
          categoriasData.data?.map((c) => ({ value: c.id, label: c.nombre })) ||
          [],
        proveedores:
          proveedoresData.data?.map((p) => ({
            value: p.id,
            label: p.nombre,
          })) || [],
        espacios:
          espaciosData.data?.map((e) => ({ value: e.id, label: e.nombre })) ||
          [],
        usuarios:
          usuariosData.data?.map((u) => ({ value: u.id, label: u.nombre })) ||
          [],
      });
    } catch (error) {
      console.error("Error en loadDataAndOptions:", error);
      setFormError("Error al cargar datos. Intente de nuevo.");
    }
  };

  // Carga inicial de datos (solo una vez)
  useEffect(() => {
    loadDataAndOptions();
  }, []);

  // Efecto para generar el código (borrador)
  useEffect(() => {
    const categoriaLabel = tempCategoriaNombre;

    if (categoriaLabel && newBien.nombre) {
      const base = getBaseCode(newBien.nombre, categoriaLabel);
      setNewBien((prev) => ({
        ...prev,
        codigo: `${base}-AUTOGEN`, // Sufijo temporal "CEM-CON-AUTOGEN"
      }));
    } else {
      setNewBien((prev) => ({ ...prev, codigo: "" }));
    }
  }, [
    tempCategoriaNombre, // Depende del nombre temporal
    newBien.nombre,
  ]);

  // --- Handlers del Formulario Principal ---

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    setNewBien((prev) => ({
      ...prev,
      [name]:
        type === "number"
          ? parseFloat(value) || 0
          : type === "date"
          ? value
          : value,
    }));
  };

  // `handleSelectChange` (Corregido para manejar Números y UUIDs)
  const handleSelectChange = (
    name: string,
    value: string | number | boolean
  ) => {
    let processedValue: string | number | boolean | undefined = value;

    // Solo aplicamos parseInt si el campo es EXACTAMENTE 'categoria_id'
    // y el valor es un string (viene del <select>)
    if (name === "categoria_id" && typeof value === "string") {
      const numValue = parseInt(value, 10);

      // Asigna el número o undefined si no es un número válido (ej. placeholder)
      processedValue = isNaN(numValue) ? undefined : numValue;
    }
    // Para todos los demás campos (como 'espacio_id', 'usuario_id' que son UUIDs),
    // processedValue simplemente será el 'value' original (el string UUID),
    // lo cual es correcto.

    setNewBien((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    // Esta parte sigue siendo necesaria para el nombre de la categoría
    if (name === "categoria_id") {
      console.log(
        `[LOG 1] handleSelectChange: Buscando categoría para ID = ${processedValue}`
      );

      // 'processedValue' será un NÚMERO (ej: 5) o undefined
      const selectedOption = options.categorias.find(
        (opt) => opt.value === processedValue
      );
      const label = selectedOption?.label || "";

      console.log(`[LOG 2] handleSelectChange: Nombre encontrado = "${label}"`);
      setTempCategoriaNombre(label);
    }
  };

  // `resetForm` (Actualizado)
  const resetForm = () => {
    setNewBien(initialState);
    setFormError(null);
    setTempCategoriaNombre(""); // Limpia el nombre temporal
  };

  // `handleAddBien` (Actualizado)
  const handleAddBien = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // --- Validación ---
    const requiredFields: (keyof Bienes)[] = [
      "nombre",
      "categoria_id",
      // "subcategoria_id", // Eliminado
      "espacio_id",
      "usuario_id",
      "cantidad",
      "valor", // precio_compra
      "precio_venta", // AÑADIDO
      "estado",
      "fecha_adquisicion",
    ];

    for (const field of requiredFields) {
      // --- LÓGICA CORREGIDA ---

      // 1. Primero, revisamos si el valor es 0.
      if (newBien[field] === 0) {
        // Si es 0, nos aseguramos de que sea uno de los campos numéricos permitidos.
        if (
          field === "cantidad" ||
          field === "valor" ||
          field === "precio_venta"
        ) {
          continue; // Es un 0 válido, pasamos al siguiente campo.
        }
      }

      // 2. Si no es 0, revisamos si está vacío (null, undefined, o string vacío).
      if (
        newBien[field] === undefined ||
        newBien[field] === null ||
        newBien[field] === ""
      ) {
        // Si está vacío, es un error.
        console.error(`❌ Campo faltante: ${field}`);
        setFormError(`El campo "${field}" es obligatorio.`);
        return;
      }
    }

    // --- Generación final del código ---
    const categoriaNombre = tempCategoriaNombre; // Usa el nombre guardado

    console.log(`[LOG 3] handleAddBien: Iniciando generación de código.`);
    console.log(
      `[LOG 3] handleAddBien: Nombre del producto = "${newBien.nombre || ""}"`
    );
    console.log(
      `[LOG 3] handleAddBien: Nombre de categoría (from tempState) = "${categoriaNombre}"`
    );

    const baseCode = getBaseCode(newBien.nombre || "", categoriaNombre);
    console.log(
      `[LOG 4] handleAddBien: Base del código generado = "${baseCode}"`
    );

    const similarCodes = await fetchSimilarCodes(baseCode);
    const nextSuffix = calculateNextSuffix(similarCodes, baseCode);

    const finalCode = generateCode(
      newBien.nombre || "",
      categoriaNombre,
      nextSuffix
    );

    console.log(
      `[LOG 5] handleAddBien: Código final generado = "${finalCode}"`
    );

    // --- Inserción en Supabase ---
    const dataToInsert = {
      ...newBien,
      codigo: finalCode,
      proveedor_id: newBien.proveedor_id || null,
      observaciones: newBien.observaciones || "",
    };

    try {
      const { data, error } = await supabase
        .from("bienes")
        .insert([dataToInsert])
        .select();

      if (error) throw error;

      console.log("✅ Bien insertado:", data);

      resetForm();
      onBienCreated();
      onClose();
    } catch (err: any) {
      console.error("❌ Error al añadir bien:", err);
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

  // `handleCreateOption` (Actualizado)
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

      await loadDataAndOptions();

      const newItem = insertedData?.[0];
      if (newItem && currentType) {
        const fieldMap: { [key: string]: keyof Bienes } = {
          categorias: "categoria_id",
          proveedores: "proveedor_id",
          espacios: "espacio_id",
          usuarios: "usuario_id",
        };
        const fieldToUpdate = fieldMap[currentType];
        if (fieldToUpdate) {
          let newId: string | number = newItem.id;
          // Si creamos una categoría, su ID es un número
          if (currentType === "categorias") {
            newId = parseInt(newItem.id, 10);
            if (!isNaN(newId)) {
              setTempCategoriaNombre(newItem.nombre); // Guarda el nombre de la new cat
            }
          }

          setNewBien((prev) => ({ ...prev, [fieldToUpdate]: newId }));
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
    newBien,
    options,
    formError,
    handleInputChange,
    handleSelectChange,
    handleAddBien,

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
