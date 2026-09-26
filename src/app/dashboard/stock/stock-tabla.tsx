"use client"

import { Boxes, Warehouse } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import type { StockReporteRow } from "@/actions/stock.actions"
import { fmt } from "./use-stock-reporte"

type Props = {
  rows: StockReporteRow[]
  esBA: boolean
  unidad: string
  stock: string
  costoUnitario: string
  costoTotal: string
  integrarCostoUnitario: boolean
  integrarCostoTotal: boolean
  totalStock: number
  totalCosto: number
  costoUnitarioPromedio: number
}

const CHIP_INTEGRADO = (
  <span className="ml-1.5 inline-block rounded bg-emerald-600 px-1 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white align-middle">
    Integrado
  </span>
)

const CELDA_INTEGRADA =
  "text-right font-sans font-semibold text-emerald-700 dark:text-emerald-400"

export function StockTabla({
  rows,
  esBA,
  unidad,
  stock,
  costoUnitario,
  costoTotal,
  integrarCostoUnitario,
  integrarCostoTotal,
  totalStock,
  totalCosto,
  costoUnitarioPromedio,
}: Props) {
  return (
    <>
      <div className="no-print flex items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
            {esBA ? <Warehouse className="h-4 w-4" /> : <Boxes className="h-4 w-4" />}
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wide">
              {esBA ? "Stock Base Activa" : "Stock Producto Terminado"}
            </h2>
            <p className="text-[11px] text-muted-foreground">
              {rows.length} {rows.length === 1 ? "producto" : "productos"} &middot; Stock total{" "}
              {fmt(totalStock)}
              {esBA ? " kg" : " und"} &middot; Valorizado S/ {fmt(totalCosto)}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-28">C&oacute;digo</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead className="w-32">{unidad}</TableHead>
              <TableHead className="w-32 text-right">{stock}</TableHead>
              <TableHead className="w-44 text-right">
                <span className="inline-flex items-center">
                  {costoUnitario}
                  {integrarCostoUnitario && CHIP_INTEGRADO}
                </span>
              </TableHead>
              <TableHead className="w-40 text-right">
                <span className="inline-flex items-center">
                  {costoTotal}
                  {integrarCostoTotal && CHIP_INTEGRADO}
                </span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={`${r.productoId}|${r.presentacionId ?? ""}`}>
                <TableCell className="font-mono text-[11px]">{r.codigo}</TableCell>
                <TableCell className="text-[12px] font-medium">{r.descripcion}</TableCell>
                <TableCell className="text-[11px] text-muted-foreground">
                  {esBA ? r.unidad : r.presentacion}
                </TableCell>
                <TableCell className="text-right text-[12px] font-semibold">
                  {fmt(r.stock)}
                </TableCell>
                <TableCell
                  className={integrarCostoUnitario ? CELDA_INTEGRADA : "text-right text-[12px]"}>
                  {fmt(r.costoUnitario)}
                </TableCell>
                <TableCell
                  className={integrarCostoTotal ? CELDA_INTEGRADA : "text-right text-[12px]"}>
                  {fmt(r.costoTotal)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="border-t-2 border-foreground/10 bg-muted/40 hover:bg-muted/40">
              <TableCell
                colSpan={3}
                className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                Totales
              </TableCell>
              <TableCell className="text-right text-[12px] font-bold">
                {fmt(totalStock)}
              </TableCell>
              <TableCell className="text-right text-[12px] font-bold">
                {fmt(costoUnitarioPromedio)}
              </TableCell>
              <TableCell
                className={`text-right text-[12px] ${integrarCostoTotal ? CELDA_INTEGRADA : "font-bold"}`}>
                {fmt(totalCosto)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </>
  )
}
