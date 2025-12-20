"use client";

import React from "react";
import ReactDOM from "react-dom";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/form/input/Input";
import Label from "@/components/form/Label";
import Select from "@/components/form/Seleccionar";
import { Button } from "@/components/ui/button";
// 1. --- IMPORTAMOS EL HOOK DE VENTAS ---
// (Asegúrate que la ruta a tu hook de ventas sea esta)
import { useRegistrarVentaForm } from "@/hooks/useRegistrarVentaForm";

interface CrearMovimientoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMovimientoCreated: () => void; // Función para refrescar la tabla
}

// 2. --- AÑADIMOS EL FORMATEADOR DE MONEDA ---
const formatCurrency = (value: number) => {
  // Puedes cambiar 'es-PE' y 'PEN' a tu moneda local
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(value);
};

export function CrearMovimientoModal({
  isOpen,
  onClose,
  onMovimientoCreated,
}: CrearMovimientoModalProps) {
  // 3. --- USAMOS EL HOOK DE VENTAS ---
  const {
    newVenta, // Renombrado de newMovimiento
    options,
    formError,
    handleInputChange,
    handleSelectChange,
    handleAddMovimiento, // Esta es la función de 'submit' del hook
    selectedBienInfo, // ¡Importante!
    isMiniModalOpen,
    newValue,
    setNewValue,
    currentType,
    miniModalError,
    openMiniModal,
    closeMiniModal,
    handleCreateOption,
  } = useRegistrarVentaForm(onMovimientoCreated, onClose); // <--- Usando el hook correcto

  // No renderiza nada si no está abierto
  if (!isOpen) {
    return null;
  }

  // 4. --- CÁLCULO DE TOTAL EN TIEMPO REAL ---
  const totalVenta = (newVenta.cantidad || 0) * selectedBienInfo.precio_venta;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] m-4">
        <div
          className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11"
          style={{ maxHeight: "100vh" }}
        >
          <div className="px-2 pr-14">
            {/* 5. --- TÍTULO ACTUALIZADO --- */}
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Registrar Venta
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Completa los campos para registrar una nueva venta.
            </p>
          </div>

          <form className="flex flex-col" onSubmit={handleAddMovimiento}>
            <div className="px-2 overflow-y-auto custom-scrollbar">
              {/* 6. --- FORMULARIO DE VENTA ACTUALIZADO --- */}
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                {/* Bien (Producto) */}
                <div className="lg:col-span-2">
                  <Label>Producto</Label>
                  <div className="flex items-center space-x-2">
                    <Select
                      name="bien_id"
                      options={options.bienes}
                      placeholder="Selecciona el producto"
                      className="dark:bg-dark-900"
                      value={newVenta.bien_id?.toString() || ""}
                      onChange={(value) => handleSelectChange("bien_id", value)}
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

                {/* Stock Disponible (Nuevo) */}
                <div>
                  <Label>Stock Disponible</Label>
                  <Input
                    type="text"
                    name="stock_actual"
                    value={selectedBienInfo.stock_actual}
                    className="!bg-gray-200 cursor-not-allowed"
                    readOnly
                  />
                </div>

                {/* Precio Unitario (Nuevo) */}
                <div>
                  <Label>Precio Unitario</Label>
                  <Input
                    type="text"
                    name="precio_unitario"
                    value={formatCurrency(selectedBienInfo.precio_venta)}
                    className="!bg-gray-200 cursor-not-allowed"
                    readOnly
                  />
                </div>

                {/* Cantidad */}
                <div>
                  <Label>Cantidad a Vender</Label>
                  <Input
                    type="number"
                    name="cantidad"
                    min="1"
                    placeholder="Ej. 2"
                    value={newVenta.cantidad || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Total Venta (Nuevo) */}
                <div>
                  <Label>Total Venta</Label>
                  <Input
                    type="text"
                    name="total_venta"
                    value={formatCurrency(totalVenta)}
                    className="!bg-gray-200 cursor-not-allowed"
                    readOnly
                  />
                </div>

                {/* Vendedor (Usuario) */}
                <div className="lg:col-span-2">
                  <Label>Vendedor </Label>
                  <div className="flex items-center space-x-2">
                    <Select
                      name="usuario_id"
                      options={options.usuarios}
                      placeholder="Selecciona un vendedor"
                      className="dark:bg-dark-900"
                      value={newVenta.usuario_id}
                      onChange={(value) =>
                        handleSelectChange("usuario_id", value)
                      }
                    />
                    <Button
                      size="sm"
                      type="button"
                      onClick={() => openMiniModal("usuarios")}
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* --- CAMPOS GENÉRICOS ELIMINADOS --- */}
                {/* (Tipo de Movimiento, Motivo y Fecha) */}
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
                Registrar Venta
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
