import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import type {
  ReporteVentasContexto,
  ReporteVentasData,
} from "@/actions/reporte-ventas.actions";
import { fechaCorta, fmt, imagenComoDataUrl } from "./formatters";
import { formaLabel, metodoLabel, tipoLabel } from "./ventas-labels";

export function exportarReporteVentasExcel(
  data: ReporteVentasData,
  contexto: ReporteVentasContexto,
  fechaHasta: string
) {
  const aoa: (string | number)[][] = [
    ["REPORTE DE VENTAS"],
    ["PERÍODO:", data.periodo],
    ["RUC:", contexto.empresa.ruc],
    ["DENOMINACIÓN O RAZÓN SOCIAL:", contexto.empresa.razonSocial],
    ["ESTABLECIMIENTO:", contexto.establecimiento ?? "—"],
    [],
    [
      "FECHA", "TIPO", "COMPROBANTE", "CLIENTE", "DOCUMENTO",
      "FORMA PAGO", "MÉTODO PAGO", "OP. GRAVADA", "OP. EXONERADA",
      "OP. INAFECTA", "IGV", "TOTAL", "ESTADO",
    ],
  ];
  for (const r of data.items) {
    aoa.push([
      fechaCorta(r.fecha), tipoLabel(r.tipoComprobante), r.comprobante,
      r.cliente, r.documento, formaLabel(r.formaPago), metodoLabel(r.metodoPago),
      r.opGravada, r.opExonerada, r.opInafecta, r.igv, r.total, r.estado,
    ]);
  }
  aoa.push([
    "TOTALES", "", "", `${data.resumen.cantidad} ventas`, "", "", "",
    data.resumen.opGravada, data.resumen.opExonerada, data.resumen.opInafecta,
    data.resumen.igv, data.resumen.total, "",
  ]);

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = [
    { wch: 12 }, { wch: 18 }, { wch: 14 }, { wch: 30 }, { wch: 18 },
    { wch: 12 }, { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 14 },
    { wch: 12 }, { wch: 14 }, { wch: 10 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Reporte de Ventas");
  XLSX.writeFile(wb, `reporte_ventas_${fechaHasta.replace(/\//g, "-")}.xlsx`);
}

export function nombreReporteVentasPdf(fechaHasta: string) {
  return `reporte_ventas_${fechaCorta(fechaHasta).replace(/\//g, "-")}.pdf`;
}

export async function generarReporteVentasPdf(
  data: ReporteVentasData,
  contexto: ReporteVentasContexto
) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 10;

  const [logo, firma] = await Promise.all([
    contexto.empresa.logoUrl ? imagenComoDataUrl(contexto.empresa.logoUrl) : Promise.resolve(null),
    contexto.empresa.firmaUrl ? imagenComoDataUrl(contexto.empresa.firmaUrl) : Promise.resolve(null),
  ]);

  doc.setFillColor(6, 78, 59);
  doc.rect(0, 0, pageW, 16, "F");
  if (logo) {
    try { doc.addImage(logo, "PNG", margin, 3, 14, 10); } catch { /* logo opcional */ }
  }
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("REPORTE DE VENTAS", pageW / 2, 7, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("PUNTO DE VENTA (POS)", pageW / 2, 12, { align: "center" });

  let y = 22;
  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(`PERÍODO: ${data.periodo}`, margin, y);
  doc.text(`RUC: ${contexto.empresa.ruc}`, margin + 55, y);
  doc.text(`DENOMINACIÓN: ${contexto.empresa.razonSocial}`, margin + 95, y);
  y += 5;
  doc.text(`ESTABLECIMIENTO: ${contexto.establecimiento ?? "—"}`, margin, y);
  doc.setFont("helvetica", "normal");

  autoTable(doc, {
    startY: y + 6,
    margin: { left: margin, right: margin },
    head: [[
      "FECHA", "TIPO", "COMPROBANTE", "CLIENTE", "DOCUMENTO",
      "FORMA", "MÉTODO", "OP. GRAV.", "IGV", "TOTAL", "ESTADO",
    ]],
    body: data.items.map((r) => [
      fechaCorta(r.fecha), tipoLabel(r.tipoComprobante), r.comprobante,
      r.cliente, r.documento, formaLabel(r.formaPago), metodoLabel(r.metodoPago),
      fmt(r.opGravada), fmt(r.igv), fmt(r.total), r.estado,
    ]),
    foot: [[
      "TOTALES", "", "", `${data.resumen.cantidad} ventas`, "",
      "", "", fmt(data.resumen.opGravada), fmt(data.resumen.igv), fmt(data.resumen.total), "",
    ]],
    styles: { fontSize: 7, cellPadding: 1.8, textColor: [30, 41, 59] },
    headStyles: { fillColor: [6, 78, 59], textColor: 255, fontStyle: "bold", fontSize: 7 },
    footStyles: { fillColor: [5, 150, 105], textColor: 255, fontStyle: "bold", fontSize: 7 },
    columnStyles: {
      0: { cellWidth: 22 }, 1: { cellWidth: 32 }, 2: { cellWidth: 26 },
      3: { cellWidth: 40 }, 4: { cellWidth: 26 },
      7: { halign: "right" }, 8: { halign: "right" }, 9: { halign: "right" },
    },
  });

  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
  const firmaY = Math.min(finalY + 12, doc.internal.pageSize.getHeight() - 35);
  if (firma) {
    try { doc.addImage(firma, "PNG", pageW / 2 - 25, firmaY - 4, 50, 16); } catch { /* firma opcional */ }
  }
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("Elaborado por:", margin + 30, firmaY);
  doc.setFont("helvetica", "normal");
  doc.text(contexto.empresa.responsableReporte ?? "Responsable", margin + 30, firmaY + 4);
  if (contexto.empresa.cargoReporte) {
    doc.text(contexto.empresa.cargoReporte, margin + 30, firmaY + 7);
  }
  doc.setFont("helvetica", "bold");
  doc.text("Aprobado por:", pageW - margin - 40, firmaY);
  doc.setFont("helvetica", "normal");
  doc.text("Ing. Responsable", pageW - margin - 40, firmaY + 4);

  return doc;
}
