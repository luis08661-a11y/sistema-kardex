export type ProductoExportRow = {
  codigo: string;
  codigoExistencia: string;
  nombre: string;
  tabla5: string;
  tipoInventario: string;
  presentacion: string;
  unidadMedida: string;
  observaciones: string;
};

export async function exportProductosExcel(rows: ProductoExportRow[]) {
  const ExcelJS = await import("exceljs");
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Productos");

  ws.columns = [
    { header: "Código", key: "codigo", width: 12 },
    { header: "Código de existencia", key: "codigoExistencia", width: 20 },
    { header: "Nombre", key: "nombre", width: 45 },
    { header: "Tabla 5", key: "tabla5", width: 25 },
    { header: "Tipo de inventario", key: "tipoInventario", width: 20 },
    { header: "Presentación", key: "presentacion", width: 25 },
    { header: "Unidad de medida", key: "unidadMedida", width: 20 },
    { header: "Observaciones", key: "observaciones", width: 40 },
  ];

  const headerRow = ws.getRow(1);
  headerRow.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF059669" } };
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = {
      top: { style: "thin", color: { argb: "FF047857" } },
      bottom: { style: "thin", color: { argb: "FF047857" } },
      left: { style: "thin", color: { argb: "FF047857" } },
      right: { style: "thin", color: { argb: "FF047857" } },
    };
  });
  headerRow.height = 22;

  rows.forEach((r) => {
    ws.addRow(r);
  });

  for (let i = 2; i <= rows.length + 1; i++) {
    const row = ws.getRow(i);
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFD1D5DB" } },
        bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
        left: { style: "thin", color: { argb: "FFD1D5DB" } },
        right: { style: "thin", color: { argb: "FFD1D5DB" } },
      };
      cell.alignment = { vertical: "middle" };
    });
  }

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "catalogo-productos.xlsx";
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportProductosPDF(rows: ProductoExportRow[]) {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  doc.setFontSize(14);
  doc.text("Catálogo Registrado — Productos", 14, 14);
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Generado el ${new Date().toLocaleString("es-PE")}`, 14, 20);
  doc.setTextColor(0);

  autoTable(doc, {
    startY: 26,
    head: [["Código", "Existencia", "Nombre", "Tabla 5", "Tipo", "Presentación", "U. medida"]],
    body: rows.map((r) => [
      r.codigo,
      r.codigoExistencia,
      r.nombre,
      r.tabla5,
      r.tipoInventario,
      r.presentacion,
      r.unidadMedida,
    ]),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [5, 150, 105], textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [241, 245, 249] },
    margin: { left: 14, right: 14 },
  });

  doc.save("catalogo-productos.pdf");
}
