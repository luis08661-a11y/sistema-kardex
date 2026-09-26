"use client"

import type { ReactNode } from "react"
import {
  ArrowDownCircle,
  ArrowUpCircle,
  FileText,
  Layers,
  PackageSearch,
} from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import type { ProductoPT, TipoMovimientoPT } from "./producto-terminado-types"
import type { ProductoTerminadoForm } from "./use-producto-terminado-form"

const EncabezadoSeccion = ({
  icono,
  titulo,
  tone,
}: {
  icono: ReactNode
  titulo: string
  tone: { chip: string; texto: string }
}) => (
  <div className="flex items-center gap-2 border-b border-border pb-1.5">
    <span className={`flex h-5 w-5 items-center justify-center rounded ${tone.chip}`}>
      {icono}
    </span>
    <h3 className={`text-xs font-bold uppercase tracking-wide ${tone.texto}`}>
      {titulo}
    </h3>
  </div>
)

export function SeccionProductoTerminado({
  form,
  productos,
}: {
  form: ProductoTerminadoForm
  productos: ProductoPT[]
}) {
  const { productoId, handleProductoChange, stockInfo, selectedPres, selectedProduct } =
    form

  const etiquetaProducto = (v: string) => {
    const p = productos.find((x) => x.id === v)
    return p ? `${p.codigo} — ${p.descripcion}` : ""
  }

  return (
    <section className="order-1 space-y-3">
      <EncabezadoSeccion
        icono={<PackageSearch className="h-3 w-3" />}
        titulo="1. Producto terminado y presentación"
        tone={{
          chip: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
          texto: "text-emerald-700 dark:text-emerald-400",
        }}
      />
      <div className="grid grid-cols-12 gap-3">
        <div className="space-y-1 md:col-span-4">
          <Label className="text-xs font-semibold text-muted-foreground">
            Producto
          </Label>
          <Combobox
            value={productoId}
            onValueChange={(v) => handleProductoChange(v)}
            itemToStringLabel={etiquetaProducto}>
            <ComboboxInput
              placeholder="Buscar Producto Terminado..."
              className="h-8 font-semibold"
            />
            <ComboboxContent>
              <ComboboxList>
                {productos.map((p) => (
                  <ComboboxItem key={p.id} value={p.id}>
                    {p.codigo} — {p.descripcion}
                  </ComboboxItem>
                ))}
              </ComboboxList>
              <ComboboxEmpty>No se encontró el producto.</ComboboxEmpty>
            </ComboboxContent>
          </Combobox>
        </div>
        <div className="space-y-1 md:col-span-3">
          <Label className="text-xs font-semibold text-muted-foreground">
            Presentación
          </Label>
          <Input
            value={selectedPres?.nombre ?? ""}
            placeholder="BOLSA 1K"
            readOnly
            disabled
            className="h-8 cursor-not-allowed bg-muted/50 text-xs font-semibold text-muted-foreground"
          />
        </div>
        <div className="space-y-1 md:col-span-3">
          <Label className="text-xs font-semibold text-muted-foreground">
            Unidad de Medida
          </Label>
          <Input
            value={
              selectedPres?.unidadMedida?.nombre ??
              selectedProduct?.unidadMedida?.nombre ??
              ""
            }
            placeholder="KILLOGRAMOS"
            readOnly
            disabled
            className="h-8 cursor-not-allowed bg-muted/50 text-xs font-semibold text-muted-foreground"
          />
        </div>{" "}
        {stockInfo && (
          <div className="space-y-1 md:col-span-2">
            <Label className="text-xs font-semibold text-muted-foreground">
              Stock Actual
            </Label>
            <div className="flex h-8 w-full items-center justify-between rounded-md border border-primary/20 bg-primary/5 px-3">
              <span className="font-mono text-xs font-bold tabular-nums text-primary">
                {stockInfo.stock.toLocaleString("es-PE", {
                  minimumFractionDigits: 0,
                })}
              </span>
              {/* <span className="text-[11px] font-medium text-muted-foreground">
                {selectedPres?.unidadMedida?.nombre ??
                  selectedProduct?.unidadMedida?.nombre ??
                  "UND"}
              </span> */}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export function SeccionDocumentoResponsable({ form }: { form: ProductoTerminadoForm }) {
  const { campos, setCampo } = form

  return (
    <section className="order-2 space-y-0">
      <EncabezadoSeccion
        icono={<FileText className="h-3 w-3" />}
        titulo="2. Documento y responsable"
        tone={{
          chip: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
          texto: "text-sky-700 dark:text-sky-400",
        }}
      />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
        <div className="space-y-1 md:col-span-4">
          <Label className="text-xs font-semibold text-muted-foreground">
            Fecha *
          </Label>
          <Input
            name="fecha"
            type="date"
            required
            value={campos.fecha}
            onChange={(e) => setCampo("fecha", e.target.value)}
            className="h-8"
          />
        </div>
        <div className="space-y-1 md:col-span-4">
          <Label className="text-xs font-semibold text-muted-foreground">
            Serie
          </Label>
          <Input
            name="serie"
            placeholder="Ej: E001"
            value={campos.serie}
            onChange={(e) => setCampo("serie", e.target.value)}
            className="h-8"
          />
        </div>
        <div className="space-y-1 md:col-span-4">
          <Label className="text-xs font-semibold text-muted-foreground">
            Número
          </Label>
          <Input
            name="numero"
            placeholder="Ej: 1852"
            value={campos.numero}
            onChange={(e) => setCampo("numero", e.target.value)}
            className="h-8"
          />
        </div>
        <div className="space-y-1 md:col-span-4">
          <Label className="text-xs font-semibold text-muted-foreground">
            Observación (Área)
          </Label>
          <Input
            name="observacion"
            placeholder="Ej: Almacén PT / Área Tricho"
            value={campos.observacion}
            onChange={(e) => setCampo("observacion", e.target.value)}
            className="h-8"
          />
        </div>
        <div className="space-y-1 md:col-span-8">
          <Label className="text-xs font-semibold text-muted-foreground">
            Responsable
          </Label>
          <Input
            name="responsableDespacho"
            placeholder="Ej: YOBER GARCIA"
            value={campos.responsableDespacho}
            onChange={(e) => setCampo("responsableDespacho", e.target.value)}
            className="h-8"
          />
        </div>
      </div>
    </section>
  )
}

export function SeccionOperacionCantidad({ form }: { form: ProductoTerminadoForm }) {
  const { tipo, setTipo, resolverTipoOperacionId, tipoOperacionIdRef } = form

  const cambiarTipo = (v: string) => {
    const tipoMov: TipoMovimientoPT = v === "SALIDA" ? "SALIDA" : "ENTRADA"
    setTipo(tipoMov)
    tipoOperacionIdRef.current = resolverTipoOperacionId(tipoMov)
  }

  return (
    <section className="order-3 space-y-3">
      <EncabezadoSeccion
        icono={<Layers className="h-3 w-3" />}
        titulo="3. Operación y cantidad"
        tone={{
          chip: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
          texto: "text-amber-700 dark:text-amber-400",
        }}
      />
      <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-3">
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-muted-foreground">
            Tipo de Operación *
          </Label>
          <RadioGroup
            value={tipo === "SALIDA" ? "SALIDA" : "INGRESO"}
            onValueChange={cambiarTipo}
            className="flex items-center gap-3 pt-1">
            <div className="flex cursor-pointer items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 transition-colors hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/50 dark:hover:bg-emerald-950">
              <RadioGroupItem value="INGRESO" id="pt-op-ingreso" />
              <Label
                htmlFor="pt-op-ingreso"
                className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <ArrowDownCircle className="h-3.5 w-3.5" />
                INGRESO
              </Label>
            </div>
            <div className="flex cursor-pointer items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 transition-colors hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/50 dark:hover:bg-rose-950">
              <RadioGroupItem value="SALIDA" id="pt-op-salida" />
              <Label
                htmlFor="pt-op-salida"
                className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-red-500 dark:text-red-400">
                <ArrowUpCircle className="h-3.5 w-3.5" />
                SALIDA
              </Label>
            </div>
          </RadioGroup>
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-muted-foreground">
            Cantidad (CAN) *
          </Label>
          <Input
            name="cantidad"
            type="number"
            min="0.01"
            step="0.01"
            required
            value={form.cantidad}
            onChange={(e) => form.setCantidad(e.target.value)}
            placeholder="0"
            className="h-8 text-xs font-semibold"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-muted-foreground">
            Costo Unitario (S/)
          </Label>
          <Input
            name="costoUnitario"
            type="number"
            min="0"
            step="0.01"
            value={form.costoUnitario}
            onChange={(e) => form.setCostoUnitario(e.target.value)}
            placeholder="0.00"
            className="h-8 text-xs font-semibold"
          />
        </div>
      </div>
    </section>
  )
}

export function SeccionDestinoComprobante({ form }: { form: ProductoTerminadoForm }) {
  const { motivo, setMotivo, ingCampo, setIngCampo, campos, setCampo } = form

  return (
    <section className="order-4 space-y-3">
      <EncabezadoSeccion
        icono={<FileText className="h-3 w-3" />}
        titulo="4. Destino y comprobante"
        tone={{
          chip: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
          texto: "text-rose-700 dark:text-rose-400",
        }}
      />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
        <div className="md:col-span-3 space-y-1">
          <Label className="text-xs font-semibold text-muted-foreground">
            Motivo de Salida
          </Label>
          <Select value={motivo} onValueChange={(v) => setMotivo(v ?? "seleccionar")}>
            <SelectTrigger className="h-8 w-full">
              <SelectValue placeholder="Seleccionar motivo..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="seleccionar" className="text-xs">
                Seleccionar
              </SelectItem>
              <SelectItem value="PRODUCCION" className="text-xs">
                Producción
              </SelectItem>
              <SelectItem value="VENTA" className="text-xs">
                Venta
              </SelectItem>
              <SelectItem value="ENSAYO" className="text-xs">
                Ensayo
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2 space-y-1">
          <Label className="text-xs font-semibold text-muted-foreground">
            Factura / Guía
          </Label>
          <Input
            name="facturaGuia"
            placeholder="Ej: E001-1851"
            value={campos.facturaGuia}
            onChange={(e) => setCampo("facturaGuia", e.target.value)}
            className="h-8 text-xs"
          />
        </div>
        <div className="md:col-span-2 space-y-1">
          <Label className="text-xs font-semibold text-muted-foreground">
            Ing. de Campo
          </Label>
          <Select
            value={ingCampo}
            onValueChange={(v) => setIngCampo(v ?? "seleccionar")}>
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="seleccionar" className="text-xs">
                Seleccionar
              </SelectItem>
              <SelectItem value="NO" className="text-xs">
                NO
              </SelectItem>
              <SelectItem value="SI" className="text-xs">
                SI
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-5 space-y-1">
          <Label className="text-xs font-semibold text-muted-foreground">
            Empresa
          </Label>
          <Input
            name="empresaDestino"
            placeholder="Ej: ALTERNATIVAS GLOBALES K & G S.A."
            value={campos.empresaDestino}
            onChange={(e) => setCampo("empresaDestino", e.target.value)}
            className="h-8 text-xs"
          />
        </div>
      </div>
    </section>
  )
}
