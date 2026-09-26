import type { KardexResumen } from "@/lib/services/inventory.service"

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

export interface ContextoBase {
  periodos: { id: string; anio: number }[]
  establecimientos: { id: string; nombre: string }[]
  productos: { id: string; codigo: string; descripcion: string }[]
  almacenamientos: { id: string; nombre: string }[]
  operaciones: { id: string; codigo: string; nombre: string }[]
}

export interface StockBaseRow {
  productoId: string
  loteId: string
  stockKg: number
  producto: { id: string; codigo: string; descripcion: string } | null
  _sum: { entradaPesoTotalKg: number | null; salidaPesoTotalKg: number | null }
}

export interface KardexTableContainerProps {
  resumen: KardexResumen
  productos: ProductoConLotes[]
  contexto: ContextoBase
  stock: StockBaseRow[]
}

export type KardexRowType = KardexResumen["rows"][number]

export const PAGE_SIZES = [5, 10, 25, 50, 100]
