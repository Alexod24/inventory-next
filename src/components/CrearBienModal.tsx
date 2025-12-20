"use client";

import React from "react";
import ReactDOM from "react-dom";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/form/input/Input";
import Label from "@/components/form/Label";
import Select from "@/components/form/Seleccionar";
import { Button } from "@/components/ui/button";
import { useCrearBienForm } from "@/hooks/useCrearBienForm"; // <-- Tus importaciones
import { opcionesEstado, opcionesDisponibilidad } from "@/lib/options";

interface CrearBienModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBienCreated: () => void; // Función para refrescar la tabla
}

export function CrearBienModal({
  isOpen,
  onClose,
  onBienCreated,
}: CrearBienModalProps) {
  // --- Toda la lógica vive en el Hook ---
  const {
    newBien,
    options,
    // filteredSubcategories, // <-- ELIMINADO
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
    isManualCode, // <-- Nuevo
    setIsManualCode, // <-- Nuevo
  } = useCrearBienForm(onBienCreated, onClose);

  // No renderiza nada si no está abierto
  if (!isOpen) {
    return null;
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] m-4">
        <div
          className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11"
          style={{ maxHeight: "100vh" }}
        >
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Crear Registro
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Completa los campos para registrar un nuevo bien interno.
            </p>
          </div>
          <form className="flex flex-col" onSubmit={handleAddBien}>
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                {/* Código */}
                {/* Código */}
                <div className="col-span-full mb-2">
                  <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit mb-3">
                    <button
                      type="button"
                      onClick={() => setIsManualCode(false)}
                      className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                        !isManualCode
                          ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white"
                          : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                      }`}
                    >
                      Generar Automático
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsManualCode(true);
                        // Optional: Focus logic handled by autoFocus or ref if needed
                      }}
                      className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
                        isManualCode
                          ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white"
                          : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 5v14" />
                        <path d="M8 5v14" />
                        <path d="M12 5v14" />
                        <path d="M17 5v14" />
                        <path d="M21 5v14" />
                      </svg>
                      Escanear / Manual
                    </button>
                  </div>
                </div>

                {/* Código Interno (SKU) */}
                <div>
                  <Label>
                    Código Interno (SKU)
                    {isManualCode && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </Label>
                  <Input
                    type="text"
                    value={newBien.codigo}
                    name="codigo"
                    placeholder={
                      isManualCode
                        ? "Escribe el código interno manual"
                        : "Generado automáticamente (GAL-LIM-001)"
                    }
                    className={
                      !isManualCode
                        ? "!bg-gray-100 cursor-not-allowed opacity-70 text-gray-500"
                        : "bg-white"
                    }
                    readOnly={!isManualCode}
                    onChange={handleInputChange}
                  />
                  {!isManualCode && (
                    <p className="text-xs text-gray-400 mt-1">
                      Se genera según Nombre y Categoría.
                    </p>
                  )}
                </div>

                {/* Código de Barras (Scanner) */}
                <div>
                  <Label className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-blue-500"
                    >
                      <path d="M3 5v14" />
                      <path d="M8 5v14" />
                      <path d="M12 5v14" />
                      <path d="M17 5v14" />
                      <path d="M21 5v14" />
                    </svg>
                    Código de Barras (Escáner)
                  </Label>
                  <Input
                    type="text"
                    value={newBien.codigo_barras || ""}
                    name="codigo_barras"
                    placeholder="Escanea aquí (ej. 144382)"
                    className="bg-white font-mono text-lg ring-2 ring-blue-500/10 focus:ring-blue-500"
                    onChange={handleInputChange}
                    autoFocus // Focus here for scanning
                  />
                  <p className="text-xs text-blue-600 mt-1 animate-pulse">
                    Pistola lista: Escanea ahora
                  </p>
                </div>
                {/* Nombre */}
                <div>
                  <Label>Nombre</Label>
                  <Input
                    type="text"
                    name="nombre"
                    placeholder="Ej. Mesa plegable"
                    value={newBien.nombre || ""}
                    onChange={handleInputChange}
                  />
                </div>
                {/* Categoría */}
                <div>
                  <Label>Categoría</Label>
                  <div className="flex items-center space-x-2">
                    <Select
                      name="categoria_id"
                      options={options.categorias}
                      placeholder="Selecciona una categoría"
                      className="dark:bg-dark-900"
                      onChange={(value) =>
                        handleSelectChange("categoria_id", value)
                      }
                      // ----- ¡LA CORRECCIÓN ESTÁ AQUÍ! -----
                      // Convertimos el 'number' a 'string' para el <Select>
                      value={newBien.categoria_id?.toString()}
                    />
                    <Button
                      size="sm"
                      type="button" // <-- Añadido
                      onClick={() => openMiniModal("categorias")}
                    >
                      +
                    </Button>
                  </div>
                </div>
                {/* ----- BLOQUE DE SUBCATEGORÍA ELIMINADO ----- */}
                {/* Responsable (Usuario) */}
                <div>
                  <Label>Responsable</Label>
                  <Select
                    name="usuario_id"
                    options={options.usuarios}
                    placeholder="Selecciona un responsable"
                    onChange={(value) =>
                      handleSelectChange("usuario_id", value)
                    }
                    value={newBien.usuario_id || undefined} // Este ya es string (UUID), está OK
                  />
                </div>
                {/* --- BLOQUE UNIDAD DE MEDIDA ELIMINADO --- */}

                {/* Cantidad */}
                <div>
                  <Label>Stock</Label>
                  <Input
                    type="number"
                    name="cantidad"
                    placeholder="Ej. 10"
                    value={newBien.cantidad}
                    onChange={handleInputChange}
                  />
                </div>
                {/* Fecha Adquisición */}
                <div>
                  <Label>Fecha de creación</Label>
                  <Input
                    type="date"
                    name="fecha_adquisicion"
                    value={newBien.fecha_adquisicion}
                    onChange={handleInputChange}
                  />
                </div>
                {/* Valor Unitario */}
                <div>
                  <Label>Precio Compra</Label>
                  <Input
                    type="number"
                    name="valor"
                    step="0.01"
                    min="0"
                    placeholder="Ej. 250.00"
                    value={newBien.valor || ""}
                    onChange={handleInputChange}
                  />
                </div>
                {/* --- CAMPO AÑADIDO --- */}
                <div>
                  <Label>Precio de Venta</Label>
                  <Input
                    type="number"
                    name="precio_venta"
                    step="0.01"
                    min="0"
                    placeholder="Ej. 35.00"
                    value={newBien.precio_venta || ""}
                    onChange={handleInputChange}
                  />
                </div>
                {/* Precio x Mayor (NUEVO) */}
                <div>
                  <Label>Precio x Mayor</Label>
                  <Input
                    type="number"
                    name="precio_mayor"
                    step="0.01"
                    min="0"
                    placeholder="Ej. 30.00"
                    value={newBien.precio_mayor || ""}
                    onChange={handleInputChange}
                  />
                </div>
                {/* Proveedor */}
                <div>
                  <Label>Proveedor (Opcional)</Label>
                  <div className="flex items-center space-x-2">
                    <Select
                      name="proveedor_id"
                      options={options.proveedores}
                      placeholder="Selecciona un proveedor"
                      className="dark:bg-dark-900"
                      value={newBien.proveedor_id || undefined} // Este ya es string (UUID), está OK
                      onChange={(value) =>
                        handleSelectChange("proveedor_id", value)
                      }
                    />
                    <Button
                      size="sm"
                      type="button" // <-- Añadido
                      onClick={() => openMiniModal("proveedores")}
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* <div>
                  <Label>Disponibilidad</Label>
                  <Select
                    name="disponibilidad"
                    options={opcionesDisponibilidad}
                    placeholder="Selecciona la disponibilidad"
                    className="dark:bg-dark-900"
                    value={newBien.disponibilidad}
                    onChange={(value) =>
                      handleSelectChange(
              _             "disponibilidad",
                        value === "true" // Convierte a booleano
                      )
                    }
                  />
                </div> */}
                {/* Estado Físico */}
                {/* <div>
                  <Label>Estado Físico</Label>
                  <Select
                    name="estado"
                    options={opcionesEstado}
                    placeholder="Selecciona el estado físico"
                    className="dark:bg-dark-900"
                    value={newBien.estado}
                    onChange={(value) => handleSelectChange("estado", value)}
                  />
                </div> */}
                {/* Observaciones */}
                <div className="lg:col-span-2">
                  <Label>Observaciones (Opcional)</Label>
                  <textarea
                    name="observaciones"
                    className="w-full p-2 border rounded-lg dark:bg-dark-900 dark:text-white"
                    placeholder="Notas adicionales..."
                    value={newBien.observaciones || ""}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
                {/* Fechas (Deshabilitadas) */}
                {/* ... (Las omito por brevedad, ya estaban bien) ... */}
              </div>
            </div>

            {/* Error del Formulario */}
            {formError && (
              <p className="text-red-500 text-sm mt-4 px-2">{formError}</p>
            )}

            {/* Botones de acción */}
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button
                size="sm"
                variant="outline"
                type="button"
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button size="sm" type="submit">
                Crear Registro
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* --- Mini Modal (Portal) --- */}
      {isMiniModalOpen &&
        currentType &&
        ReactDOM.createPortal(
          <Modal
            isOpen={isMiniModalOpen}
            onClose={closeMiniModal}
            className="max-w-[400px] m-4"
          >
            <div className="w-full p-4 bg-white rounded-lg dark:bg-gray-900">
              <h4 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white/90">
                Agregar Nuevo{" "}
                {currentType.charAt(0).toUpperCase() + currentType.slice(1, -1)}
              </h4>
              <form onSubmit={handleCreateOption}>
                <Label>Nombre del {currentType.slice(0, -1)}</Label>
                <Input
                  type="text"
                  name="newValue"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder={`Ej. Nombre de ${currentType.slice(0, -1)}`}
                />
                {miniModalError && (
                  <p className="text-red-500 text-sm mt-2">{miniModalError}</p>
                )}
                <div className="flex justify-end mt-4 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    onClick={closeMiniModal}
                  >
                    Cancelar
                  </Button>
                  <Button size="sm" type="submit">
                    Crear
                  </Button>
                </div>
              </form>
            </div>
          </Modal>,
          document.body
        )}
    </>
  );
}
