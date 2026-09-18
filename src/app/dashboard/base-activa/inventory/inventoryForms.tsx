"use client";

import React, { useState, useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxCollection,
  ComboboxEmpty,
} from "@/components/ui/combobox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Save, Loader2, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { toast } from "sonner";

import {
  crearRegistroInventario,
  actualizarRegistroInventario,
  type InventoryState,
} from "@/actions/inventory.actions";
import type { ProductoConLotes } from "./kardex-table-container";

interface ContextoForm {
  periodos: { id: string; anio: number }[];
  establecimientos: { id: string; nombre: string }[];
  productos: { id: string; codigo: string; descripcion: string }[];
  almacenamientos: { id: string; nombre: string }[];
  operaciones: { id: string; codigo: string; nombre: string }[];
}

interface InitialData {
  productoId: string;
  loteId: string;
  periodoId?: string;
  establecimientoId?: string;
  almacenamientoId?: string;
  fecha: string;
  tipoOperacionId: string;
  tipoMovimiento: string;
  unidades: string;
  pesoUnitario: string;
  pesoTotal: string;
  observacion: string;
  responsable: string;
  formulacion: string;
  responsableFormulacion: string;
  cantidadProductoFormulado: string;
  almacenamientoNombre: string;
  costoUnitarioKg: string;
}

interface InventoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movimientoId?: string;
  productos?: ProductoConLotes[];
  contexto?: ContextoForm;
  initialData?: InitialData;
  onGuardado?: () => void;
}

const initialState: InventoryState = { success: false, message: "" };

export function InventoryForm({
  open,
  onOpenChange,
  movimientoId,
  productos = [],
  contexto,
  initialData,
  onGuardado,
}: InventoryFormProps) {
  const router = useRouter();
  const isEditing = Boolean(movimientoId);

  const action = isEditing
    ? actualizarRegistroInventario
    : crearRegistroInventario;

  const [state, formAction, pending] = useActionState(action, initialState);

  const [productoId, setProductoId] = useState(initialData?.productoId ?? "");
  const [loteId, setLoteId] = useState(initialData?.loteId ?? "");
  const [periodoId, setPeriodoId] = useState(
    initialData?.periodoId ?? contexto?.periodos[0]?.id ?? "",
  );
  const [establecimientoId, setEstablecimientoId] = useState(
    initialData?.establecimientoId ?? contexto?.establecimientos[0]?.id ?? "",
  );
  const [almacenamientoId, setAlmacenamientoId] = useState(
    initialData?.almacenamientoId ?? "",
  );
  const [tipoOperacionId, setTipoOperacionId] = useState(
    initialData?.tipoOperacionId ?? "",
  );
  const [tipoMovimiento, setTipoMovimiento] = useState(
    initialData?.tipoMovimiento ?? "ENTRADA",
  );
  const [unidades, setUnidades] = useState<number | "">(
    initialData?.unidades ? Number(initialData.unidades) : "",
  );
  const [pesoUnitario, setPesoUnitario] = useState<number | "">(
    initialData?.pesoUnitario ? Number(initialData.pesoUnitario) : "",
  );

  const successHandledRef = useRef(false);

  useEffect(() => {
    successHandledRef.current = false;
  }, [open]);

  const productoSeleccionado = productos.find((p) => p.id === productoId);
  const lotesDelProducto = productoSeleccionado?.lotesBase ?? [];
  const abrevCodigo = productoSeleccionado?.codigo ?? "";
  const operacionSeleccionada = contexto?.operaciones.find(
    (op) => op.id === tipoOperacionId,
  );
  const esInventarioInicial = operacionSeleccionada?.codigo === "INVENTARIO_INICIAL";

  const pesoTotal =
    typeof unidades === "number" && typeof pesoUnitario === "number"
      ? (unidades * pesoUnitario).toFixed(2)
      : "0.00";

  useEffect(() => {
    if (successHandledRef.current) return;

    if (state.success) {
      successHandledRef.current = true;
      toast.success(isEditing ? "Registro actualizado" : "Registro creado");
      router.refresh();
      onOpenChange(false);
      onGuardado?.();
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, isEditing, onOpenChange, onGuardado, router]);

  useEffect(() => {
    if (lotesDelProducto.length > 0) {
      setLoteId(lotesDelProducto[0].id);
    }
  }, [lotesDelProducto]);

  const handleSubmit = (formData: FormData) => {
    formData.set("productoId", productoId);
    formData.set("loteId", loteId);
    formData.set("periodoId", periodoId);
    formData.set("establecimientoId", establecimientoId);
    formData.set("almacenamientoId", almacenamientoId);
    formData.set("tipoOperacionId", tipoOperacionId);
    formData.set("tipoMovimiento", esInventarioInicial ? "ENTRADA" : tipoMovimiento);
    formData.set("pesoTotal", pesoTotal);
    formData.set("unidades", String(unidades ?? ""));
    formData.set("pesoUnitario", String(pesoUnitario ?? ""));

    const up = (v: string) => (v ? v.toUpperCase() : v);
    formData.set("observacion", up(String(formData.get("observacion") ?? "")));
    formData.set("responsable", up(String(formData.get("responsable") ?? "")));
    formData.set("formulacion", up(String(formData.get("formulacion") ?? "")));
    formData.set(
      "responsableFormulacion",
      up(String(formData.get("responsableFormulacion") ?? "")),
    );
    formData.set(
      "almacenamientoNombre",
      up(String(formData.get("almacenamientoNombre") ?? "")),
    );

    if (isEditing && movimientoId) {
      formData.set("movimientoId", movimientoId);
    }

    formAction(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        key={movimientoId ?? "new"}
        className="!max-w-[850px] w-full p-0 gap-0 overflow-hidden bg-card rounded-xl border-none shadow-2xl">
        <DialogHeader className="bg-primary text-primary-foreground px-6 py-4 flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2 text-primary-foreground">
            <span className="h-2.5 w-2.5 rounded-full bg-primary-foreground/50" />
            {isEditing ? "Editar Movimiento" : "Nuevo Registro de Inventario"}
          </DialogTitle>
        </DialogHeader>

        <form action={handleSubmit}>
          {isEditing && (
            <input type="hidden" name="movimientoId" value={movimientoId} />
          )}

          <div className="p-6 space-y-5 max-h-[85vh] overflow-y-auto text-xs text-foreground">
            {/* SECCION 1 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-border pb-1.5">
                <span className="h-5 w-5 rounded bg-primary/10 flex items-center justify-center">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                </span>
                <h3 className="font-bold text-foreground uppercase text-xs tracking-wide">
                  1. Detalle del Registro
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-5 space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    Producto
                  </Label>
                  <Combobox
                    value={productoId}
                    items={productos.map((p) => p.id)}
                    onValueChange={(v) => {
                      setProductoId(v ?? "");
                      setLoteId("");
                    }}
                    itemToStringLabel={(v) => {
                      const p = productos.find((x) => x.id === v);
                      return p ? `${p.codigo} — ${p.descripcion}` : "";
                    }}>
                    <ComboboxInput
                      placeholder="Buscar producto Base Activa..."
                      className="h-8"
                    />
                    <ComboboxContent>
                      <ComboboxList>
                        <ComboboxCollection>
                          {(pId) => {
                            const p = productos.find((x) => x.id === pId);
                            return p ? (
                              <ComboboxItem key={p.id} value={p.id}>
                                {p.descripcion}
                              </ComboboxItem>
                            ) : null;
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
                  <Select value={periodoId} onValueChange={(v) => setPeriodoId(v ?? "")}>
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
                    defaultValue={
                      initialData?.fecha ??
                      (() => {
                        const d = new Date();
                        const m = String(d.getMonth() + 1).padStart(2, "0");
                        const day = String(d.getDate()).padStart(2, "0");
                        return `${d.getFullYear()}-${m}-${day}`;
                      })()
                    }
                    className="h-8"
                  />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    N° Lote
                  </Label>
                  <Select
                    value={loteId}
                    onValueChange={(v) => setLoteId(v ?? "")}
                    itemToStringLabel={(v) =>
                      lotesDelProducto.find((l) => l.id === v)?.codigo ?? ""
                    }
                  >
                    <SelectTrigger className="h-8 w-full bg-indigo-600 dark:bg-indigo-700 text-white text-xs font-mono font-bold hover:bg-indigo-700 dark:hover:bg-indigo-600">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {lotesDelProducto.map((l) => (
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
                    placeholder="—"
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

            {/* SECCION 2 */}
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
                    onValueChange={(v) => {
                      setTipoOperacionId(v ?? "");
                      const nuevaOp = contexto?.operaciones.find((op) => op.id === v);
                      if (nuevaOp?.codigo === "INVENTARIO_INICIAL") {
                        setTipoMovimiento("ENTRADA");
                      }
                    }}>
                    <SelectTrigger className="h-8 w-full">
                      {contexto?.operaciones.find((op) => op.id === tipoOperacionId) ? (
                        <span>
                          {/* {contexto?.operaciones.find((op) => op.id === tipoOperacionId)?.codigo} —{" "} */}
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
                    onValueChange={setTipoMovimiento}
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

            {/* SECCION 3 */}
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
                      setUnidades(e.target.value ? Number(e.target.value) : "")
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
                      setPesoUnitario(
                        e.target.value ? Number(e.target.value) : "",
                      )
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

            {/* SECCION 4 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-border pb-1.5">
                <span className="h-5 w-5 rounded bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                  <span className="h-2 w-2 rounded-full bg-violet-500" />
                </span>
                <h3 className="font-bold text-foreground uppercase text-xs tracking-wide">
                  4. Registro de Cantidad Final
                </h3>
              </div>

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
          </div>

          {/* FOOTER */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-muted/50">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
              className="px-6">
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={pending}
              className="px-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
              {pending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isEditing ? "Actualizar Registro" : "Guardar Registro"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}