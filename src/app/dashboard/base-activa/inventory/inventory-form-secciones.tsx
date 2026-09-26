"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
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
  ComboboxCollection,
  ComboboxEmpty,
} from "@/components/ui/combobox"
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import type { ContextoForm, InitialData } from "./inventory-form-types"
import type { ProductoConLotes } from "./kardex-types"

type TituloProps = {
  n: string
  titulo: string
  tono?: "primary" | "violet"
}

export function SeccionTitulo({ n, titulo, tono = "primary" }: TituloProps) {
  const punto =
    tono === "violet"
      ? "bg-violet-100 dark:bg-violet-900/30"
      : "bg-primary/10"
  const circulo = tono === "violet" ? "bg-violet-500" : "bg-primary"

  return (
    <div className="flex items-center gap-2 border-b border-border pb-1.5">
      <span className={`h-5 w-5 rounded ${punto} flex items-center justify-center`}>
        <span className={`h-2 w-2 rounded-full ${circulo}`} />
      </span>
      <h3 className="font-bold text-foreground uppercase text-xs tracking-wide">
        {n} {titulo}
      </h3>
    </div>
  )
}

type DetalleProps = {
  productos: ProductoConLotes[]
  productoId: string
  onProductoChange: (v: string) => void
  contexto?: ContextoForm
  periodoId: string
  onPeriodoChange: (v: string) => void
  fechaDefault: string
  loteId: string
  onLoteChange: (v: string) => void
  lotes: ProductoConLotes["lotesBase"]
  abrevCodigo: string
  initialData?: InitialData
}

export function SeccionDetalleRegistro({
  productos,
  productoId,
  onProductoChange,
  contexto,
  periodoId,
  onPeriodoChange,
  fechaDefault,
  loteId,
  onLoteChange,
  lotes,
  abrevCodigo,
  initialData,
}: DetalleProps) {
  return (
    <div className="space-y-3">
      <SeccionTitulo n="1." titulo="Detalle del Registro" />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-5 space-y-1">
          <Label className="text-xs font-semibold text-muted-foreground">
            Producto
          </Label>
          <Combobox
            value={productoId}
            items={productos.map((p) => p.id)}
            onValueChange={(v) => onProductoChange(v ?? "")}
            itemToStringLabel={(v) => {
              const p = productos.find((x) => x.id === v)
              return p ? `${p.codigo} - ${p.descripcion}` : ""
            }}>
            <ComboboxInput
              placeholder="Buscar producto Base Activa..."
              className="h-8"
            />
            <ComboboxContent>
              <ComboboxList>
                <ComboboxCollection>
                  {(pId) => {
                    const p = productos.find((x) => x.id === pId)
                    return p ? (
                      <ComboboxItem key={p.id} value={p.id}>
                        {p.descripcion}
                      </ComboboxItem>
                    ) : null
                  }}
                </ComboboxCollection>
                <ComboboxEmpty>No se encontró el producto.</ComboboxEmpty>
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
        <div className="md:col-span-2 space-y-1">
          <Label className="text-xs font-semibold text-muted-foreground">
            Período
          </Label>
          <Select value={periodoId} onValueChange={(v) => onPeriodoChange(v ?? "")}>
            <SelectTrigger className="h-8 w-full">
              {contexto?.periodos.find((p) => p.id === periodoId)?.anio ?? (
                <SelectValue placeholder="Seleccionar..." />
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {contexto?.periodos.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="text-xs">
                    {p.anio}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-3 space-y-1">
          <Label className="text-xs font-semibold text-muted-foreground">
            Fecha
          </Label>
          <Input
            type="date"
            name="fecha"
            defaultValue={fechaDefault}
            className="h-8"
          />
        </div>

        <div className="md:col-span-2 space-y-1">
          <Label className="text-xs font-semibold text-muted-foreground">
            N° Lote
          </Label>
          <Select
            value={loteId}
            onValueChange={(v) => onLoteChange(v ?? "")}
            itemToStringLabel={(v) => lotes.find((l) => l.id === v)?.codigo ?? ""}
          >
            <SelectTrigger className="h-8 w-full bg-indigo-600 dark:bg-indigo-700 text-white text-xs font-mono font-bold hover:bg-indigo-700 dark:hover:bg-indigo-600">
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {lotes.map((l) => (
                  <SelectItem key={l.id} value={l.id} className="text-xs font-mono">
                    {l.codigo}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* <div className="md:col-span-3 space-y-1">
          <Label className="text-xs font-semibold text-muted-foreground">
            Establecimiento
          </Label>
          <Select value={establecimientoId} onValueChange={(v) => setEstablecimientoId(v ?? "")}>
            <SelectTrigger className="h-8 w-full">
              {contexto?.establecimientos.find((e) => e.id === establecimientoId)?.nombre ?? (
                <SelectValue placeholder="Seleccionar..." />
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {contexto?.establecimientos.map((e) => (
                  <SelectItem key={e.id} value={e.id} className="text-xs">
                    {e.nombre}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div> */}

        {/* <div className="md:col-span-3 space-y-1">
          <Label className="text-xs font-semibold text-muted-foreground">
            Almacenamiento
          </Label>
          <Select value={almacenamientoId} onValueChange={(v) => setAlmacenamientoId(v ?? "")}>
            <SelectTrigger className="h-8 w-full">
              {contexto?.almacenamientos.find((a) => a.id === almacenamientoId)?.nombre ?? (
                <SelectValue placeholder="Sin asignar" />
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {contexto?.almacenamientos.map((a) => (
                  <SelectItem key={a.id} value={a.id} className="text-xs">
                    {a.nombre}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div> */}
        <div className="md:col-span-2 space-y-1">
          <Label className="text-xs font-semibold text-muted-foreground">
            Abrev. Código
          </Label>
          <Input
            value={abrevCodigo}
            readOnly
            placeholder="-"
            className="h-8 bg-muted uppercase font-mono text-xs font-semibold"
          />
        </div>

        <div className="md:col-span-4 space-y-1">
          <Label className="text-xs font-semibold text-muted-foreground">
            Observación
          </Label>
          <Input
            name="observacion"
            defaultValue={initialData?.observacion ?? ""}
            placeholder="CUARTO FRIO"
            className="h-8 bg-muted text-xs uppercase"
          />
        </div>

        <div className="md:col-span-6 space-y-1">
          <Label className="text-xs font-semibold text-muted-foreground">
            Responsable
          </Label>
          <Input
            name="responsable"
            defaultValue={initialData?.responsable ?? ""}
            placeholder="YOBER GARCIA CABRERA"
            className="h-8 bg-muted text-xs uppercase"
          />
        </div>
      </div>
    </div>
  )
}

type OperacionProps = {
  contexto?: ContextoForm
  tipoOperacionId: string
  onOperacionChange: (v: string) => void
  tipoMovimiento: string
  onTipoMovimientoChange: (v: string) => void
  esInventarioInicial: boolean
}

export function SeccionTipoOperacion({
  contexto,
  tipoOperacionId,
  onOperacionChange,
  tipoMovimiento,
  onTipoMovimientoChange,
  esInventarioInicial,
}: OperacionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 border-b border-border pb-1.5">
        <span className="h-5 w-5 rounded bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
        </span>
        <h3 className="font-bold text-foreground uppercase text-xs tracking-wide">
          2. Tipo de Operación (Tabla 12)
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        <div className="md:col-span-4 space-y-1">
          <Label className="text-xs font-semibold text-muted-foreground">
            Operación
          </Label>
          <Select
            value={tipoOperacionId}
            onValueChange={(v) => onOperacionChange(v ?? "")}>
            <SelectTrigger className="h-8 w-full">
              {contexto?.operaciones.find((op) => op.id === tipoOperacionId) ? (
                <span>
                  {/* {contexto?.operaciones.find((op) => op.id === tipoOperacionId)?.codigo} -{" "} */}
                  {contexto?.operaciones.find((op) => op.id === tipoOperacionId)?.nombre}
                </span>
              ) : (
                <SelectValue placeholder="Seleccionar operación..." />
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {contexto?.operaciones.map((op) => (
                  <SelectItem key={op.id} value={op.id} className="text-xs">
                    {op.nombre}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-4 space-y-1">
          <Label className="text-xs font-semibold text-muted-foreground">
            Tipo de Movimiento *
          </Label>
          {esInventarioInicial ? (
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-2">
                <span className="flex aspect-square size-4 shrink-0 items-center justify-center rounded-full border border-emerald-500 bg-emerald-500">
                  <span className="size-2 rounded-full bg-white" />
                </span>
                <Label
                  htmlFor="entrada"
                  className="font-semibold text-emerald-700 dark:text-emerald-400 cursor-not-allowed text-xs flex items-center gap-1.5">
                  <ArrowDownCircle className="h-3.5 w-3.5" />
                  ENTRADA
                </Label>
              </div>
              {/* <p className="mt-1.5 text-[11px] text-muted-foreground">
                El inventario inicial se registra en el saldo, no en las
                entradas del kardex.
              </p> */}
            </div>
          ) : (
            <RadioGroup
              value={tipoMovimiento}
              onValueChange={onTipoMovimientoChange}
              className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-2 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-2 cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-950 transition-colors">
                <RadioGroupItem value="ENTRADA" id="entrada" />
                <Label
                  htmlFor="entrada"
                  className="font-semibold text-emerald-700 dark:text-emerald-400 cursor-pointer text-xs flex items-center gap-1.5">
                  <ArrowDownCircle className="h-3.5 w-3.5" />
                  ENTRADA
                </Label>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/50 px-3 py-2 cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-950 transition-colors">
                <RadioGroupItem value="SALIDA" id="salida" />
                <Label
                  htmlFor="salida"
                  className="font-semibold text-red-500 dark:text-red-400 cursor-pointer text-xs flex items-center gap-1.5">
                  <ArrowUpCircle className="h-3.5 w-3.5" />
                  SALIDA
                </Label>
              </div>
            </RadioGroup>
          )}
        </div>
      </div>
    </div>
  )
}

type MercaderiaProps = {
  unidades: number | ""
  onUnidadesChange: (v: number | "") => void
  pesoUnitario: number | ""
  onPesoUnitarioChange: (v: number | "") => void
  pesoTotal: string
}

export function SeccionDatosMercaderia({
  unidades,
  onUnidadesChange,
  pesoUnitario,
  onPesoUnitarioChange,
  pesoTotal,
}: MercaderiaProps) {
  return (
    <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
      <div className="flex items-center gap-2">
        <span className="h-5 w-5 rounded bg-primary/10 flex items-center justify-center">
          <span className="h-2 w-2 rounded-full bg-primary" />
        </span>
        <h3 className="font-bold text-primary uppercase text-xs tracking-wide">
          3. Datos de Entrada de Mercadería
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-muted-foreground">
            Unidades (UND)
          </Label>
          <Input
            type="number"
            step="0.000001"
            value={unidades}
            onChange={(e) =>
              onUnidadesChange(e.target.value ? Number(e.target.value) : "")
            }
            placeholder="0"
            className="h-8 bg-card text-xs font-semibold"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-semibold text-muted-foreground">
            Peso Unitario (Kg)
          </Label>
          <Input
            type="number"
            step="0.000001"
            value={pesoUnitario}
            placeholder="2.5"
            onChange={(e) =>
              onPesoUnitarioChange(e.target.value ? Number(e.target.value) : "")
            }
            className="h-8 bg-card text-xs font-semibold"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-semibold text-muted-foreground">
            Peso Total (Kg)
          </Label>
          <Input
            value={pesoTotal}
            readOnly
            className="h-8 bg-primary/10 border-primary/30 font-bold text-primary text-xs"
          />
        </div>
      </div>
    </div>
  )
}

type CantidadFinalProps = {
  initialData?: InitialData
}

export function SeccionCantidadFinal({ initialData }: CantidadFinalProps) {
  return (
    <div className="space-y-3">
      <SeccionTitulo n="4." titulo="Registro de Cantidad Final" tono="violet" />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-3 space-y-1">
          <Label className="text-xs font-semibold text-muted-foreground">
            Motivo Salida / Formulación
          </Label>
          <Input
            name="formulacion"
            defaultValue={initialData?.formulacion ?? ""}
            placeholder="LOTE PRODUCCIÓN A"
            className="h-8 bg-muted text-xs uppercase"
          />
        </div>
        <div className=" md:col-span-4 space-y-1">
          <Label className="text-xs font-semibold text-muted-foreground">
            Responsable Formulación
          </Label>
          <Input
            name="responsableFormulacion"
            defaultValue={initialData?.responsableFormulacion ?? ""}
            placeholder="YOBER GARCIA CABRERA"
            className="h-8 bg-muted text-xs uppercase"
          />
        </div>

        <div className="md:col-span-2 space-y-1">
          <Label className="text-xs font-semibold text-muted-foreground">
            Cantidad Formulado
          </Label>
          <Input
            type="number"
            step="0.000001"
            name="cantidadProductoFormulado"
            defaultValue={initialData?.cantidadProductoFormulado ?? ""}
            placeholder="0.00"
            className="h-8 bg-muted text-xs"
          />
        </div>

        <div className=" md:col-span-3 space-y-1">
          <Label className="text-xs font-semibold text-muted-foreground">
            Almacenamiento
          </Label>
          <Input
            placeholder="ALMACEN"
            name="almacenamientoNombre"
            defaultValue={initialData?.almacenamientoNombre ?? ""}
            className="h-8 bg-muted text-xs uppercase"
          />
        </div>

        {/* <div className="space-y-1">
          <Label className="text-xs font-semibold text-muted-foreground">
            Costo Unitario / Kg
          </Label>
          <Input
            type="number"
            min="0"
            step="0.000001"
            name="costoUnitarioKg"
            defaultValue={initialData?.costoUnitarioKg ?? ""}
            placeholder="0.00"
            className="h-8 bg-muted text-xs"
          />
        </div> */}
      </div>
    </div>
  )
}
