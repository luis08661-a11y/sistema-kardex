"use client";

import { Minus, Plus, Trash2, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  formatearMoneda,
  type LineaDetalle,
} from "@/components/ventas/types";

interface Props {
  lineas: LineaDetalle[];
  onChangeCantidad: (productoId: string, cantidad: number) => void;
  onChangePrecio: (productoId: string, precio: number) => void;
  onIncrementar: (productoId: string) => void;
  onDecrementar: (productoId: string) => void;
  onEliminar: (productoId: string) => void;
}

export function VentaDetalleTable({
  lineas,
  onChangeCantidad,
  onChangePrecio,
  onIncrementar,
  onDecrementar,
  onEliminar,
}: Props) {
  const POR_PAGINA = 6;
  const [pagina, setPagina] = useState(0);
  const totalPaginas = Math.max(1, Math.ceil(lineas.length / POR_PAGINA));
  const paginaSegura = Math.min(pagina, totalPaginas - 1);
  const lineasVisibles = lineas.slice(
    paginaSegura * POR_PAGINA,
    (paginaSegura + 1) * POR_PAGINA,
  );

  if (lineas.length === 0) {
    return (
      <div className="flex h-56 flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/20 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
          <ShoppingCart className="h-7 w-7 text-muted-foreground/70" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">No hay productos agregados</p>
          <p className="text-xs text-muted-foreground">
            Busca un producto arriba o abre el catálogo para comenzar a cotizar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Producto
            </th>
            <th className="px-2 py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Precio U
            </th>
            <th className="px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Cantidad
            </th>
            <th className="px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Importe
            </th>
            <th className="px-2 py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Acción
            </th>
          </tr>
        </thead>
        <tbody>
          {lineasVisibles.map((l) => (
            <tr
              key={l.productoId}
              className="group border-b transition-colors last:border-0 hover:bg-muted/20"
            >
              <td className="w-[160px] max-w-[160px] px-3 py-2">
                <span className="block truncate font-medium" title={l.descripcion}>{l.descripcion}</span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {l.codigo} · {l.unidadMedida}
                </span>
              </td>
              <td className="px-2 py-2">
                <div className="flex items-center justify-end gap-1">
                  <span className="text-muted-foreground">S/</span>
                  <Input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.01"
                    className="h-7 w-24 text-right"
                    value={l.precioUnitario}
                    onChange={(e) =>
                      onChangePrecio(l.productoId, Number(e.target.value) || 0)
                    }
                  />
                </div>
              </td>
              <td className="px-2 py-2">
                <div className="flex items-center justify-center gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-xs"
                    onClick={() => onDecrementar(l.productoId)}
                    aria-label="Disminuir cantidad"
                  >
                    <Minus />
                  </Button>
                  <Input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.001"
                    className="h-7 w-16 text-center"
                    value={l.cantidad}
                    onChange={(e) =>
                      onChangeCantidad(l.productoId, Number(e.target.value) || 0)
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-xs"
                    onClick={() => onIncrementar(l.productoId)}
                    aria-label="Aumentar cantidad"
                  >
                    <Plus />
                  </Button>
                </div>
              </td>
              <td className="px-3 py-2 text-right font-semibold tabular-nums">
                {formatearMoneda(l.importe)}
              </td>
              <td className="px-2 py-2 text-right">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onEliminar(l.productoId)}
                  aria-label="Eliminar producto"
                  className="text-muted-foreground hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t bg-muted/30 text-sm">
            <td colSpan={3} className="px-3 py-2 text-xs text-muted-foreground">
              {lineas.length} producto{lineas.length !== 1 ? "s" : ""}
            </td>
            <td className="px-3 py-2 text-right font-bold tabular-nums">
              {formatearMoneda(
                lineas.reduce((acc, l) => acc + (l.importe || 0), 0),
              )}
            </td>
            <td />
          </tr>
        </tfoot>
      </table>

      {lineas.length > POR_PAGINA && (
        <div className="flex items-center justify-between border-t bg-muted/40 px-3 py-1.5">
          <span className="text-[11px] text-muted-foreground tabular-nums">
            {paginaSegura * POR_PAGINA + 1}–
            {Math.min(
              (paginaSegura + 1) * POR_PAGINA,
              lineas.length,
            )}{" "}
            de {lineas.length} productos
          </span>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon-xs"
              disabled={paginaSegura === 0}
              onClick={() => setPagina(p => Math.max(0, p - 1))}
              aria-label="Página anterior"
            >
              <ChevronLeft />
            </Button>
            <span className="px-1 text-[11px] font-semibold tabular-nums text-muted-foreground">
              {paginaSegura + 1} / {totalPaginas}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon-xs"
              disabled={paginaSegura + 1 === totalPaginas}
              onClick={() => setPagina(p => Math.min(totalPaginas - 1, p + 1))}
              aria-label="Página siguiente"
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}