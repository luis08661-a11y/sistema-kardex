"use client"

import { Pencil, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"

import { fmtNumeroPT, type MovimientoPT } from "./producto-terminado-types"

type Props = {
  movimiento: MovimientoPT
  onEditar: (movimiento: MovimientoPT) => void
  onEliminar: (movimiento: MovimientoPT) => void
}

const celdaInfo = (clase: string, contenido: string | null | undefined) => (
  <td className={clase}>{contenido ?? "—"}</td>
)

const CLASE_INFO =
  "border border-emerald-200 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/20 px-1.5 py-1"

function CeldaOperacion({ movimiento }: { movimiento: MovimientoPT }) {
  const esEntrada = movimiento.tipoMovimiento === "ENTRADA"
  return (
    <td className="border px-1.5 py-1 text-center">
      <Badge
        variant="outline"
        className={`whitespace-nowrap text-[9px] font-semibold ${
          esEntrada
            ? "border-emerald-200 bg-emerald-100/60 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-300"
            : "border-red-200 bg-red-100/60 text-red-700 dark:border-red-900 dark:bg-red-900/30 dark:text-red-300"
        }`}>
        {movimiento.tipoOperacion?.nombre ??
          movimiento.tipoOperacion?.codigo ??
          "—"}
      </Badge>
    </td>
  )
}

function CeldasEntrada({ movimiento }: { movimiento: MovimientoPT }) {
  const esEntrada = movimiento.tipoMovimiento === "ENTRADA"
  return (
    <>
      <td className="border px-1.5 py-1 text-right font-medium text-emerald-600 dark:text-emerald-400">
        {esEntrada ? fmtNumeroPT(movimiento.entradaCan) : "—"}
      </td>
      <td className="border px-1.5 py-1 text-right text-muted-foreground">
        {esEntrada ? fmtNumeroPT(movimiento.entradaCostoUnitario) : "—"}
      </td>
      <td className="border px-1.5 py-1 text-right font-medium text-emerald-600 dark:text-emerald-400">
        {esEntrada ? fmtNumeroPT(movimiento.entradaCostoTotal) : "—"}
      </td>
    </>
  )
}

function CeldasSalida({ movimiento }: { movimiento: MovimientoPT }) {
  const esSalida = movimiento.tipoMovimiento === "SALIDA"
  return (
    <>
      <td className="border px-1.5 py-1 text-right font-medium text-red-500">
        {esSalida ? fmtNumeroPT(movimiento.salidaCan) : "—"}
      </td>
      <td className="border px-1.5 py-1 text-right text-muted-foreground">
        {esSalida ? fmtNumeroPT(movimiento.salidaCostoUnitario) : "—"}
      </td>
      <td className="border px-1.5 py-1 text-right font-medium text-red-500">
        {esSalida ? fmtNumeroPT(movimiento.salidaCostoTotal) : "—"}
      </td>
    </>
  )
}

function CeldasSaldo({ movimiento }: { movimiento: MovimientoPT }) {
  return (
    <>
      <td className="border border-blue-300 dark:border-blue-700 bg-blue-50/30 dark:bg-blue-950/20 px-1.5 py-1 text-right font-medium">
        {fmtNumeroPT(movimiento.saldo)}
      </td>
      <td className="border border-blue-300 dark:border-blue-700 bg-blue-50/30 dark:bg-blue-950/20 px-1.5 py-1 text-right text-muted-foreground">
        {fmtNumeroPT(movimiento.costoUnitarioSaldo)}
      </td>
      <td className="border border-blue-300 dark:border-blue-700 bg-blue-50/30 dark:bg-blue-950/20 px-1.5 py-1 text-right font-semibold text-blue-500">
        {fmtNumeroPT(movimiento.costoTotalSaldo)}
      </td>
    </>
  )
}

function CeldasMotivo({ movimiento }: { movimiento: MovimientoPT }) {
  const clase = `${CLASE_INFO} text-center`
  return (
    <>
      <td className={clase}>{movimiento.motivo === "PRODUCCION" ? "X" : ""}</td>
      <td className={clase}>{movimiento.motivo === "VENTA" ? "X" : ""}</td>
      <td className={clase}>{movimiento.motivo === "ENSAYO" ? "X" : ""}</td>
    </>
  )
}

function CeldasInfo({ movimiento }: { movimiento: MovimientoPT }) {
  return (
    <>
      {celdaInfo(`${CLASE_INFO} text-center`, movimiento.facturaGuia)}
      {celdaInfo(CLASE_INFO, movimiento.empresaDestino)}
      {celdaInfo(`${CLASE_INFO} text-center`, movimiento.ingCampo)}
    </>
  )
}

function CeldasAcciones({ movimiento, onEditar, onEliminar }: Props) {
  return (
    <td className={`${CLASE_INFO} py-1`}>
      <div className="flex items-center justify-center gap-1">
        <button
          type="button"
          title="Editar"
          onClick={() => onEditar(movimiento)}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary">
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          title="Eliminar"
          onClick={() => onEliminar(movimiento)}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </td>
  )
}

export function MovimientoPTFila({ movimiento, onEditar, onEliminar }: Props) {
  return (
    <tr
      className={`hover:bg-muted/30 ${
        movimiento.tipoMovimiento === "SALIDA"
          ? "bg-red-50/40 dark:bg-red-950/10"
          : "bg-emerald-50/30 dark:bg-emerald-950/5"
      }`}>
      <td className="border px-1.5 py-1 text-center whitespace-nowrap">
        {new Date(movimiento.fecha).toLocaleDateString("es-PE", {
          timeZone: "UTC",
        })}
      </td>
      <td className="border px-1.5 py-1 text-center">
        {movimiento.serie ?? "—"}
      </td>
      <td className="border px-1.5 py-1 text-center">
        {movimiento.numero ?? "—"}
      </td>
      <td className="border px-1.5 py-1 text-left">
        {movimiento.observacion ?? "—"}
      </td>
      <td className="border px-1.5 py-1 text-left">
        {movimiento.responsableDespacho ?? "—"}
      </td>
      <CeldaOperacion movimiento={movimiento} />
      <CeldasEntrada movimiento={movimiento} />
      <CeldasSalida movimiento={movimiento} />
      <CeldasSaldo movimiento={movimiento} />
      <CeldasMotivo movimiento={movimiento} />
      <CeldasInfo movimiento={movimiento} />
      <CeldasAcciones
        movimiento={movimiento}
        onEditar={onEditar}
        onEliminar={onEliminar}
      />
    </tr>
  )
}
