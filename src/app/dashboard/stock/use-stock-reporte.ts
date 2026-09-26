"use client"

import { useCallback, useState } from "react"

import {
  consultarStockReporte,
  type StockReporteRow,
  type TipoStockReporte,
} from "@/actions/stock.actions"

export const fmt = (n: number) =>
  n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const toNumero = (v: string) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}

export function etiquetasStock(tipo: TipoStockReporte) {
  const esBA = tipo === "BASE_ACTIVA"
  return {
    esBA,
    unidad: esBA ? "Unidad" : "Presentación",
    stock: esBA ? "Stock (kg)" : "Stock (und)",
    costoUnitario: esBA ? "Costo unitario (S/ / kg)" : "Costo unitario (S/ / und)",
    costoTotal: "Costo total (S/)",
    titulo: esBA ? "STOCK BASE ACTIVA" : "STOCK PRODUCTO TERMINADO",
    subtitulo: esBA ? "BASE ACTIVA (MATERIA PRIMA)" : "PRODUCTO TERMINADO",
    zona: esBA ? "Base Activa" : "Producto Terminado",
    unidadStock: esBA ? " kg" : " und",
    tablaTitulo: esBA ? "Stock Base Activa" : "Stock Producto Terminado",
  }
}

export function useStockReporte({
  tipo,
  inicial,
}: {
  tipo: TipoStockReporte
  inicial: StockReporteRow[]
}) {
  const [codigo, setCodigo] = useState("")
  const [producto, setProducto] = useState("")
  const [stockMin, setStockMin] = useState("")
  const [stockMax, setStockMax] = useState("")
  const [integrarCostoUnitario, setIntegrarCostoUnitario] = useState(false)
  const [integrarCostoTotal, setIntegrarCostoTotal] = useState(false)
  const [rows, setRows] = useState<StockReporteRow[]>(inicial)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState("")

  const hayFiltros = Boolean(codigo || producto || stockMin || stockMax)

  const consultar = useCallback(async () => {
    setError("")
    setCargando(true)
    try {
      const res = await consultarStockReporte(
        tipo,
        { codigo: codigo || undefined, producto: producto || undefined },
      )
      const min = toNumero(stockMin)
      const max = toNumero(stockMax)
      setRows(
        res.filter(
          (r) =>
            (min === undefined || r.stock >= min) &&
            (max === undefined || r.stock <= max),
        ),
      )
    } catch (e) {
      setError(
        (e instanceof Error ? e.message : "Error al consultar el stock.") ||
          "Error al consultar el stock.",
      )
    } finally {
      setCargando(false)
    }
  }, [codigo, producto, stockMax, stockMin, tipo])

  const limpiar = useCallback(() => {
    setCodigo("")
    setProducto("")
    setStockMin("")
    setStockMax("")
    setRows(inicial)
    setError("")
  }, [inicial])

  const totalStock = rows.reduce((acc, r) => acc + r.stock, 0)
  const totalCosto = rows.reduce((acc, r) => acc + r.costoTotal, 0)
  const costoUnitarioPromedio = totalStock > 0 ? totalCosto / totalStock : 0

  return {
    codigo,
    setCodigo,
    producto,
    setProducto,
    stockMin,
    setStockMin,
    stockMax,
    setStockMax,
    integrarCostoUnitario,
    setIntegrarCostoUnitario,
    integrarCostoTotal,
    setIntegrarCostoTotal,
    rows,
    cargando,
    error,
    hayFiltros,
    haySimulacion: integrarCostoUnitario || integrarCostoTotal,
    totalStock,
    totalCosto,
    costoUnitarioPromedio,
    consultar,
    limpiar,
  }
}
