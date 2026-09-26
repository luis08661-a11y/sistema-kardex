"use client"

import {
  Check,
  Coins,
  Info,
  Loader2,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { fmt } from "./use-stock-reporte"

type Props = {
  filas: number
  totalStock: number
  hayFiltros: boolean
  haySimulacion: boolean
  integrarCostoUnitario: boolean
  integrarCostoTotal: boolean
  codigo: string
  producto: string
  stockMin: string
  stockMax: string
  cargando: boolean
  error: string
  onCodigo: (v: string) => void
  onProducto: (v: string) => void
  onStockMin: (v: string) => void
  onStockMax: (v: string) => void
  onIntegrarCostoUnitario: (v: boolean) => void
  onIntegrarCostoTotal: (v: boolean) => void
  onConsultar: () => void
  onLimpiar: () => void
}

function StockFiltrosContador({
  filas,
  totalStock,
  hayFiltros,
  cargando,
  onLimpiar,
}: {
  filas: number
  totalStock: number
  hayFiltros: boolean
  cargando: boolean
  onLimpiar: () => void
}) {
  return (
    <div className="ml-auto flex items-center gap-2">
      {!cargando && (
        <span className="whitespace-nowrap text-[11px] font-medium text-muted-foreground">
          <span className="font-bold text-foreground">{filas}</span>{" "}
          {filas === 1 ? "producto" : "productos"}
          {totalStock > 0 && !hayFiltros && (
            <>
              {" "}
              &middot; Stock total{" "}
              <span className="font-bold text-foreground">{fmt(totalStock)}</span>
            </>
          )}
        </span>
      )}
      {hayFiltros && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onLimpiar}
          className="h-6 gap-1 text-[10px] text-muted-foreground hover:text-destructive">
          <X className="h-3 w-3" />
          Limpiar
        </Button>
      )}
    </div>
  )
}

function StockSimulacionToggle({
  activo,
  etiqueta,
  onToggle,
}: {
  activo: boolean
  etiqueta: string
  onToggle: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(!activo)}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-semibold transition-colors ${
        activo
          ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
          : "border-border bg-card text-muted-foreground hover:text-foreground"
      }`}>
      {etiqueta}
      {activo && <Check className="h-3 w-3" />}
    </button>
  )
}

function StockSimulacionAviso({
  integrarCostoUnitario,
  integrarCostoTotal,
}: {
  integrarCostoUnitario: boolean
  integrarCostoTotal: boolean
}) {
  const campos = [
    ...(integrarCostoUnitario ? ["costo unitario"] : []),
    ...(integrarCostoTotal ? ["costo total"] : []),
  ].join(" y ")

  return (
    <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-emerald-600/30 bg-emerald-50/70 p-4 text-xs text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
      <div className="space-y-1">
        <p className="font-semibold">Simulaci&oacute;n de integraci&oacute;n al m&oacute;dulo Productos</p>
        <p>
          Los campos {campos} se mostrar&aacute;n tal como se ver&aacute;n integrados en la ficha del producto.
          No se guarda ni modifica ning&uacute;n dato. La implementaci&oacute;n real queda
          pendiente en el m&oacute;dulo Productos (ver comentarios en
          stock.service.ts y stock-module.tsx).
        </p>
      </div>
    </div>
  )
}

export function StockFiltros({
  filas,
  totalStock,
  hayFiltros,
  haySimulacion,
  integrarCostoUnitario,
  integrarCostoTotal,
  codigo,
  producto,
  stockMin,
  stockMax,
  cargando,
  error,
  onCodigo,
  onProducto,
  onStockMin,
  onStockMax,
  onIntegrarCostoUnitario,
  onIntegrarCostoTotal,
  onConsultar,
  onLimpiar,
}: Props) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-3">
        <div className="mb-1 flex items-center gap-2">
          <SlidersHorizontal className="h-3.5 w-3.5 text-blue-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            B&uacute;squeda y Filtros
          </span>
          <StockFiltrosContador
            filas={filas}
            totalStock={totalStock}
            hayFiltros={hayFiltros}
            cargando={cargando}
            onLimpiar={onLimpiar}
          />
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-5">
          <div className="space-y-0.5">
            <Label className="text-[10px] font-semibold text-muted-foreground">
              C&oacute;digo
            </Label>
            <Input
              value={codigo}
              onChange={(e) => onCodigo(e.target.value)}
              placeholder="C&oacute;digo del producto..."
              className="h-8 text-[11px]"
            />
          </div>
          <div className="space-y-0.5">
            <Label className="text-[10px] font-semibold text-muted-foreground">
              Producto
            </Label>
            <Input
              value={producto}
              onChange={(e) => onProducto(e.target.value)}
              placeholder="Descripci&oacute;n del producto..."
              className="h-8 text-[11px]"
            />
          </div>
          <div className="space-y-0.5">
            <Label className="text-[10px] font-semibold text-muted-foreground">
              Stock m&iacute;n.
            </Label>
            <Input
              type="number"
              value={stockMin}
              onChange={(e) => onStockMin(e.target.value)}
              placeholder="0"
              className="h-8 text-[11px]"
            />
          </div>
          <div className="space-y-0.5">
            <Label className="text-[10px] font-semibold text-muted-foreground">
              Stock m&aacute;x.
            </Label>
            <Input
              type="number"
              value={stockMax}
              onChange={(e) => onStockMax(e.target.value)}
              placeholder="Sin l&iacute;mite"
              className="h-8 text-[11px]"
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={onConsultar}
              disabled={cargando}
              className="h-8 w-full gap-1.5 bg-emerald-600 text-[11px] text-white hover:bg-emerald-700 shadow-md shadow-emerald-900/20 font-semibold">
              {cargando ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Search className="h-3.5 w-3.5" />
              )}
              {cargando ? "Consultando..." : "Consultar"}
            </Button>
          </div>
        </div>

        {/* INTEGRA UN DATO (vista previa) */}
        <div className="mt-1 flex flex-wrap items-center gap-2 rounded-lg border border-dashed bg-muted/30 px-3 py-2">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <Coins className="h-3.5 w-3.5 text-emerald-600" />
            Integra un dato:
          </span>
          <StockSimulacionToggle
            activo={integrarCostoUnitario}
            etiqueta="Costo unitario"
            onToggle={onIntegrarCostoUnitario}
          />
          <StockSimulacionToggle
            activo={integrarCostoTotal}
            etiqueta="Costo total"
            onToggle={onIntegrarCostoTotal}
          />
          <span className="ml-auto text-[10px] text-muted-foreground">
            Solo previsualiza c&oacute;mo quedar&aacute; cada campo en la ficha de Productos.
          </span>
        </div>

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}
      </div>

      {haySimulacion && (
        <StockSimulacionAviso
          integrarCostoUnitario={integrarCostoUnitario}
          integrarCostoTotal={integrarCostoTotal}
        />
      )}
    </div>
  )
}
