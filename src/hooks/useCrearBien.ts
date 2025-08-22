// hooks/useCrearBien.ts
import { generateCode, calculateNextSuffix } from "@/utils/generateCode";
import { fetchSimilarCodes, insertarBien } from "@/services/bienesService";

export const useCrearBien = () => {
  const crearBienConCodigo = async (
    formData: Record<string, any>,
    options: any,
    nombreBien: string
  ) => {
    const categoriaNombre = options.categorias.find(
      (cat: { value: number; label: string }) =>
        cat.value === parseInt(formData.categoria)
    )?.label;

    const subcategoriaNombre = options.subcategorias.find(
      (subcat: { value: number; label: string }) =>
        subcat.value === parseInt(formData.subCategoria)
    )?.label;

    if (!categoriaNombre || !subcategoriaNombre || !nombreBien) {
      throw new Error("Faltan datos para generar el código");
    }

    const baseCode = generateCode(
      categoriaNombre,
      subcategoriaNombre,
      nombreBien,
      ""
    );
    const existingCodes = await fetchSimilarCodes(baseCode);
    const nextSuffix = calculateNextSuffix(existingCodes);
    const codigoGenerado = generateCode(
      categoriaNombre,
      subcategoriaNombre,
      nombreBien,
      nextSuffix
    );

    const mappedData = {
      codigo: codigoGenerado,
      nombre: formData.nombre,
      categoria_id: parseInt(formData.categoria),
      subcategoria_id: parseInt(formData.subCategoria),
      usuario_id: formData.usuario_id,
      espacio_id: parseInt(formData.espacio),
      cantidad: parseInt(formData.cantidad),
      fecha_adquisicion: formData.fecha
        ? new Date(formData.fecha).toISOString()
        : new Date().toISOString(),
      valor: parseFloat(formData.valor),
      proveedor_id: parseInt(formData.proveedor),
      disponibilidad: formData.disponibilidad === "true",
      estado: formData.estadoFisico,
      observaciones: formData.observaciones,
    };

    const result = await insertarBien(mappedData);
    return result;
  };

  return { crearBienConCodigo };
};
