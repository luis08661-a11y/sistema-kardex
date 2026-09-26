"use client"

import { useMemo } from "react"

import * as XLSX from "xlsx"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

import type { MovimientoPT } from "./producto-terminado-types"

const nombreArchivoKardexPT = () =>
  `kardex_producto_terminado_${new Date().toISOString().slice(0, 10)}`

const filaMovimientoPT = (m: MovimientoPT) => {
  const esEntrada = m.tipoMovimiento === "ENTRADA"
  return [
    new Date(m.fecha).toISOString().slice(0, 10),
    m.serie ?? "",
    m.numero ?? "",
    m.observacion ?? "",
    m.responsableDespacho ?? "",
    m.tipoOperacion?.nombre ?? m.tipoOperacion?.codigo ?? "",
    esEntrada ? Number(m.entradaCan) : "",
    esEntrada ? Number(m.entradaCostoUnitario) : "",
    esEntrada ? Number(m.entradaCostoTotal) : "",
    esEntrada ? "" : Number(m.salidaCan),
    esEntrada ? "" : Number(m.salidaCostoUnitario),
    esEntrada ? "" : Number(m.salidaCostoTotal),
    m.saldo ?? "",
    m.costoUnitarioSaldo ?? "",
    m.costoTotalSaldo ?? "",
    m.motivo === "PRODUCCION" ? "X" : "",
    m.motivo === "VENTA" ? "X" : "",
    m.motivo === "ENSAYO" ? "X" : "",
    m.facturaGuia ?? "",
    m.empresaDestino ?? "",
    m.ingCampo ?? "",
  ]
}

const HEADERS_KARDEX_PT = [
  "FECHA",
  "SERIE",
  "NÚMERO",
  "OBSERVACIÓN",
  "RESPONSABLE",
  "TIPO DE OPERACIÓN",
  "ENTRADA CAN",
  "ENTRADA C.UNT",
  "ENTRADA COSTO TOTAL",
  "SALIDA CAN",
  "SALIDA C.UNT",
  "SALIDA C.TOTAL",
  "SALDO CAN",
  "SALDO C.UNT",
  "SALDO C.TOTAL",
  "PRODUCCIÓN",
  "VENTA",
  "ENSAYO",
  "FACTURA/GUÍA",
  "EMPRESA",
  "ING. DE CAMPO",
]

export function exportarKardexPTExcel(movimientos: MovimientoPT[]) {
  const aoa = [HEADERS_KARDEX_PT, ...movimientos.map(filaMovimientoPT)]
  const ws = XLSX.utils.aoa_to_sheet(aoa)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Kardex PT")
  XLSX.writeFile(wb, `${nombreArchivoKardexPT()}.xlsx`)
}

const HEADERS_PDF_KARDEX_PT = [
  "FECHA",
  "DOC. TRASLADO",
  "NÚM",
  "OBSERVACIÓN",
  "RESPONSABLE",
  "TIPO OPERACIÓN",
  "ENT CAN",
  "ENT C.UNT",
  "ENT COSTO",
  "SAL CAN",
  "SAL C.UNT",
  "SAL COSTO",
  "SALDO CAN",
  "SALDO C.UNT",
  "SALDO COSTO",
  "PROD",
  "VENTA",
  "ENSAYO",
  "FACTURA/GUÍA",
  "EMPRESA",
  "ING. CAMPO",
]

const cuerpoPDFKardexPT = (m: MovimientoPT) => {
  const esEntrada = m.tipoMovimiento === "ENTRADA"
  return [
    new Date(m.fecha).toLocaleDateString("es-PE", { timeZone: "UTC" }),
    [m.serie, m.numero].filter(Boolean).join("-") || "—",
    m.numero ?? "—",
    m.observacion ?? "—",
    m.responsableDespacho ?? "—",
    m.tipoOperacion?.nombre ?? m.tipoOperacion?.codigo ?? "—",
    esEntrada ? Number(m.entradaCan).toFixed(2) : "",
    esEntrada ? Number(m.entradaCostoUnitario).toFixed(2) : "",
    esEntrada ? Number(m.entradaCostoTotal).toFixed(2) : "",
    esEntrada ? "" : Number(m.salidaCan).toFixed(2),
    esEntrada ? "" : Number(m.salidaCostoUnitario).toFixed(2),
    esEntrada ? "" : Number(m.salidaCostoTotal).toFixed(2),
    m.saldo ?? "—",
    m.costoUnitarioSaldo ?? "—",
    m.costoTotalSaldo ?? "—",
    m.motivo === "PRODUCCION" ? "X" : "",
    m.motivo === "VENTA" ? "X" : "",
    m.motivo === "ENSAYO" ? "X" : "",
    m.facturaGuia ?? "—",
    m.empresaDestino ?? "—",
    m.ingCampo ?? "—",
  ]
}

const encabezadoPaginaKardexPT = (doc: jsPDF) => {
  const pageW = doc.internal.pageSize.getWidth()
  doc.setFillColor(6, 78, 59)
  doc.rect(0, 0, pageW, 18, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.text("KARDEX DE PRODUCTO TERMINADO", pageW / 2, 8, { align: "center" })
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.text("MÉTODO DE VALUACIÓN: PEPS", pageW / 2, 13, { align: "center" })
}

export function exportarKardexPTPdf(movimientos: MovimientoPT[]) {
  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "landscape",
  })

  encabezadoPaginaKardexPT(doc)

  autoTable(doc, {
    startY: 22,
    margin: { left: 10, right: 10 },
    head: [HEADERS_PDF_KARDEX_PT],
    body: movimientos.map(cuerpoPDFKardexPT),
    styles: { fontSize: 6, cellPadding: 1.5, textColor: [30, 41, 59] },
    headStyles: { fillColor: [6, 78, 59], textColor: 255, fontStyle: "bold" },
    didDrawPage: () => encabezadoPaginaKardexPT(doc),
  })

  doc.save(`${nombreArchivoKardexPT()}.pdf`)
}

export function imprimirKardexPT() {
  if (typeof document === "undefined") return
  window.print()
}

export function useExportesKardexPT(movimientos: MovimientoPT[]) {
  return useMemo(
    () => ({
      exportarExcel: () => exportarKardexPTExcel(movimientos),
      exportarPDF: () => exportarKardexPTPdf(movimientos),
      imprimir: imprimirKardexPT,
    }),
    [movimientos],
  )
}
