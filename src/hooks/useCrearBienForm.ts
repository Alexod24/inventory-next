"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { supabase } from "@/app/utils/supabase/supabase";
import { Bienes } from "@/components/tabla/productos/schema"; // UPDATED PATH
import { Option, opcionesEstado, opcionesDisponibilidad } from "@/lib/options";
import { useSede } from "@/context/SedeContext";

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
    .from("productos") // UPDATED: productos
    .select("codigo")
    .like("codigo", `${baseCode}%`);

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
  proveedores: Option[];
  espacios: Option[];
  usuarios: Option[];
}

// --- Estado Inicial del Formulario ---
const initialState: Partial<Bienes> = {
  codigo: "",
  codigo_barras: "",
  nombre: "",
  categoria_id: undefined,
  proveedor_id: undefined,
  espacio_id: undefined,
  cantidad: 1,
  fecha_adquisicion: new Date().toISOString().split("T")[0],
  valor: 0,
  precio_venta: 0,
  precio_mayor: 0,
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
  const { sedeActual } = useSede(); // Hook Sede used early

  const [newBien, setNewBien] = useState<Partial<Bienes>>(initialState);
  const [options, setOptions] = useState<FormOptions>({
    categorias: [],
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
      const [categoriasData, proveedoresData, espaciosData, usuariosData] =
        await Promise.all([
          supabase.from("categorias").select("id, nombre"),
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
  // --- Modo de Código (Auto vs Manual/Escáner) ---
  const [isManualCode, setIsManualCode] = useState(false);

  // Efecto para crear/generar el código AUTOMÁTICO (borrador)
  useEffect(() => {
    // SI ESTAMOS EN MODO MANUAL, NO GENERAR NADA
    if (isManualCode) return;

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
    isManualCode, // Dependencia añadida
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

  // `handleSelectChange`
  const handleSelectChange = (
    name: string,
    value: string | number | boolean
  ) => {
    let processedValue: string | number | boolean | undefined = value;

    if (name === "categoria_id" && typeof value === "string") {
      const numValue = parseInt(value, 10);
      processedValue = isNaN(numValue) ? undefined : numValue;
    }

    setNewBien((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    // Esta parte sigue siendo necesaria para el nombre de la categoría
    if (name === "categoria_id") {
      const selectedOption = options.categorias.find(
        (opt) => opt.value === processedValue
      );
      const label = selectedOption?.label || "";
      setTempCategoriaNombre(label);
    }
  };

  // `resetForm`
  const resetForm = () => {
    setNewBien(initialState);
    setFormError(null);
    setTempCategoriaNombre("");
  };

  // `handleAddBien` Modification: Don't re-generate code if Manual
  const handleAddBien = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!sedeActual) {
      setFormError("No se ha seleccionado una sede válida.");
      return;
    }

    // --- Validación ---
    const requiredFields: (keyof Bienes)[] = [
      "nombre",
      // "categoria_id",
      "cantidad",
      "valor",
      "precio_venta",
      "precio_mayor",
      "fecha_adquisicion",
    ];

    // Si es manual, el código ES obligatorio
    if (isManualCode) {
      if (!newBien.codigo) {
        setFormError("El código es obligatorio en modo manual.");
        return;
      }
    }

    for (const field of requiredFields) {
      if (
        newBien[field] === 0 &&
        (field === "cantidad" ||
          field === "valor" ||
          field === "precio_venta" ||
          field === "precio_mayor")
      ) {
        continue;
      }
      if (
        newBien[field] === undefined ||
        newBien[field] === null ||
        newBien[field] === ""
      ) {
        setFormError(`El campo "${field}" es obligatorio.`);
        return;
      }
    }

    let finalCode = newBien.codigo || "";

    // Si NO es manual, generamos el final real (reemplazando AUTOGEN)
    if (!isManualCode) {
      const categoriaNombre = tempCategoriaNombre || "GENERAL";
      const baseCode = getBaseCode(newBien.nombre || "", categoriaNombre);
      const similarCodes = await fetchSimilarCodes(baseCode);
      const nextSuffix = calculateNextSuffix(similarCodes, baseCode);
      finalCode = generateCode(
        newBien.nombre || "",
        categoriaNombre,
        nextSuffix
      );
    }

    // --- Inserción en 'productos' (Catálogo Global/Sede) ---
    const productData = {
      nombre: newBien.nombre,
      descripcion: newBien.observaciones || "",
      precio_compra: newBien.valor || 0,
      precio_venta: newBien.precio_venta || 0,
      fecha_c: newBien.fecha_adquisicion || new Date().toISOString(),
      categoria: tempCategoriaNombre || "GENERAL", // Use temp var usually
      codigo: finalCode,
      codigo_barras: newBien.codigo_barras || null, // <-- AÑADIDO
      sede_id: sedeActual.id, // ISOLATION
      precio_mayor: newBien.precio_mayor || 0,
      proveedor_id: newBien.proveedor_id || null,
      usuario_id: newBien.usuario_id || null,
    };

    try {
      // 1. Insertar Producto
      const { data: insertedProduct, error: prodError } = await supabase
        .from("productos")
        .insert([productData])
        .select()
        .single();

      if (prodError) throw prodError;

      console.log("✅ Producto creado:", insertedProduct);

      // 2. Insertar Inventario Inicial (Stock)
      const inventoryData = {
        producto_id: insertedProduct.id,
        sede_id: sedeActual.id,
        stock_actual: newBien.cantidad || 0,
        stock_minimo: 5,
        ubicacion: "Almacén Principal",
        fecha_actualizacion: new Date().toISOString(),
      };

      const { error: stockError } = await supabase
        .from("inventario_sedes")
        .insert([inventoryData]);

      if (stockError) {
        console.error("❌ Error creando inventario:", stockError);
        throw new Error(
          "Producto creado pero falló el inventario inicial: " +
            stockError.message
        );
      }

      console.log("✅ Inventario inicial creado");

      resetForm();
      onBienCreated();
      onClose();
    } catch (err: any) {
      console.error("❌ Error al añadir bien:", err);
      // Check for duplicate key error on code
      if (
        err.message &&
        err.message.includes("duplicate key value violates unique constraint")
      ) {
        setFormError(`El código "${finalCode}" ya existe. Intente otro.`);
      } else {
        setFormError(`Error al guardar: ${err.message}`);
      }
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
          if (currentType === "categorias") {
            newId = parseInt(newItem.id, 10);
            if (!isNaN(newId)) {
              setTempCategoriaNombre(newItem.nombre);
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
    isMiniModalOpen,
    newValue,
    setNewValue,
    currentType,
    miniModalError,
    openMiniModal,
    closeMiniModal,
    handleCreateOption,
    // New exports
    isManualCode,
    setIsManualCode,
  };
}
