"use client"; // Solo para Next.js
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

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

    // Título del PDF
    doc.setFontSize(18);
    doc.setTextColor("#e9a20c");
    doc.text("lISTA DE BIENES", 50, 20);

    // Obtener columnas visibles, excluyendo las no deseadas
    const visibleColumns = table
      .getAllColumns()
      .filter(
        (col) =>
          col.getIsVisible() &&
          col.id !== "fecha_adquisicion" &&
          col.id !== "actualizado_en"
      );
    if (visibleColumns.length === 0)
      throw new Error("No hay columnas visibles.");

    const headers = visibleColumns.map((col) => col.id.toUpperCase());

    // Obtener filas visibles
    const rows = table.getRowModel().rows;
    if (rows.length === 0) throw new Error("No hay filas visibles.");

    // Transformar datos para el PDF
    const data = rows.map((row) =>
      visibleColumns.map((col) => {
        const val = row.getValue(col.id);

        // Transformaciones específicas por columna
        if (col.id === "disponibilidad") {
          return val ? "OK" : "Faltante"; // Cambiar true/false
        }
        if (col.id === "espacios") {
          return val?.nombre || "Sin espacio"; // Extraer nombre o texto predeterminado
        }
        if (col.id === "creado_en") {
          const date = new Date(val);
          return isNaN(date.getTime())
            ? val
            : date.toLocaleDateString("es-ES", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              });
        }

        // Manejo general para arrays y objetos
        if (Array.isArray(val)) {
          return val
            .map((item) => (item.nombre ? item.nombre : item))
            .join(", ");
        } else if (typeof val === "object" && val !== null) {
          return val.nombre || JSON.stringify(val);
        }

        return val; // Devolver el valor original si no requiere transformación
      })
    );

    // Generar tabla en el PDF
    autoTable(doc, {
      startY: 30,
      head: [headers],
      body: data,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [233, 162, 12] },
      margin: { left: 10, right: 10 },
    });

    // Guardar el PDF
    doc.save("Lista_de_Bienes.pdf");
  } catch (error) {
    console.error("Error generando PDF:", error);
  }
}
