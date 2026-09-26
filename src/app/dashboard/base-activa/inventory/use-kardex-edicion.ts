"use client"

import { useCallback, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import * as XLSX from "xlsx"

import type { SortKey } from "./kardex-table"
import type {
  ContextoBase,
  KardexRowType,
  ProductoConLotes,
} from "./kardex-types"
import { obtenerKardexPaginado, eliminarRegistroInventario } from "@/actions/inventory.actions"

const HEADERS = [
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

const filaExcel = (r: KardexRowType) => [
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
]

export function useKardexEdicion({
  productos,
  contexto,
  filtros,
  sort,
  recargar,
}: {
  productos: ProductoConLotes[]
  contexto: ContextoBase
  filtros: {
    filtroProducto: string
    filtroOperacion: string
    fechaDesde: string
    fechaHasta: string
    busqueda: string
  }
  sort: { key: SortKey; dir: "asc" | "desc" } | null
  recargar: () => void
}) {
  const router = useRouter()

  const [editando, setEditando] = useState<KardexRowType | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [eliminando, setEliminando] = useState<KardexRowType | null>(null)

  const handleNuevo = useCallback(() => {
    setEditando(null)
    setFormOpen(true)
  }, [setEditando, setFormOpen])

  const handleEditar = useCallback(
    (row: KardexRowType) => {
      setEditando(row)
      setFormOpen(true)
    },
    [setEditando, setFormOpen]
  )

  const handleFormClose = useCallback(
    (open: boolean) => {
      setFormOpen(open)
      if (!open) setEditando(null)
    },
    [setEditando, setFormOpen]
  )

  const handleGuardado = useCallback(() => {
    setFormOpen(false)
    setEditando(null)
    recargar()
  }, [recargar, setEditando, setFormOpen])

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

  const exportarExcel = useCallback(async () => {
    try {
      const full = await obtenerKardexPaginado({
        producto: filtros.filtroProducto || undefined,
        operacion: filtros.filtroOperacion || undefined,
        fechaDesde: filtros.fechaDesde || undefined,
        fechaHasta: filtros.fechaHasta || undefined,
        busqueda: filtros.busqueda || undefined,
        sortCol: sort?.key,
        sortDir: sort?.dir,
        page: 1,
        pageSize: 100000,
      })
      const ws = XLSX.utils.aoa_to_sheet([
        HEADERS,
        ...full.rows.map((r: KardexRowType) => filaExcel(r)),
      ])
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Kardex Base Activa")
      XLSX.writeFile(wb, `kardex_base_activa_${new Date().toISOString().slice(0, 10)}.xlsx`)
      toast.success("Archivo Excel exportado correctamente")
    } catch (error) {
      console.error("Error al exportar Excel:", error)
      toast.error("No se pudo exportar el Excel")
    }
  }, [filtros, sort])

  const [isDeleting, startDelete] = useTransition()

  const confirmarEliminar = useCallback(() => {
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
        recargar()
        router.refresh()
      } else {
        toast.error(res.message || "Error al eliminar el registro")
      }
    })
  }, [eliminando, recargar, router, setEliminando])

  return {
    editando,
    formOpen,
    eliminando,
    isDeleting,
    initialData,
    handleNuevo,
    handleEditar,
    handleFormClose,
    handleGuardado,
    setEliminando,
    exportarExcel,
    confirmarEliminar,
  }
}

