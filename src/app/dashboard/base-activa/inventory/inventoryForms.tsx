"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";

import {
  SeccionDetalleRegistro,
  SeccionTipoOperacion,
  SeccionDatosMercaderia,
  SeccionCantidadFinal,
} from "./inventory-form-secciones";
import { useInventoryForm } from "./use-inventory-form";
import type { InventoryFormProps } from "./inventory-form-types";
import { PRODUCTOS_VACIOS } from "./inventory-form-types";

export type { ProductoConLotes } from "./kardex-types";

export function InventoryForm({
  open,
  onOpenChange,
  movimientoId,
  productos = PRODUCTOS_VACIOS,
  contexto,
  initialData,
  onGuardado,
}: InventoryFormProps) {
  const form = useInventoryForm({
    open,
    onOpenChange,
    movimientoId,
    productos,
    contexto,
    initialData,
    onGuardado,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        key={movimientoId ?? "new"}
        className="!max-w-[850px] w-full p-0 gap-0 overflow-hidden bg-card rounded-xl border-none shadow-2xl">
        <DialogHeader className="bg-primary text-primary-foreground px-6 py-4 flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2 text-primary-foreground">
            <span className="h-2.5 w-2.5 rounded-full bg-primary-foreground/50" />
            {form.isEditing ? "Editar Movimiento" : "Nuevo Registro de Inventario"}
          </DialogTitle>
        </DialogHeader>

        <form action={form.handleSubmit}>
          {form.isEditing && (
            <input type="hidden" name="movimientoId" value={movimientoId} />
          )}

          <div className="p-6 space-y-5 max-h-[85vh] overflow-y-auto text-xs text-foreground">
            <SeccionDetalleRegistro
              productos={productos}
              productoId={form.productoId}
              onProductoChange={form.cambiarProducto}
              contexto={contexto}
              periodoId={form.periodoId}
              onPeriodoChange={form.setPeriodoId}
              fechaDefault={initialData?.fecha ?? form.hoyInput}
              loteId={form.loteId}
              onLoteChange={form.setLoteId}
              lotes={form.lotesDelProducto}
              abrevCodigo={form.abrevCodigo}
              initialData={initialData}
            />

            <SeccionTipoOperacion
              contexto={contexto}
              tipoOperacionId={form.tipoOperacionId}
              onOperacionChange={form.cambiarOperacion}
              tipoMovimiento={form.tipoMovimiento}
              onTipoMovimientoChange={form.setTipoMovimiento}
              esInventarioInicial={form.esInventarioInicial}
            />

            <SeccionDatosMercaderia
              unidades={form.unidades}
              onUnidadesChange={form.setUnidades}
              pesoUnitario={form.pesoUnitario}
              onPesoUnitarioChange={form.setPesoUnitario}
              pesoTotal={form.pesoTotal}
            />

            <SeccionCantidadFinal initialData={initialData} />
          </div>

          {/* FOOTER */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-muted/50">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={form.pending}
              className="px-6">
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={form.pending}
              className="px-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
              {form.pending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {form.isEditing ? "Actualizar Registro" : "Guardar Registro"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
