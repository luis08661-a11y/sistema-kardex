"use client"

import { PackageSearch } from "lucide-react"

import { fmtNumeroPT } from "./producto-terminado-types"
import type {
  MovimientoPT,
  TotalesMovimientoPT,
} from "./producto-terminado-types"
import { MovimientoPTFila } from "./movimiento-pt-fila"

type Props = {
  movimientos: MovimientoPT[]
  totales: TotalesMovimientoPT
  onEditar: (movimiento: MovimientoPT) => void
  onEliminar: (movimiento: MovimientoPT) => void
  onExportarExcel: () => void
  onExportarPDF: () => void
  onImprimir: () => void
}

const thPrincipal = (label: string, rowSpan = 1) => (
  <th
    rowSpan={rowSpan}
    className="border border-emerald-700 bg-emerald-700 py-1.5 text-center text-[12px] font-bold uppercase text-white">
    {label}
  </th>
)

const thMotivo = (label: string, rowSpan = 1) => (
  <th
    rowSpan={rowSpan}
    className="border border-emerald-200 dark:border-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 py-1.5 text-center text-[12px] font-bold uppercase text-emerald-900 dark:text-emerald-300">
    {label}
  </th>
)

const thSub = (label: string) => (
  <th className="border px-1.5 py-1 text-center bg-muted/50">{label}</th>
)

export function ProductoTerminadoTabla({
  movimientos,
  totales,
  onEditar,
  onEliminar,
  onExportarExcel,
  onExportarPDF,
  onImprimir,
}: Props) {
  if (movimientos.length === 0) {
    return (
      <div className="no-print flex flex-col items-center justify-center gap-3 rounded-xl border bg-card p-12 text-center shadow-sm">
        <PackageSearch className="size-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          No se encontraron movimientos de producto terminado.
        </p>
      </div>
    )
  }

  return (
    <>
      {/* BOTONES EXPORTAR */}
      {/* <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
            <FileSpreadsheet className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wide">
              Kardex Producto Terminado
            </h2>
            <p className="text-[11px] text-muted-foreground">
              {movimientos.length}{" "}
              {movimientos.length === 1 ? "movimiento" : "movimientos"} · Método PEPS
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={onExportarExcel}
            className="h-8 gap-1.5 bg-emerald-600 text-[11px] text-white hover:bg-emerald-700 shadow-md shadow-emerald-900/20 font-semibold">
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Excel
          </Button>
          <Button
            onClick={onExportarPDF}
            className="h-8 gap-1.5 bg-red-600 text-[11px] text-white hover:bg-red-700 shadow-md shadow-red-900/20 font-semibold">
            <FileText className="h-3.5 w-3.5" />
            PDF
          </Button>
          <Button
            onClick={onImprimir}
            variant="outline"
            className="h-8 gap-1.5 text-[11px] text-muted-foreground hover:text-foreground">
            <Printer className="h-3.5 w-3.5" />
            Imprimir
          </Button>
        </div>
      </div> */}

      {/* TABLA KARDEX */}
      <section
        data-report-print="true"
        className="border rounded-2xl bg-card shadow-sm">
        <div className="overflow-x-auto ">
          <table className="w-full  text-[11px]">
            <thead>
              <tr>
                {thPrincipal("Fecha", 2)}
                <th
                  colSpan={4}
                  className="border border-emerald-700 bg-emerald-700 py-1.5 text-center text-[12px] font-bold uppercase text-white">
                  Documento de traslado / comprobante
                </th>
                {thPrincipal("Operación", 2)}
                <th
                  colSpan={3}
                  className="border border-emerald-700 bg-emerald-700 py-1.5 text-center text-[12px] font-bold uppercase text-white">
                  Entradas
                </th>
                <th
                  colSpan={3}
                  className="border border-emerald-700 bg-emerald-700 py-1.5 text-center text-[12px] font-bold uppercase text-white">
                  Salidas
                </th>
                <th
                  colSpan={3}
                  className="border border-blue-600 bg-blue-600 py-1.5 text-center text-[12px] font-bold uppercase text-white">
                  Saldo final
                </th>
                <th
                  colSpan={3}
                  className="border border-emerald-200 dark:border-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 py-1.5 text-center text-[12px] font-bold uppercase text-emerald-900 dark:text-emerald-300">
                  Motivo de salida
                </th>
                {thMotivo("Factura / guía", 2)}
                {thMotivo("Empresa", 2)}
                {thMotivo("Ing. campo", 2)}
                {thMotivo("Acciones", 2)}
              </tr>
              <tr className="bg-emerald-50 dark:bg-emerald-950/40 text-[9px] font-semibold">
                {thSub("Serie")}
                {thSub("Núm")}
                {thSub("Observación")}
                {thSub("Responsable")}
                <th className="border px-1.5 py-1 text-center">CAN</th>
                <th className="border px-1.5 py-1 text-center">C. UNT</th>
                <th className="border px-1.5 py-1 text-center">Costo Total</th>
                <th className="border px-1.5 py-1 text-center">CAN</th>
                <th className="border px-1.5 py-1 text-center">C. UNT</th>
                <th className="border px-1.5 py-1 text-center">C. Total</th>
                <th className="border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-1 text-center">
                  CAN
                </th>
                <th className="border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-1 text-center">
                  C. UNT
                </th>
                <th className="border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-1 text-center">
                  C. Total
                </th>
                {thSub("Prod.")}
                {thSub("Venta")}
                {thSub("Ensayo")}
              </tr>
            </thead>
            <tbody>
              {movimientos.map((m) => (
                <MovimientoPTFila
                  key={m.id}
                  movimiento={m}
                  onEditar={onEditar}
                  onEliminar={onEliminar}
                />
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-emerald-50 dark:bg-emerald-950/40 font-semibold">
                <td
                  colSpan={6}
                  className="border px-1.5 py-1.5 text-center text-xs text-emerald-800 dark:text-emerald-300">
                  TOTALES
                </td>
                <td className="border px-1.5 py-1.5 text-right">
                  {fmtNumeroPT(totales.entradaCan)}
                </td>
                <td className="border px-1.5 py-1.5 text-right">-</td>
                <td className="border px-1.5 py-1.5 text-right">
                  {fmtNumeroPT(totales.entradaCostoTotal)}
                </td>
                <td className="border px-1.5 py-1.5 text-right">
                  {fmtNumeroPT(totales.salidaCan)}
                </td>
                <td className="border px-1.5 py-1.5 text-right">-</td>
                <td className="border px-1.5 py-1.5 text-right">
                  {fmtNumeroPT(totales.salidaCostoTotal)}
                </td>
                <td colSpan={11} />
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </>
  )
}
