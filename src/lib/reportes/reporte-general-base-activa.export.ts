import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import type { ReporteGeneralData } from "@/actions/reporte-general-base-activa.actions";
import { fechaCorta, fmt, fmtEntero, imagenComoDataUrl } from "./formatters";

export function exportarReporteGeneralBaseActivaExcel(data: ReporteGeneralData) {
  const aoa: (string | number)[][] = [
    ["REGISTRO DE INVENTARIO PERMANENTE VALORIZADO"],
    ["DETALLE DEL INVENTARIO VALORIZADO - BASE ACTIVA"],
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
    aoa.push(["CÓDIGO DE LA UNIDAD DE MEDIDA (TABLA 6):", data.productoSeleccionado.unidadMedida]);
    aoa.push(["MÉTODO DE VALUACIÓN:", data.productoSeleccionado.metodoValuacion]);
  }

  aoa.push([]);
  aoa.push([
    "FECHA",
    "CÓDIGO",
    "DESCRIPCIÓN",
    "OBSERVACIÓN",
    "RESP. REGISTRO",
    "TIPO OPERACIÓN",
    "ENT. UND",
    "ENT. PESO UNIT.",
    "ENT. PESO TOTAL",
    "SAL. UND",
    "SAL. PESO UNIT.",
    "SAL. PESO TOTAL",
    "SALDO UND",
    "SALDO PESO UNIT.",
    "SALDO PESO TOTAL",
    "FORMULACIÓN",
    "RESP. FORMULACIÓN",
    "CANT. FORMULADO",
    "ALMACENAMIENTO",
  ]);

  for (const item of data.items) {
    aoa.push([
      fechaCorta(item.fecha),
      item.codigoLote,
      item.descripcion,
      item.observacion ?? "",
      item.responsableRegistro ?? "",
      item.tipoOperacion,
      item.entradaUnd || "",
      item.entradaPesoUnitarioKg || "",
      item.entradaPesoTotalKg || "",
      item.salidaUnd || "",
      item.salidaPesoUnitarioKg || "",
      item.salidaPesoTotalKg || "",
      item.saldoUnd,
      item.saldoPesoUnitarioKg,
      item.saldoPesoTotalKg,
      item.formulacion ?? "",
      item.responsableFormulacion ?? "",
      item.cantidadProductoFormulado ?? "",
      item.almacenamientoNombre ?? "",
    ]);
  }

  aoa.push([]);
  aoa.push([
    "TOTALES",
    "",
    "",
    "",
    "",
    "",
    data.totalEntradasUnd,
    "",
    data.totalEntradasPeso,
    data.totalSalidasUnd,
    "",
    data.totalSalidasPeso,
    "",
    "",
    data.stockFinalPeso,
    "",
    "",
    "",
    "",
  ]);
  aoa.push([]);
  aoa.push([`STOCK AL ${fechaCorta(data.fechaHasta)}: ${fmt(data.stockFinalPeso)} KG`]);

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = [
    { wch: 12 }, { wch: 14 }, { wch: 28 }, { wch: 18 }, { wch: 22 },
    { wch: 18 }, { wch: 10 }, { wch: 14 }, { wch: 14 },
    { wch: 10 }, { wch: 14 }, { wch: 14 },
    { wch: 10 }, { wch: 14 }, { wch: 14 },
    { wch: 14 }, { wch: 22 }, { wch: 16 }, { wch: 18 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Reporte General Base Activa");
  XLSX.writeFile(
    wb,
    `reporte_general_base_activa_${fechaCorta(data.fechaHasta).replace(/\//g, "-")}.xlsx`,
  );
}

export async function exportarReporteGeneralBaseActivaPdf(data: ReporteGeneralData) {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 10;

  const logo = data.empresa.logoUrl
    ? await imagenComoDataUrl(data.empresa.logoUrl)
    : null;

  function header() {
    doc.setFillColor(6, 78, 59);
    doc.rect(0, 0, pageW, 18, "F");
    if (logo) {
      try {
        doc.addImage(logo, "PNG", margin, 3, 14, 12);
      } catch {
        /* logo opcional */
      }
    }
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("REGISTRO DE INVENTARIO PERMANENTE VALORIZADO", pageW / 2, 8, {
      align: "center",
    });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("DETALLE DEL INVENTARIO VALORIZADO - BASE ACTIVA", pageW / 2, 13, {
      align: "center",
    });
  }

  header();

  let y = 24;
  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(`PERÍODO: ${data.periodo}`, margin, y);
  doc.text(`RUC: ${data.empresa.ruc}`, margin + 50, y);
  doc.text(`DENOMINACIÓN: ${data.empresa.razonSocial}`, margin + 90, y);
  y += 5;
  doc.text(`ESTABLECIMIENTO: ${data.establecimiento}`, margin, y);
  if (data.productoSeleccionado) {
    doc.text(`CÓD. EXISTENCIA: ${data.productoSeleccionado.codigoExistencia}`, margin + 60, y);
    doc.text(`TIPO: ${data.productoSeleccionado.tipoExistencia}`, margin + 100, y);
    doc.text(`DESCRIPCIÓN: ${data.productoSeleccionado.descripcion}`, margin + 120, y);
  }
  y += 5;
  if (data.productoSeleccionado) {
    doc.text(`UNIDAD: ${data.productoSeleccionado.unidadMedida}`, margin, y);
    doc.text(`MÉTODO: ${data.productoSeleccionado.metodoValuacion}`, margin + 50, y);
  }

  const body = data.items.map((item) => [
    fechaCorta(item.fecha),
    item.codigoLote,
    item.descripcion,
    item.observacion ?? "",
    item.responsableRegistro ?? "",
    item.tipoOperacion,
    item.entradaUnd ? fmtEntero(item.entradaUnd) : "",
    item.entradaPesoUnitarioKg ? fmt(item.entradaPesoUnitarioKg) : "",
    item.entradaPesoTotalKg ? fmt(item.entradaPesoTotalKg) : "",
    item.salidaUnd ? fmtEntero(item.salidaUnd) : "",
    item.salidaPesoUnitarioKg ? fmt(item.salidaPesoUnitarioKg) : "",
    item.salidaPesoTotalKg ? fmt(item.salidaPesoTotalKg) : "",
    fmtEntero(item.saldoUnd),
    fmt(item.saldoPesoUnitarioKg),
    fmt(item.saldoPesoTotalKg),
    item.formulacion ?? "",
    item.responsableFormulacion ?? "",
    item.cantidadProductoFormulado ? fmt(item.cantidadProductoFormulado) : "",
    item.almacenamientoNombre ?? "",
  ]);

  autoTable(doc, {
    startY: y + 4,
    margin: { left: margin, right: margin },
    head: [[
      "FECHA", "CÓDIGO", "DESCRIPCIÓN", "OBSERV.", "RESP. REG.",
      "OPERACIÓN",
      "E.UND", "E.P.UNIT", "E.P.TOT",
      "S.UND", "S.P.UNIT", "S.P.TOT",
      "SD.UND", "SD.P.UNIT", "SD.P.TOT",
      "FORMUL.", "RESP.FORM.", "CANT.FORM.", "ALMAC."
    ]],
    body,
    foot: [[
      "TOTALES", "", "", "", "", "",
      fmtEntero(data.totalEntradasUnd), "", fmt(data.totalEntradasPeso),
      fmtEntero(data.totalSalidasUnd), "", fmt(data.totalSalidasPeso),
      "", "", fmt(data.stockFinalPeso),
      "", "", "", ""
    ]],
    styles: { fontSize: 6, cellPadding: 1.5, textColor: [30, 41, 59] },
    headStyles: { fillColor: [6, 78, 59], textColor: 255, fontStyle: "bold", fontSize: 6 },
    footStyles: { fillColor: [5, 150, 105], textColor: 255, fontStyle: "bold", fontSize: 6 },
    columnStyles: {
      0: { cellWidth: 18 },
      1: { cellWidth: 20 },
      2: { cellWidth: 32 },
      6: { halign: "right" },
      7: { halign: "right" },
      8: { halign: "right" },
      9: { halign: "right" },
      10: { halign: "right" },
      11: { halign: "right" },
      12: { halign: "right" },
      13: { halign: "right" },
      14: { halign: "right" },
    },
    didDrawPage: () => header(),
  });

  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
  const stockY = Math.min(finalY + 8, doc.internal.pageSize.getHeight() - 30);
  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(
    `STOCK AL ${fechaCorta(data.fechaHasta)}: ${fmt(data.stockFinalPeso)} KG`,
    pageW / 2,
    stockY,
    { align: "center" },
  );

  const firmaY = stockY + 10;
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

  doc.save(`reporte_general_base_activa_${fechaCorta(data.fechaHasta).replace(/\//g, "-")}.pdf`);
}
