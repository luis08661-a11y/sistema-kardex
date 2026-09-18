"use client"

import { useState, useEffect, useCallback, useTransition, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Loader2, Plus, PackageSearch, CalendarDays, Search, X,
  Download, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  ArrowDownCircle, ArrowUpCircle, Scale, Warehouse, SlidersHorizontal,
  FlaskConicalIcon, PackageCheck, Layers, Boxes, FileSpreadsheet,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import KardexTable, { type SortKey, type SortState } from "./kardex-table"
import type { KardexResumen } from "@/lib/services/inventory.service"
import { obtenerKardexPaginado, eliminarRegistroInventario } from "@/actions/inventory.actions"
import { InventoryForm } from "./inventoryForms"
import * as XLSX from "xlsx"

export interface ProductoConLotes {
  id: string
  codigo: string
  descripcion: string
  codigoExistencia: string | null
  lotesBase: {
    id: string
    codigo: string
    fechaIngreso: Date | null
    almacenamiento: { nombre: string } | null
    _count: { movimientos: number }
  }[]
}

interface ContextoBase {
  periodos: { id: string; anio: number }[]
  establecimientos: { id: string; nombre: string }[]
  productos: { id: string; codigo: string; descripcion: string }[]
  almacenamientos: { id: string; nombre: string }[]
  operaciones: { id: string; codigo: string; nombre: string }[]
}

interface StockBaseRow {
  productoId: string
  loteId: string
  stockKg: number
  producto: { id: string; codigo: string; descripcion: string } | null
  _sum: { entradaPesoTotalKg: number | null; salidaPesoTotalKg: number | null }
}

interface KardexTableContainerProps {
  resumen: KardexResumen
  productos: ProductoConLotes[]
  contexto: ContextoBase
  stock: StockBaseRow[]
}

const PAGE_SIZES = [5, 10, 25, 50, 100]

type KardexRowType = KardexResumen["rows"][number]

export default function KardexTableContainer({
  resumen: resumenInicial,
  productos,
  contexto,
  stock,
}: KardexTableContainerProps) {
  const router = useRouter()

  const [tab, setTab] = useState<"movimientos" | "lotes" | "stock">("movimientos")
  const [resumen, setResumen] = useState<KardexResumen>(resumenInicial)
  const [cargando, setCargando] = useState(false)

  const [editando, setEditando] = useState<KardexRowType | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [eliminando, setEliminando] = useState<KardexRowType | null>(null)

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
    const d = new Date()
    const hoy = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
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

  const handleSort = useCallback((key: SortKey) => {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: "asc" }
      if (prev.dir === "asc") return { key, dir: "desc" }
      return null
    })
    setPage(1)
  }, [])

  const handleNuevo = () => {
    setEditando(null)
    setFormOpen(true)
  }

  const handleEditar = (row: KardexRowType) => {
    setEditando(row)
    setFormOpen(true)
  }

  const handleFormClose = useCallback((open: boolean) => {
    setFormOpen(open)
    if (!open) setEditando(null)
  }, [])

  const handleGuardado = useCallback(() => {
    setFormOpen(false)
    setEditando(null)
    setReloadKey((k) => k + 1)
  }, [])

  const initialData = useMemo(() => {
    if (!editando) return undefined
    const prod = productos.find((p) => p.descripcion === editando.descripcion)
    const lote = prod?.lotesBase.find((l) => l.codigo === editando.codigo)
    const op = contexto.operaciones.find(
      (o) =>
        o.nombre === editando.tipo_operacion ||
        o.codigo === editando.operacion_codigo
    )
    const esSalida = editando.salida_und > 0
    return {
      productoId: prod?.id ?? "",
      loteId: lote?.id ?? "",
      fecha: editando.fecha,
      tipoOperacionId: op?.id ?? "",
      tipoMovimiento: esSalida ? "SALIDA" : "ENTRADA",
      unidades: String(editando.entrada_und || editando.salida_und || ""),
      pesoUnitario: String(
        editando.entrada_peso_kg || editando.salida_peso_unitario || ""
      ),
      pesoTotal: String(
        editando.entrada_peso_total || editando.salida_peso_total || ""
      ),
      observacion: editando.observacion,
      responsable: editando.responsable_del_registro,
      formulacion: editando.motivo_salida_formulacion ?? "",
      responsableFormulacion: editando.responsable_formulacion ?? "",
      cantidadProductoFormulado: String(
        editando.cantidad_producto_formulado ?? ""
      ),
      almacenamientoNombre: editando.almacenamiento ?? "",
      costoUnitarioKg: "",
    }
  }, [editando, productos, contexto.operaciones])

  const exportarExcel = async () => {
    try {
      const full = await obtenerKardexPaginado({
        producto: filtroProducto || undefined,
        operacion: filtroOperacion || undefined,
        fechaDesde: fechaDesde || undefined,
        fechaHasta: fechaHasta || undefined,
        busqueda: busqueda || undefined,
        sortCol: sort?.key,
        sortDir: sort?.dir,
        page: 1,
        pageSize: 100000,
      })
      const header = [
        "FECHA",
        "LOTE",
        "PRODUCTO",
        "OBSERVACION",
        "RESPONSABLE",
        "TIPO_OPERACION",
        "ENTRADA_UND",
        "ENTRADA_PESO_KG",
        "ENTRADA_TOTAL_KG",
        "SALIDA_UND",
        "SALIDA_PESO_KG",
        "SALIDA_TOTAL_KG",
        "SALDO_UND",
        "SALDO_PESO_KG",
        "SALDO_TOTAL_KG",
        "MOTIVO_SALIDA",
        "RESP_FINAL",
        "CANTIDAD_FORMULADO",
        "ALMACEN",
      ]
      const aoa = [
        header,
        ...full.rows.map((r: KardexRowType) => [
          r.fecha,
          r.codigo,
          r.descripcion,
          r.observacion,
          r.responsable_del_registro,
          r.tipo_operacion,
          r.entrada_und,
          r.entrada_peso_kg,
          r.entrada_peso_total,
          r.salida_und,
          r.salida_peso_unitario,
          r.salida_peso_total,
          r.saldo_und,
          r.saldo_peso_kg,
          r.saldo_peso_total,
          r.motivo_salida_formulacion ?? "",
          r.responsable_formulacion ?? "",
          r.cantidad_producto_formulado ?? "",
          r.almacenamiento ?? "",
        ]),
      ]
      const ws = XLSX.utils.aoa_to_sheet(aoa)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Kardex Base Activa")
      XLSX.writeFile(wb, `kardex_base_activa_${new Date().toISOString().slice(0, 10)}.xlsx`)
      toast.success("Archivo Excel exportado correctamente")
    } catch (error) {
      console.error("Error al exportar Excel:", error)
      toast.error("No se pudo exportar el Excel")
    }
  }

  const [isDeleting, startDelete] = useTransition()
  const confirmarEliminar = () => {
    if (!eliminando) return
    const fd = new FormData()
    fd.set("movimientoId", eliminando.id)
    startDelete(async () => {
      const res = await eliminarRegistroInventario(
        { success: false, message: "" },
        fd
      )
      if (res.success) {
        toast.success("Registro de inventario eliminado correctamente")
        setEliminando(null)
        setReloadKey((k) => k + 1)
        router.refresh()
      } else {
        toast.error(res.message || "Error al eliminar el registro")
      }
    })
  }

  const totalLotes = productos.reduce((a, p) => a + p.lotesBase.length, 0)
  const stockActualKg = stock.reduce((a, x) => a + Math.max(0, x.stockKg), 0)

  const todosLosLotes = useMemo(() => {
    return productos.flatMap((p) =>
      p.lotesBase.map((l) => ({
        id: l.id,
        codigo: l.codigo,
        fechaIngreso: l.fechaIngreso,
        almacenamiento: l.almacenamiento?.nombre ?? null,
        movimientos: l._count.movimientos,
        productoCodigo: p.codigo,
        productoDescripcion: p.descripcion,
      }))
    )
  }, [productos])

  const loteCodigoPorId = useMemo(() => {
    const map = new Map<string, string>()
    productos.forEach((p) =>
      p.lotesBase.forEach((l) => map.set(l.id, l.codigo))
    )
    return map
  }, [productos])

  const tabs = [
    { key: "movimientos" as const, label: "Movimientos", icon: <Scale className="h-3.5 w-3.5" /> },
    { key: "lotes" as const, label: "Lotes", icon: <Layers className="h-3.5 w-3.5" /> },
    { key: "stock" as const, label: "Stock por lote", icon: <Boxes className="h-3.5 w-3.5" /> },
  ]

  const stockUltimos = [...stock]
    .sort((a, b) => b.stockKg - a.stockKg)

  return (
    <>
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl border p-3 text-white shadow-lg shadow-emerald-500/20">
        <div className="absolute -right-8 -top-2 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/10 blur-xl" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                <FlaskConicalIcon className="h-4 w-4" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Kardex Base Activa</h1>
            </div>
            <p className="text-sm text-zinc-200 mt-1">
              Lotes, movimientos e inventario histórico de materia prima.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {resumen.total > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={exportarExcel}
                disabled={resumen.total === 0 || cargando}
                className="h-8 gap-1.5 border-emerald-300 text-[11px] text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950">
                <FileSpreadsheet className="h-3.5 w-3.5" />
                Exportar Excel
              </Button>
              
              
            )}
            <Button
              onClick={handleNuevo}
              className="h-8 gap-1.5 bg-emerald-600 text-[11px] text-white hover:bg-emerald-700 shadow-md shadow-emerald-900/20 font-semibold">
              <Plus className="h-4 w-4" />
              Nuevo Movimiento Base Activa
            </Button>
          </div>
        </div>
      </div>

      {/* Indicadores */}
    {/*   <div className="grid grid-cols-1 @xl/main:grid-cols-2 @5xl/main:grid-cols-3 gap-4">
        <div className="group relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 to-transparent opacity-0 transition-opacity group-hover:opacity-100 dark:from-blue-950/30" />
          <div className="relative">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                <Layers className="h-5 w-5" />
              </div>
              <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-400 text-[10px] font-semibold">
                Reales
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold tabular-nums text-foreground">
                {totalLotes.toLocaleString("es-PE")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Lotes Base Activa</p>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/80 to-transparent opacity-0 transition-opacity group-hover:opacity-100 dark:from-emerald-950/30" />
          <div className="relative">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
                <PackageCheck className="h-5 w-5" />
              </div>
              <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 text-[10px] font-semibold">
                Movimientos
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                {resumen.total.toLocaleString("es-PE")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Movimientos registrados</p>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-sky-200 dark:hover:border-sky-800">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-50/80 to-transparent opacity-0 transition-opacity group-hover:opacity-100 dark:from-sky-950/30" />
          <div className="relative">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400">
                <Warehouse className="h-5 w-5" />
              </div>
              <Badge variant="outline" className="border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-400 text-[10px] font-semibold">
                Stock
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold tabular-nums text-sky-600 dark:text-sky-400">
                {stockActualKg.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Stock Base Activa (Kg)</p>
            </div>
          </div>
        </div>
      </div> */}

      {/* Pestañas */}
      <div className="flex gap-1 border-b">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm transition-colors ${
              tab === t.key
                ? "border-b-2 border-primary font-semibold text-primary"
                : "border-b-2 border-transparent text-muted-foreground hover:text-foreground"
            }`}>
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {tab === "movimientos" && (
        <>
          {/* Filtros */}
          {(resumen.total > 0 || hayFiltros) && (
            <div className="rounded-xl border bg-card p-4 shadow-sm">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 mb-1">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-blue-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Búsqueda y Filtros
                  </span>
                  <div className="ml-auto flex items-center gap-2">
                    <span className="whitespace-nowrap text-[11px] font-medium text-muted-foreground">
                      <span className="font-bold text-foreground">{resumen.total}</span> {resumen.total === 1 ? "registro" : "registros"}
                    </span>
                    {hayFiltros && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={limpiarFiltros}
                        className="h-6 gap-1 text-[10px] text-muted-foreground hover:text-destructive">
                        <X className="h-3 w-3" />
                        Limpiar
                      </Button>
                    )}
                  </div>
                </div>
                {/* <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={busqueda}
                      onChange={(e) => aplicarBusqueda(e.target.value)}
                      placeholder="Buscar por lote, producto, observación o responsable..."
                      className="h-8 pl-8 text-[11px]"
                    />
                  </div>
                </div> */}

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-5">
                  <div className="space-y-0.5">
                    <Label className="text-[10px] font-semibold text-muted-foreground">
                      Producto Maestro
                    </Label>
                    <Combobox
                      value={filtroProducto}
                      onValueChange={(v) => aplicarProducto(v ?? "")}
                      itemToStringLabel={productoAStringLabel}>
                      <ComboboxInput
                        placeholder="Todos los Productos Maestros..."
                        className="h-8 text-[11px]"
                      />
                      <ComboboxContent>
                        <ComboboxList>
                          {productosDisponibles.map((p) => (
                            <ComboboxItem key={p.value} value={p.value}>
                              {p.label}
                            </ComboboxItem>
                          ))}
                        </ComboboxList>
                        <ComboboxEmpty>No se encontró el producto.</ComboboxEmpty>
                      </ComboboxContent>
                    </Combobox>
                  </div>

                  <div className="space-y-0.5">
                    <Label className="text-[10px] font-semibold text-muted-foreground">
                      Tipo de Operación
                    </Label>
                    <Select
                      value={filtroOperacion}
                      onValueChange={(v) => aplicarOperacion(v ?? "")}>
                      <SelectTrigger className="h-8 w-full text-[11px]">
                        <SelectValue placeholder="Todas las operaciones..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {operacionesDisponibles.map((op) => (
                            <SelectItem key={op.value} value={op.value} className="text-[11px]">
                              {op.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-0.5">
                    <Label className="text-[10px] font-semibold text-muted-foreground">
                      Fecha Desde
                    </Label>
                    <Input
                      type="date"
                      value={fechaDesde}
                      onChange={(e) => { setFechaDesde(e.target.value); setPage(1) }}
                      className="h-8 text-[11px]"
                    />
                  </div>

                  <div className="space-y-0.5">
                    <Label className="text-[10px] font-semibold text-muted-foreground">
                      Fecha Hasta
                    </Label>
                    <Input
                      type="date"
                      value={fechaHasta}
                      onChange={(e) => { setFechaHasta(e.target.value); setPage(1) }}
                      className="h-8 text-[11px]"
                    />
                  </div>

                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={aplicarHoy}
                      className="h-8 gap-1.5 border-emerald-300 text-[11px] text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Hoy
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="relative">
            {cargando && (
              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex h-8 items-center justify-center rounded-t-lg bg-muted/50 text-[11px] font-medium text-muted-foreground">
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Cargando...
              </div>
            )}
            <KardexTable
              rows={resumen.rows}
              sort={sort}
              onSort={handleSort}
              totals={resumen.total > 0 ? resumen.totals : undefined}
              onEditar={handleEditar}
              onEliminar={setEliminando}
            />
          </div>

          {/* Paginación */}
          {resumen.total > 0 && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[11px] text-muted-foreground">
                Mostrando{" "}
                <span className="font-semibold text-foreground">
                  {(currentPage - 1) * pageSize + 1}–
                  {Math.min(currentPage * pageSize, resumen.total)}
                </span>{" "}
                de{" "}
                <span className="font-semibold text-foreground">
                  {resumen.total}
                </span>{" "}
                registros
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={String(pageSize)}
                  onValueChange={(v) => { setPageSize(Number(v)); setPage(1) }}>
                  <SelectTrigger className="h-8 w-[110px] text-[11px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {PAGE_SIZES.map((ps) => (
                        <SelectItem key={ps} value={String(ps)} className="text-[11px]">
                          {ps} por página
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    disabled={currentPage <= 1}
                    onClick={() => setPage(1)}
                    aria-label="Primera página">
                    <ChevronsLeft className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    disabled={currentPage <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    aria-label="Página anterior">
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  <span className="px-2 text-[11px] font-medium text-muted-foreground">
                    {currentPage} / {maxPage}
                  </span>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    disabled={currentPage >= maxPage}
                    onClick={() => setPage((p) => p + 1)}
                    aria-label="Página siguiente">
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    disabled={currentPage >= maxPage}
                    onClick={() => setPage(maxPage)}
                    aria-label="Última página">
                    <ChevronsRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {tab === "lotes" && (
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="border-b p-4">
            <h2 className="text-sm font-semibold">Lotes Base Activa</h2>
            <p className="text-xs text-muted-foreground">
              Lotes registrados por producto maestro.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="p-3">Lote</th>
                  <th className="p-3">Producto</th>
                  <th className="p-3">Almacenamiento</th>
                  <th className="p-3 text-right">Movimientos</th>
                </tr>
              </thead>
              <tbody>
                {todosLosLotes.length ? (
                  todosLosLotes.map((l) => (
                    <tr key={l.id} className="border-b">
                      <td className="p-3 font-mono text-[12px] font-semibold">{l.codigo}</td>
                      <td className="p-3">{l.productoCodigo} — {l.productoDescripcion}</td>
                      <td className="p-3">{l.almacenamiento ?? "—"}</td>
                      <td className="p-3 text-right tabular-nums">{l.movimientos}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-sm text-muted-foreground">
                      No hay lotes Base Activa registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "stock" && (
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="border-b p-4">
            <h2 className="text-sm font-semibold">Stock derivado de movimientos</h2>
            <p className="text-xs text-muted-foreground">
              El stock no se captura manualmente: Entradas Kg − Salidas Kg por lote, en orden cronológico.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="p-3">Producto</th>
                  <th className="p-3">Lote</th>
                  <th className="p-3 text-right">Entradas</th>
                  <th className="p-3 text-right">Salidas</th>
                  <th className="p-3 text-right">Stock</th>
                </tr>
              </thead>
              <tbody>
                {stockUltimos.length ? (
                  stockUltimos.map((x) => (
                    <tr key={`${x.productoId}-${x.loteId}`} className="border-b">
                      <td className="p-3">
                        {x.producto?.codigo ?? "—"} — {x.producto?.descripcion ?? ""}
                      </td>
                      <td className="p-3 font-mono font-semibold">
                        {loteCodigoPorId.get(x.loteId) ?? x.loteId}
                      </td>
                      <td className="p-3 text-right text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {(Number(x._sum.entradaPesoTotalKg ?? 0)).toFixed(2)} Kg
                      </td>
                      <td className="p-3 text-right text-red-500 tabular-nums">
                        {(Number(x._sum.salidaPesoTotalKg ?? 0)).toFixed(2)} Kg
                      </td>
                      <td className="p-3 text-right font-semibold text-sky-600 dark:text-sky-400 tabular-nums">
                        {x.stockKg.toFixed(2)} Kg
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-sm text-muted-foreground">
                      No hay stock disponible.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <InventoryForm
        key={`${editando?.id ?? "new"}:${formOpen ? "open" : "closed"}`}
        open={formOpen}
        onOpenChange={handleFormClose}
        movimientoId={editando?.id}
        productos={productos}
        contexto={contexto}
        initialData={initialData}
        onGuardado={handleGuardado}
      />

      <AlertDialog open={Boolean(eliminando)} onOpenChange={(open) => !open && setEliminando(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <PackageSearch className="h-5 w-5 text-orange-500" />
              ¿Eliminar este registro?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará el movimiento del{" "}
              <strong className="text-foreground">{eliminando?.fecha}</strong> para
              el lote <strong className="text-foreground">{eliminando?.codigo}</strong>{" "}
              y se recalculará el Saldo Final de todo el lote (método PEPS). Esta
              acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmarEliminar}
              disabled={isDeleting}
              className="gap-1.5">
              {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Eliminar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}