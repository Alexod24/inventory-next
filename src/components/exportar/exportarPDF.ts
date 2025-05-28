import { Table } from "@tanstack/react-table";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export async function exportarToPDF<TData>(table: Table<TData>) {
  const doc = new jsPDF({ orientation: "landscape" });

  // Ruta de la imagen local (debe estar en la carpeta `public`)
  const logoPath = "/images/logo/labase.png";

  // Cargar imagen local
  const loadImage = (src: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src; // Path relativo a `public`
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

    // Configurar encabezado
    doc.setFontSize(18);
    doc.setTextColor("#e9a20c");
    doc.text("BASE DE MANDO", 50, 20);

    // Obtener columnas visibles y filas
    const visibleColumns = table
      .getAllColumns()
      .filter((col) => col.getIsVisible());
    if (visibleColumns.length === 0)
      throw new Error("No hay columnas visibles.");

    const headers = visibleColumns.map((col) => col.id.toUpperCase());
    const rows = table.getRowModel().rows;
    if (rows.length === 0) throw new Error("No hay filas visibles.");

    const data = rows.map((row) =>
      visibleColumns.map((col) => {
        const val = row.getValue(col.id);
        return typeof val === "string" ? val : JSON.stringify(val);
      })
    );

    // Generar tabla con autoTable
    autoTable(doc, {
      startY: 30,
      head: [headers],
      body: data,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [233, 162, 12] }, // Color #e9a20c
      margin: { left: 10, right: 10 },
    });

    // Descargar PDF
    doc.save("base_de_mando.pdf");
  } catch (error) {
    console.error("Error generando PDF:", error);
    alert(`Hubo un error exportando el PDF: ${error.message}`);
  }
}
