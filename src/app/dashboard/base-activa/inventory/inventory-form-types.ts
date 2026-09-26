import type { ProductoConLotes } from "./kardex-types"

export const PRODUCTOS_VACIOS: ProductoConLotes[] = []

export interface ContextoForm {
  periodos: { id: string; anio: number }[]
  establecimientos: { id: string; nombre: string }[]
  productos: { id: string; codigo: string; descripcion: string }[]
  almacenamientos: { id: string; nombre: string }[]
  operaciones: { id: string; codigo: string; nombre: string }[]
}

export interface InitialData {
  productoId: string
  loteId: string
  periodoId?: string
  establecimientoId?: string
  almacenamientoId?: string
  fecha: string
  tipoOperacionId: string
  tipoMovimiento: string
  unidades: string
  pesoUnitario: string
  pesoTotal: string
  observacion: string
  responsable: string
  formulacion: string
  responsableFormulacion: string
  cantidadProductoFormulado: string
  almacenamientoNombre: string
  costoUnitarioKg: string
}

export interface InventoryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  movimientoId?: string
  productos?: ProductoConLotes[]
  contexto?: ContextoForm
  initialData?: InitialData
  onGuardado?: () => void
}
