"use client";

import { DialogoEliminarMovimientoPT } from "./dialogo-eliminar-movimiento-pt";
import { ProductoTerminadoFiltros } from "./producto-terminado-filtros";
import { ProductoTerminadoFormDialog } from "./producto-terminado-form-dialog";
import { ProductoTerminadoHeader } from "./producto-terminado-header";
import { ProductoTerminadoTabla } from "./producto-terminado-tabla";
import { useExportesKardexPT } from "./producto-terminado-export";
import { useKardexPTFiltros } from "./use-kardex-pt-filtros";
import { useProductoTerminadoForm } from "./use-producto-terminado-form";
import type { ProductoTerminadoData } from "./producto-terminado-types";

export function ProductoTerminadoModule({
  data,
}: {
  data: ProductoTerminadoData;
}) {
  const form = useProductoTerminadoForm(data);
  const filtros = useKardexPTFiltros(data.movimientos);
  const exportes = useExportesKardexPT(filtros.movimientosFiltrados);

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-3 md:py-4 px-4 lg:px-6">
          <ProductoTerminadoHeader
            resumen={data.resumen}
            onNuevo={() => form.openModal()}
          />

          <ProductoTerminadoFiltros productos={data.productos} filtros={filtros} />

          <ProductoTerminadoTabla
            movimientos={filtros.movimientosFiltrados}
            totales={filtros.totales}
            onEditar={form.openModal}
            onEliminar={form.setEliminando}
            onExportarExcel={exportes.exportarExcel}
            onExportarPDF={exportes.exportarPDF}
            onImprimir={exportes.imprimir}
          />
        </div>
      </div>

      <ProductoTerminadoFormDialog form={form} productos={data.productos} />

      <DialogoEliminarMovimientoPT
        eliminando={form.eliminando}
        isDeleting={form.isDeleting}
        onCancelar={() => form.setEliminando(null)}
        onConfirmar={form.confirmarEliminar}
      />
    </div>
  );
}
