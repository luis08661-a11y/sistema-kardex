"use client"

import { useMemo, useState } from "react"

import type { MovimientoPT, TotalesMovimientoPT } from "./producto-terminado-types"

export function useKardexPTFiltros(movimientos: MovimientoPT[]) {
  const [filtroProducto, setFiltroProducto] = useState("todos")
  const [filtroTipo, setFiltroTipo] = useState("todos")
  const [fechaDesde, setFechaDesde] = useState("")
  const [fechaHasta, setFechaHasta] = useState("")

  const hayFiltros = filtroProducto !== "todos" || filtroTipo !== "todos" || Boolean(fechaDesde || fechaHasta)

  const movimientosFiltrados = useMemo(() => {
    let filtered = movimientos
    if (filtroProducto !== "todos") {
      filtered = filtered.filter((m) => m.productoId === filtroProducto)
    }
    if (filtroTipo !== "todos") {
      filtered = filtered.filter((m) => m.tipoMovimiento === filtroTipo)
    }
    if (fechaDesde) {
      filtered = filtered.filter(
        (m) => new Date(m.fecha).toISOString().slice(0, 10) >= fechaDesde,
      )
    }
    if (fechaHasta) {
      filtered = filtered.filter(
        (m) => new Date(m.fecha).toISOString().slice(0, 10) <= fechaHasta,
      )
    }
    return filtered
  }, [movimientos, filtroProducto, filtroTipo, fechaDesde, fechaHasta])

  const totales = useMemo(
    () =>
      movimientosFiltrados.reduce<TotalesMovimientoPT>(
        (acc, m) => {
          if (m.tipoMovimiento === "ENTRADA") {
            acc.entradaCan += Number(m.entradaCan) || 0
            acc.entradaCostoTotal += Number(m.entradaCostoTotal) || 0
          }
          if (m.tipoMovimiento === "SALIDA") {
            acc.salidaCan += Number(m.salidaCan) || 0
            acc.salidaCostoTotal += Number(m.salidaCostoTotal) || 0
          }
          return acc
        },
        {
          entradaCan: 0,
          entradaCostoTotal: 0,
          salidaCan: 0,
          salidaCostoTotal: 0,
        },
      ),
    [movimientosFiltrados],
  )

  function aplicarHoy() {
    const d = new Date()
    const hoy = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    setFechaDesde(hoy)
    setFechaHasta(hoy)
  }

  function limpiar() {
    setFiltroProducto("todos")
    setFiltroTipo("todos")
    setFechaDesde("")
    setFechaHasta("")
  }

  return {
    filtroProducto,
    setFiltroProducto,
    filtroTipo,
    setFiltroTipo,
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    hayFiltros,
    movimientosFiltrados,
    totales,
    aplicarHoy,
    limpiar,
  }
}
