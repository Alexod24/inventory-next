"use client";
import { jsPDF } from "jspdf";
import autoTable, { CellInput, RowInput } from "jspdf-autotable";
import { Table } from "@tanstack/react-table";

export async function exportarVentasToPDF<TData>(
  table: Table<TData>,
  sedeName: string
) {
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
    doc.text(`REPORTE DE VENTAS - ${sedeName.toUpperCase()}`, 50, 20);
    doc.setFontSize(10);
    doc.setTextColor("#000000");
    doc.text(`Fecha de generación: ${new Date().toLocaleString()}`, 50, 26);

    // Columnas visibles (excluyendo acciones si las hubiera)
    const visibleColumns = table
      .getAllColumns()
      .filter(
        (col) =>
          col.getIsVisible() && col.id !== "actions" && col.id !== "select"
      );

    if (visibleColumns.length === 0) {
      throw new Error("No hay columnas visibles.");
    }

    const headers: CellInput[] = visibleColumns.map((col) => {
      // Headers personalizados si es necesario
      switch (col.id) {
        case "fecha":
          return "FECHA";
        case "bienes":
          return "PRODUCTO";
        case "cantidad":
          return "CANT";
        case "precio":
          return "PRECIO UNIT";
        case "total":
          return "TOTAL";
        default:
          return String(col.id).toUpperCase();
      }
    });

    // Filas visibles
    const rows = table.getRowModel().rows;
    if (rows.length === 0) {
      throw new Error("No hay filas visibles.");
    }

    // Transformar datos
    const data: CellInput[][] = rows.map((row) =>
      visibleColumns.map((col) => {
        const val = row.getValue(col.id);

        // Formateo específico por columna
        if (col.id === "fecha") {
          const date = new Date(String(val));
          return isNaN(date.getTime())
            ? String(val ?? "")
            : date.toLocaleString("es-PE"); // Fecha y hora
        }

        if (col.id === "bienes") {
          // Es un objeto { nombre: string }
          return (val as any)?.nombre || "N/A";
        }

        if (col.id === "precio" || col.id === "total") {
          return `S/ ${parseFloat(String(val)).toFixed(2)}`;
        }

        return String(val ?? "");
      })
    );

    // Generar tabla
    autoTable(doc, {
      startY: 35,
      head: [headers],
      body: data as RowInput[],
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] }, // Un azul corporativo diferente para distinguir de productos
      margin: { left: 10, right: 10 },
      foot: [
        [
          "",
          "",
          "TOTAL VENTAS:",
          "", // Empty for Price col
          `S/ ${rows
            .reduce((sum, row) => sum + Number(row.getValue("total") || 0), 0)
            .toFixed(2)}`,
        ],
      ],
    });

    doc.save(
      `Ventas_${sedeName}_${new Date().toISOString().split("T")[0]}.pdf`
    );
  } catch (error) {
    console.error("Error generando PDF:", error);
  }
}
