"use client";

import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { StockBaseActivaReportData } from "./stock-base-activa-report";
import type { StockProductoTerminadoReportData } from "./stock-producto-terminado-report";

const fmt = (n: number) =>
  n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

async function imagenComoDataUrl(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(null);
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export async function exportarExcelOficial(data: StockBaseActivaReportData) {
  const aoa: (string | number)[][] = [
    ["CUADRO RESUMEN DE INVENTARIO", "BASE ACTIVA"],
    ["Razón social", data.empresa.razonSocial],
    ["RUC", data.empresa.ruc],
    ["Establecimiento", data.establecimiento],
    ["Período", data.periodo],
    ["Informe al", data.fechaInforme.toLocaleDateString("es-PE")],
    [],
    ["ESPECIE", "CÓDIGO", "CÓD. EXIST.", "LOTE", "STOCK TOTAL (KG)", "UBICACIÓN", "OBSERVACIÓN"],
  ];
  for (const g of data.items) {
    for (const l of g.lotes) {
      aoa.push([g.descripcion, g.codigo, g.codigoExistencia, l.lote, l.stockKg, l.ubicacion ?? "", l.observacion ?? ""]);
    }
    aoa.push(["", "", "", `TOTAL ${g.descripcion}`, g.totalKg, "", ""]);
  }
  aoa.push(["", "", "", "TOTAL GENERAL", data.items.reduce((a, g) => a + g.totalKg, 0), "", ""]);

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = [{ wch: 30 }, { wch: 10 }, { wch: 10 }, { wch: 14 }, { wch: 16 }, { wch: 20 }, { wch: 24 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Stock Base Activa");
  XLSX.writeFile(wb, `stock_base_activa_${data.fechaInforme.toISOString().slice(0, 10)}.xlsx`);
}

export async function exportarPdfOficial(data: StockBaseActivaReportData) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 12;

  const [logo, firma] = await Promise.all([
    data.empresa.logoUrl ? imagenComoDataUrl(data.empresa.logoUrl) : Promise.resolve(null),
    data.empresa.firmaUrl ? imagenComoDataUrl(data.empresa.firmaUrl) : Promise.resolve(null),
  ]);

  doc.setFillColor(6, 78, 59);
  doc.rect(0, 0, pageW, 14, "F");
  doc.setTextColor(255, 255, 255);
  let y = 7.5;
  if (logo) {
    try { doc.addImage(logo, "PNG", margin, 2.5, 22, 9); } catch { /* logo opcional */ }
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("CUADRO RESUMEN DE INVENTARIO", pageW / 2 + 12, 6, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("BASE ACTIVA", pageW / 2 + 12, 10.5, { align: "center" });

  y = 22;
  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(data.empresa.razonSocial, margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(`RUC: ${data.empresa.ruc}`, margin, y + 5);
  doc.text(`ESTABLECIMIENTO: ${data.establecimiento}`, margin, y + 10);
  doc.text(`PERÍODO: ${data.periodo}`, margin, y + 15);
  doc.text(`INFORME AL: ${data.fechaInforme.toLocaleDateString("es-PE")}`, margin, y + 20);

  autoTable(doc, {
    startY: y + 26,
    margin: { left: margin, right: margin },
    head: [["ESPECIE", "CÓDIGO", "CÓD. EXIST.", "LOTE", "STOCK TOTAL (KG)", "UBICACIÓN"]],
    body: data.items.flatMap((g) => [
      ...g.lotes.map((l) => [g.descripcion, g.codigo, g.codigoExistencia, l.lote, fmt(l.stockKg), l.ubicacion ?? "—"]),
      ["", "", "", `TOTAL ${g.descripcion}`, fmt(g.totalKg), ""],
    ]),
    foot: [["", "", "", "TOTAL GENERAL", fmt(data.items.reduce((a, g) => a + g.totalKg, 0)), ""]],
    styles: { fontSize: 8, cellPadding: 2, textColor: [30, 41, 59] },
    headStyles: { fillColor: [6, 78, 59], textColor: 255, fontStyle: "bold" },
    footStyles: { fillColor: [226, 232, 240], textColor: [15, 23, 42], fontStyle: "bold" },
    columnStyles: { 4: { halign: "right" } },
    didDrawPage: () => {},
  });

  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  if (firma) {
    try { doc.addImage(firma, "PNG", pageW / 2 - 25, finalY, 50, 18); } catch { /* firma opcional */ }
  }
  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(data.empresa.responsableReporte ?? "RESPONSABLE", pageW / 2, finalY + (firma ? 22 : 6), { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  if (data.empresa.cargoReporte) doc.text(data.empresa.cargoReporte.toUpperCase(), pageW / 2, finalY + (firma ? 27 : 10), { align: "center" });
  doc.text(data.empresa.razonSocial, pageW / 2, finalY + (firma ? 32 : 14), { align: "center" });

  doc.save(`stock_base_activa_${data.fechaInforme.toISOString().slice(0, 10)}.pdf`);
}

export function imprimirOficial() {
  if (typeof document === "undefined") return;
  const target = document.querySelector('[data-report-print="true"]');
  if (target && target.querySelector(".report-a4")) {
    const root = target.closest("main") ?? target.closest("div");
    root?.classList.add("printing-report");
  }
  window.print();
}

export function exportarExcelStockPTOficial(data: StockProductoTerminadoReportData) {
  const aoa: (string | number)[][] = [
    ["CUADRO RESUMEN DE INVENTARIO", "PRODUCTO TERMINADO"],
    ["Razón social", data.empresa.razonSocial],
    ["RUC", data.empresa.ruc],
    ["Establecimiento", data.establecimiento],
    ["Período", data.periodo],
    ["Informe al", data.fechaInforme.toLocaleDateString("es-PE")],
    [],
    ["DESCRIPCIÓN", "CÓDIGO", "PRESENTACIÓN", "STOCK TOTAL", "OBSERVACIONES"],
  ];
  for (const item of data.items) {
    aoa.push([item.descripcion, item.codigo, item.presentacion, item.stock, item.unidad]);
  }
  aoa.push(["", "", "STOCK TOTAL", data.items.reduce((a, i) => a + i.stock, 0), ""]);

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = [{ wch: 30 }, { wch: 12 }, { wch: 24 }, { wch: 14 }, { wch: 18 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Stock Producto Terminado");
  XLSX.writeFile(wb, `stock_producto_terminado_${data.fechaInforme.toISOString().slice(0, 10)}.xlsx`);
}

export async function exportarPdfStockPTOficial(data: StockProductoTerminadoReportData) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 12;

  const [logo, firma] = await Promise.all([
    data.empresa.logoUrl ? imagenComoDataUrl(data.empresa.logoUrl) : Promise.resolve(null),
    data.empresa.firmaUrl ? imagenComoDataUrl(data.empresa.firmaUrl) : Promise.resolve(null),
  ]);

  doc.setFillColor(6, 78, 59);
  doc.rect(0, 0, pageW, 14, "F");
  doc.setTextColor(255, 255, 255);
  if (logo) {
    try { doc.addImage(logo, "PNG", margin, 2.5, 22, 9); } catch { /* logo opcional */ }
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("CUADRO RESUMEN DE INVENTARIO", pageW / 2 + 12, 6, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("PRODUCTO TERMINADO", pageW / 2 + 12, 10.5, { align: "center" });

  const y = 22;
  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(data.empresa.razonSocial, margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(`RUC: ${data.empresa.ruc}`, margin, y + 5);
  doc.text(`ESTABLECIMIENTO: ${data.establecimiento}`, margin, y + 10);
  doc.text(`PERÍODO: ${data.periodo}`, margin, y + 15);
  doc.text(`INFORME AL: ${data.fechaInforme.toLocaleDateString("es-PE")}`, margin, y + 20);

  autoTable(doc, {
    startY: y + 26,
    margin: { left: margin, right: margin },
    head: [["DESCRIPCIÓN", "CÓDIGO", "PRESENTACIÓN", "STOCK TOTAL", "OBSERVACIONES"]],
    body: data.items.map((i) => [i.descripcion, i.codigo, i.presentacion, fmt(i.stock), i.unidad]),
    foot: [["", "", "STOCK TOTAL", fmt(data.items.reduce((a, i) => a + i.stock, 0)), ""]],
    styles: { fontSize: 8, cellPadding: 2, textColor: [30, 41, 59] },
    headStyles: { fillColor: [6, 78, 59], textColor: 255, fontStyle: "bold" },
    footStyles: { fillColor: [226, 232, 240], textColor: [15, 23, 42], fontStyle: "bold" },
    columnStyles: { 3: { halign: "right" } },
  });

  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  doc.text("Producto listo para etiquetar y despachar.", margin, finalY - 4);
  if (firma) {
    try { doc.addImage(firma, "PNG", pageW / 2 - 25, finalY, 50, 18); } catch { /* firma opcional */ }
  }
  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(data.empresa.responsableReporte ?? "RESPONSABLE", pageW / 2, finalY + (firma ? 22 : 6), { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  if (data.empresa.cargoReporte) doc.text(data.empresa.cargoReporte.toUpperCase(), pageW / 2, finalY + (firma ? 27 : 10), { align: "center" });
  doc.text(data.empresa.razonSocial, pageW / 2, finalY + (firma ? 32 : 14), { align: "center" });

  doc.save(`stock_producto_terminado_${data.fechaInforme.toISOString().slice(0, 10)}.pdf`);
}