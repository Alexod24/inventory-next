"use client";

import React from "react";
import ReactDOM from "react-dom";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/form/input/Input";
import Label from "@/components/form/Label";
import Select from "@/components/form/Seleccionar";
import { Button } from "@/components/ui/button";
import { useRegistrarIngresoForm } from "@/hooks/useRegistrarIngresoForm"; // <-- Importamos el NUEVO Hook

interface RegistrarIngresoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIngresoCreated: () => void; // Función para refrescar la tabla
}

export function RegistrarIngresoModal({
  isOpen,
  onClose,
  onIngresoCreated,
}: RegistrarIngresoModalProps) {
  const {
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
  } = useRegistrarIngresoForm(onIngresoCreated, onClose);

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
              Registrar Ingreso
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Registra una nueva entrada de mercadería al inventario.
            </p>
          </div>

          <form className="flex flex-col" onSubmit={handleAddIngreso}>
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                {/* Producto */}
                <div className="lg:col-span-2">
                  <Label>Producto</Label>
                  <div className="flex items-center space-x-2">
                    <Select
                      name="producto" // Coincide con la tabla 'ingresos'
                      options={options.bienes}
                      placeholder="Selecciona el producto"
                      className="dark:bg-dark-900"
                      value={newIngreso.producto}
                      onChange={(value) =>
                        handleSelectChange("producto", value)
                      }
                    />
                    <Button
                      size="sm"
                      type="button"
                      onClick={() => openMiniModal("bienes")}
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Cantidad */}
                <div>
                  <Label>Cantidad</Label>
                  <Input
                    type="number"
                    name="cantidad"
                    min="1"
                    placeholder="Ej. 50"
                    value={newIngreso.cantidad || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Fecha */}
                <div>
                  <Label>Fecha de Ingreso</Label>
                  <Input
                    type="date"
                    name="fecha"
                    value={newIngreso.fecha}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Descripcion (Motivo) */}
                <div className="lg:col-span-2">
                  <Label>Descripción (Opcional)</Label>
                  <textarea
                    name="descripcion" // Coincide con la tabla 'ingresos'
                    className="w-full p-2 border rounded-lg dark:bg-dark-900 dark:text-white"
                    placeholder="Ej. Compra a proveedor, Guía de Remisión 001-123..."
                    value={newIngreso.descripcion || ""}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
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
                Registrar Ingreso
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
