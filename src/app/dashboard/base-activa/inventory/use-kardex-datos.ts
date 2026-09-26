"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import type { SortKey, SortState } from "./kardex-table"
import type { ProductoConLotes } from "./kardex-types"
import type { KardexResumen } from "@/lib/services/inventory.service"
import { obtenerKardexPaginado } from "@/actions/inventory.actions"

const hoyIso = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export function useKardexDatos({
  resumenInicial,
  productos,
}: {
  resumenInicial: KardexResumen
  productos: ProductoConLotes[]
}) {
  const [resumen, setResumen] = useState<KardexResumen>(resumenInicial)
  const [cargando, setCargando] = useState(false)

  const [filtroProducto, setFiltroProducto] = useState<string>("")
  const [filtroOperacion, setFiltroOperacion] = useState<string>("")
  const [fechaDesde, setFechaDesde] = useState<string>("")
  const [fechaHasta, setFechaHasta] = useState<string>("")
  const [busqueda, setBusqueda] = useState<string>("")
  const [sort, setSort] = useState<SortState | null>(null)
  const [page, setPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [reloadKey, setReloadKey] = useState(0)

  const maxPage = Math.max(1, Math.ceil(resumen.total / resumen.pageSize))
  const currentPage = Math.min(page, maxPage)

  useEffect(() => {
    let cancelado = false
    const timer = setTimeout(() => {
      if (!cancelado) setCargando(true)
    }, 0)

    async function cargar() {
      try {
        const res = await obtenerKardexPaginado({
          producto: filtroProducto || undefined,
          operacion: filtroOperacion || undefined,
          fechaDesde: fechaDesde || undefined,
          fechaHasta: fechaHasta || undefined,
          busqueda: busqueda || undefined,
          sortCol: sort?.key,
          sortDir: sort?.dir,
          page: currentPage,
          pageSize,
        })
        if (!cancelado) setResumen(res)
      } catch (error) {
        console.error("Error al cargar el kardex:", error)
        if (!cancelado) toast.error("No se cargaron los registros de inventario")
      } finally {
        if (!cancelado) setCargando(false)
      }
    }

    cargar()
    return () => {
      cancelado = true
      clearTimeout(timer)
    }
  }, [
    filtroProducto,
    filtroOperacion,
    fechaDesde,
    fechaHasta,
    busqueda,
    sort,
    currentPage,
    pageSize,
    reloadKey,
  ])

  const productosDisponibles = useMemo(
    () =>
      productos.map((p) => ({
        label: `${p.codigo} — ${p.descripcion}`,
        value: p.codigo,
      })),
    [productos]
  )

  const productoAStringLabel = useCallback(
    (value: string) => {
      const item = productosDisponibles.find((p) => p.value === value)
      return item ? item.label : String(value ?? "")
    },
    [productosDisponibles]
  )

  const operacionesDisponibles = useMemo(
    () => resumen.operaciones,
    [resumen.operaciones]
  )

  const hayFiltros = Boolean(
    filtroProducto || filtroOperacion || fechaDesde || fechaHasta || busqueda
  )

  const limpiarFiltros = useCallback(() => {
    setFiltroProducto("")
    setFiltroOperacion("")
    setFechaDesde("")
    setFechaHasta("")
    setBusqueda("")
    setPage(1)
  }, [])

  const aplicarHoy = useCallback(() => {
    const hoy = hoyIso()
    setFechaDesde(hoy)
    setFechaHasta(hoy)
    setPage(1)
  }, [])

  const aplicarProducto = useCallback((v: string) => {
    setFiltroProducto(v)
    setPage(1)
  }, [])

  const aplicarOperacion = useCallback((v: string) => {
    setFiltroOperacion(v)
    setPage(1)
  }, [])

  const aplicarBusqueda = useCallback((v: string) => {
    setBusqueda(v)
    setPage(1)
  }, [])

  const aplicarFechaDesde = useCallback((v: string) => {
    setFechaDesde(v)
    setPage(1)
  }, [])

  const aplicarFechaHasta = useCallback((v: string) => {
    setFechaHasta(v)
    setPage(1)
  }, [])

  const handleSort = useCallback((key: SortKey) => {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: "asc" }
      if (prev.dir === "asc") return { key, dir: "desc" }
      return null
    })
    setPage(1)
  }, [])

  const cambiarPageSize = useCallback((n: number) => {
    setPageSize(n)
    setPage(1)
  }, [])

  const paginaAnterior = useCallback(() => {
    setPage((p) => Math.max(1, p - 1))
  }, [])

  const paginaSiguiente = useCallback(() => {
    setPage((p) => Math.min(maxPage, p + 1))
  }, [maxPage])

  const recargar = useCallback(() => {
    setReloadKey((k) => k + 1)
  }, [])

  return {
    resumen,
    cargando,
    maxPage,
    currentPage,
    page,
    pageSize,
    sort,
    hayFiltros,
    productosDisponibles,
    productoAStringLabel,
    operacionesDisponibles,
    filtroProducto,
    filtroOperacion,
    fechaDesde,
    fechaHasta,
    busqueda,
    limpiarFiltros,
    aplicarHoy,
    aplicarProducto,
    aplicarOperacion,
    aplicarBusqueda,
    aplicarFechaDesde,
    aplicarFechaHasta,
    handleSort,
    cambiarPageSize,
    paginaAnterior,
    paginaSiguiente,
    recargar,
  }
}
