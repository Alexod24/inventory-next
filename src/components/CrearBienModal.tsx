"use client";

import React from "react";
import ReactDOM from "react-dom";
import { Modal } from "@/components/ui/modal/index";
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
                <div>
                  <Label>Código</Label>
                  <Input
                    type="text"
                    value={newBien.codigo}
                    name="codigo"
                    placeholder="Código generado automáticamente"
                    className="!bg-gray-200 cursor-not-allowed"
                    readOnly
                  />
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
