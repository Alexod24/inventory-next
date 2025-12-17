"use client";
import { jsPDF } from "jspdf";
import autoTable, { CellInput, RowInput } from "jspdf-autotable";
import { Table } from "@tanstack/react-table";

export async function exportarToPDF<TData>(table: Table<TData>) {
  const doc = new jsPDF({ orientation: "landscape" });

  const logoPath = "/images/logo/labase.png";

  const loadImage = (src: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
    });

  try {
    // Intentar cargar el logo
    try {
      const img = await loadImage(logoPath);
      doc.addImage(img, "PNG", 10, 8, 30, 15);
    } catch {
      console.warn("Logo no cargado, el PDF seguirá sin él.");
    }

    // Título
    doc.setFontSize(18);
    doc.setTextColor("#e9a20c");
    doc.text("LISTA DE BIENES", 50, 20);

    // Columnas visibles
    const visibleColumns = table
      .getAllColumns()
      .filter(
        (col) =>
          col.getIsVisible() &&
          col.id !== "fecha_adquisicion" &&
          col.id !== "actualizado_en"
      );

    if (visibleColumns.length === 0) {
      throw new Error("No hay columnas visibles.");
    }

    const headers: CellInput[] = visibleColumns.map((col) =>
      String(col.id).toUpperCase()
    );

    // Filas visibles
    const rows = table.getRowModel().rows;
    if (rows.length === 0) {
      throw new Error("No hay filas visibles.");
    }

    // Transformar datos con tipado estricto
    const data: CellInput[][] = rows.map((row) =>
      visibleColumns.map((col) => {
        const val = row.getValue(col.id);

        if (col.id === "disponibilidad") {
          return val ? "OK" : "Faltante";
        }

        if (col.id === "espacios") {
          const espacio = val as { nombre?: string } | null;
          return espacio?.nombre || "Sin espacio";
        }

        if (col.id === "creado_en") {
          const date = new Date(String(val));
          return isNaN(date.getTime())
            ? String(val ?? "")
            : date.toLocaleDateString("es-ES", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              });
        }

        // Manejo de arrays
        if (Array.isArray(val)) {
          return val
            .map((item) =>
              typeof item === "object" && item !== null && "nombre" in item
                ? (item as { nombre?: string }).nombre ?? ""
                : String(item)
            )
            .join(", ");
        }

        // Manejo de objetos
        if (typeof val === "object" && val !== null) {
          return "nombre" in val
            ? (val as { nombre?: string }).nombre ?? ""
            : JSON.stringify(val);
        }

        // Siempre devolver un tipo permitido por CellInput
        return String(val ?? "");
      })
    );

    // Generar tabla
    autoTable(doc, {
      startY: 30,
      head: [headers],
      body: data as RowInput[],
      styles: { fontSize: 8 },
      headStyles: { fillColor: [233, 162, 12] },
      margin: { left: 10, right: 10 },
    });

    doc.save("Lista_de_Bienes.pdf");
  } catch (error) {
    console.error("Error generando PDF:", error);
  }
}
