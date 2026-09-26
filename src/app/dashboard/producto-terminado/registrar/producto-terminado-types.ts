import type { Prisma } from "@prisma/client"

export type TipoMovimientoPT = "ENTRADA" | "SALIDA"
export type TipoMovimientoRegistro = TipoMovimientoPT | "AJUSTE"
export type NumeroPT = Prisma.Decimal | number

export interface UnidadMedidaRef {
  id: string
  nombre: string
}

export interface ProductoPT {
  id: string
  codigo: string
  descripcion: string
  unidadMedida?: UnidadMedidaRef | null
}

export interface PresentacionPT {
  id: string
  nombre: string
  productoId: string
  unidadMedida?: UnidadMedidaRef | null
}

export interface PeriodoPT {
  id: string
  anio: number
}

export interface EstablecimientoPT {
  id: string
  nombre: string
}

export interface TipoOperacionPT {
  id: string
  codigo: string
  nombre: string
}

export interface MovimientoPT {
  id: string
  fecha: string | Date
  productoId: string
  presentacionId: string | null
  periodoId: string
  establecimientoId: string
  tipoOperacionId: string | null
  tipoMovimiento: TipoMovimientoRegistro
  serie: string | null
  numero: string | null
  observacion: string | null
  responsableDespacho: string | null
  entradaCan: NumeroPT
  entradaCostoUnitario: NumeroPT
  entradaCostoTotal: NumeroPT
  salidaCan: NumeroPT
  salidaCostoUnitario: NumeroPT
  salidaCostoTotal: NumeroPT
  saldo: number
  costoUnitarioSaldo: number
  costoTotalSaldo: number
  motivo: string | null
  facturaGuia: string | null
  empresaDestino: string | null
  ingCampo: string | null
  producto?: { id: string; codigo: string; descripcion: string } | null
  tipoOperacion?: TipoOperacionPT | null
}

export interface ProductoTerminadoData {
  productos: ProductoPT[]
  presentaciones: PresentacionPT[]
  periodos: PeriodoPT[]
  establecimientos: EstablecimientoPT[]
  operaciones: TipoOperacionPT[]
  movimientos: MovimientoPT[]
  resumen: {
    totalEntradas: number
    totalSalidas: number
    stockActual: number
    costoValorizadoTotal: number
  }
}

export interface StockInfoPT {
  stock: number
  costoValorizado: number
}

export interface TotalesMovimientoPT {
  entradaCan: number
  entradaCostoTotal: number
  salidaCan: number
  salidaCostoTotal: number
}

export const fechaInputPT = (fecha: string | Date): string => {
  const date = fecha instanceof Date ? fecha : new Date(fecha)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleDateString("en-CA", { timeZone: "UTC" })
}

export const fmtNumeroPT = (value: unknown) => {
  const number = Number(value)
  return Number.isFinite(number) && number !== 0
    ? number.toLocaleString("es-PE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "—"
}
