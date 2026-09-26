import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import type { ReporteGeneralProductoTerminadoData } from "@/actions/reporte-general-producto-terminado.actions";
import { fechaCorta, fmt, fmtCan, imagenComoDataUrl } from "./formatters";

export function exportarReporteGeneralProductoTerminadoExcel(
  data: ReporteGeneralProductoTerminadoData,
) {
  const aoa: (string | number)[][] = [
    ["REGISTRO DE INVENTARIO PERMANENTE VALORIZADO"],
    ["DETALLE DEL INVENTARIO VALORIZADO - PRODUCTO TERMINADO"],
    [],
    ["PERÍODO:", data.periodo],
    ["RUC:", data.empresa.ruc],
    ["DENOMINACIÓN O RAZÓN SOCIAL:", data.empresa.razonSocial],
    ["ESTABLECIMIENTO:", data.establecimiento],
  ];
  if (data.productoSeleccionado) {
    aoa.push(["CÓDIGO DE LA EXISTENCIA:", data.productoSeleccionado.codigoExistencia]);
    aoa.push(["TIPO (TABLA 5):", data.productoSeleccionado.tipoExistencia]);
    aoa.push(["DESCRIPCIÓN:", data.productoSeleccionado.descripcion]);
    aoa.push(["PRESENTACIÓN:", data.productoSeleccionado.presentacion]);
    aoa.push(["CÓDIGO DE LA UNIDAD DE MEDIDA (TABLA 6):", data.productoSeleccionado.unidadMedida]);
    aoa.push(["MÉTODO DE VALUACIÓN:", data.productoSeleccionado.metodoValuacion]);
  }
  aoa.push([]);
  aoa.push([
    "FECHA", "SERIE", "NÚM", "TIPO OPERACIÓN",
    "E. CAN", "E. C. UNT", "E. COSTO TOTAL",
    "S. CAN", "S. C. UNT", "S. C. TOTAL",
    "SALDO CAN", "SALDO C. UNT", "SALDO C. TOTAL",
    "MOTIVO", "FACTURA/BOL/RECIBO", "GUÍA", "EMPRESA",
    "ING. CAMPO", "OBSERVACIÓN", "RESP. DESPACHO",
  ]);
  for (const item of data.items) {
    aoa.push([
      fechaCorta(item.fecha),
      item.serie,
      item.numero,
      item.tipoOperacion,
      item.entradaCan || "",
      item.entradaCostoUnitario || "",
      item.entradaCostoTotal || "",
      item.salidaCan || "",
      item.salidaCostoUnitario || "",
      item.salidaCostoTotal || "",
      item.saldoCan,
      item.saldoCostoUnitario,
      item.saldoCostoTotal,
      item.motivo,
      item.facturaGuia,
      item.documentoTraslado,
      item.empresaDestino,
      item.ingCampo,
      item.observacion,
      item.responsableDespacho,
    ]);
  }
  aoa.push([]);
  aoa.push([
    "TOTALES", "", "", "",
    data.totalEntradasCan, "", data.totalEntradasCostoTotal,
    data.totalSalidasCan, "", data.totalSalidasCostoTotal,
    data.stockFinalCan, "", data.stockFinalCostoTotal,
    "", "", "", "", "", "",
  ]);
  aoa.push([]);
  aoa.push([`STOCK AL ${fechaCorta(data.fechaHasta)}: ${fmtCan(data.stockFinalCan)}`]);

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = [
    { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 16 },
    { wch: 10 }, { wch: 12 }, { wch: 14 },
    { wch: 10 }, { wch: 12 }, { wch: 14 },
    { wch: 10 }, { wch: 12 }, { wch: 14 },
    { wch: 12 }, { wch: 16 }, { wch: 14 }, { wch: 22 }, { wch: 14 }, { wch: 22 }, { wch: 18 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Reporte General PT");
  XLSX.writeFile(
    wb,
    `reporte_general_product_terminado_${fechaCorta(data.fechaHasta).replace(/\//g, "-")}.xlsx`,
  );
}

export async function exportarReporteGeneralProductoTerminadoPdf(
  data: ReporteGeneralProductoTerminadoData,
) {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 8;

  const logo = data.empresa.logoUrl
    ? await imagenComoDataUrl(data.empresa.logoUrl)
    : null;

  function header() {
    doc.setFillColor(6, 78, 59);
    doc.rect(0, 0, pageW, 16, "F");
    if (logo) {
      try {
        doc.addImage(logo, "PNG", margin, 2.5, 12, 11);
      } catch {
        /* logo opcional */
      }
    }
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("REGISTRO DE INVENTARIO PERMANENTE VALORIZADO", pageW / 2, 8, {
      align: "center",
    });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(
      "- DETALLE DEL INVENTARIO VALORIZADO - PRODUCTO TERMINADO",
      pageW / 2,
      13,
      { align: "center" },
    );
  }

  header();

  let y = 22;
  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text(`PERÍODO: ${data.periodo}`, margin, y);
  doc.text(`RUC: ${data.empresa.ruc}`, margin + 40, y);
  doc.text(`DENOMINACIÓN: ${data.empresa.razonSocial}`, margin + 85, y);
  y += 4;
  doc.text(`ESTABLECIMIENTO: ${data.establecimiento}`, margin, y);
  if (data.productoSeleccionado) {
    doc.text(`CÓD. EXISTENCIA: ${data.productoSeleccionado.codigoExistencia}`, margin + 45, y);
    doc.text(`TIPO: ${data.productoSeleccionado.tipoExistencia}`, margin + 95, y);
    doc.text(`DESCRIPCIÓN: ${data.productoSeleccionado.descripcion}`, margin + 120, y);
  }
  y += 4;
  if (data.productoSeleccionado) {
    doc.text(`PRESENTACIÓN: ${data.productoSeleccionado.presentacion}`, margin, y);
    doc.text(`UNIDAD: ${data.productoSeleccionado.unidadMedida}`, margin + 50, y);
    doc.text(`MÉTODO: ${data.productoSeleccionado.metodoValuacion}`, margin + 90, y);
  }

  const body = data.items.map((item) => [
    fechaCorta(item.fecha),
    item.serie,
    item.numero,
    item.tipoOperacion,
    item.entradaCan ? fmtCan(item.entradaCan) : "",
    item.entradaCostoUnitario ? fmt(item.entradaCostoUnitario) : "",
    item.entradaCostoTotal ? fmt(item.entradaCostoTotal) : "",
    item.salidaCan ? fmtCan(item.salidaCan) : "",
    item.salidaCostoUnitario ? fmt(item.salidaCostoUnitario) : "",
    item.salidaCostoTotal ? fmt(item.salidaCostoTotal) : "",
    fmtCan(item.saldoCan),
    fmt(item.saldoCostoUnitario),
    fmt(item.saldoCostoTotal),
    item.motivo,
    item.facturaGuia,
    item.documentoTraslado,
    item.empresaDestino,
    item.ingCampo,
    item.observacion,
    item.responsableDespacho,
  ]);

  autoTable(doc, {
    startY: y + 4,
    margin: { left: margin, right: margin },
    head: [[
      "FECHA", "SERIE", "NÚM", "OPERACIÓN",
      "E.CAN", "E.C.UNT", "E.COSTO", "S.CAN", "S.C.UNT", "S.COSTO",
      "SD.CAN", "SD.C.UNT", "SD.COSTO",
      "MOTIVO", "FACT/BOL/REC", "GUÍA", "EMPRESA", "ING.CAMPO", "OBSERV.", "RESP.DESP."
    ]],
    body,
    foot: [[
      "TOTALES", "", "", "",
      fmtCan(data.totalEntradasCan), "", fmt(data.totalEntradasCostoTotal),
      fmtCan(data.totalSalidasCan), "", fmt(data.totalSalidasCostoTotal),
      fmtCan(data.stockFinalCan), "", fmt(data.stockFinalCostoTotal),
      "", "", "", "", "", ""
    ]],
    styles: { fontSize: 6, cellPadding: 1.2, textColor: [30, 41, 59] },
    headStyles: { fillColor: [6, 78, 59], textColor: 255, fontStyle: "bold" },
    footStyles: { fillColor: [5, 150, 105], textColor: 255, fontStyle: "bold" },
    didDrawPage: () => header(),
  });

  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
  const stockY = Math.min(finalY + 8, doc.internal.pageSize.getHeight() - 32);
  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(
    `STOCK AL ${fechaCorta(data.fechaHasta)}: ${fmtCan(data.stockFinalCan)}`,
    pageW / 2,
    stockY,
    { align: "center" },
  );

  const firmaY = stockY + 9;
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("Elaborado por:", margin + 30, firmaY);
  doc.setFont("helvetica", "normal");
  doc.text(data.empresa.responsableReporte ?? "Responsable", margin + 30, firmaY + 4);
  if (data.empresa.cargoReporte) {
    doc.text(data.empresa.cargoReporte, margin + 30, firmaY + 7);
  }
  doc.setFont("helvetica", "bold");
  doc.text("Aprobado por:", pageW - margin - 40, firmaY);
  doc.setFont("helvetica", "normal");
  doc.text("Ing. Responsable", pageW - margin - 40, firmaY + 4);

  doc.save(
    `reporte_general_producto_terminado_${fechaCorta(data.fechaHasta).replace(/\//g, "-")}.pdf`,
  );
}
