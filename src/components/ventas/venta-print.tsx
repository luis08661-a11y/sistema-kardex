"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Printer, Loader2, FileDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  formatearMoneda,
  formatearFechaLocal,
  TIPO_COMPROBANTE_LABEL,
  TIPO_DOCUMENTO_LABEL,
  FORMA_PAGO_LABEL,
  METODO_PAGO_LABEL,
  type VentaParaImprimir,
  type TipoComprobante,
  type TipoDocumento,
  type FormaPago,
  type MetodoPago,
} from "@/components/ventas/types";
import { exportarPdfVentaA5 } from "@/components/ventas/venta-export";

interface Props {
  venta: VentaParaImprimir | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cargando?: boolean;
}

export function VentaPrint({ venta, open, onOpenChange, cargando }: Props) {
  const [descargando, setDescargando] = useState(false);

  const imprimir = () => {
    window.print();
  };

  const descargarA5 = async () => {
    if (!venta || descargando) return;
    setDescargando(true);
    try {
      await exportarPdfVentaA5(venta);
    } finally {
      setDescargando(false);
    }
  };

  return (
    <>
      <style>{`@media print {
        body > * { display: none !important; }
        #print-area { display: block !important; position: absolute; left: 0; top: 0; width: 100%; padding: 6mm; }
        #print-area, #print-area * { visibility: visible !important; }
      }
      @page { margin: 8mm; }`}</style>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg! flex max-h-[65vh] flex-col overflow-hidden">
          {!cargando && venta && (
            <>
              <DialogHeader className="shrink-0 print:hidden">
                <DialogTitle>Vista previa del comprobante (A5)</DialogTitle>
              </DialogHeader>
              <div className="min-h-0 flex-1 overflow-y-auto bg-slate-100">
                <div className="mx-auto w-full max-w-md bg-white p-6 text-slate-900 *:[&_*]:text-slate-900">
                  <Documento venta={venta} />
                </div>
              </div>
              <div className="shrink-0 print:hidden">
                <div className="flex items-center justify-end gap-2 border-t bg-transparent px-0 pt-2 pb-0">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cerrar
                  </Button>
                  <Button
                    disabled={descargando}
                    onClick={() => void descargarA5()}
                    className="gap-1.5 bg-rose-500 text-white hover:bg-rose-600">
                    {descargando ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <FileDown className="size-4" />
                    )}
                    Descargar PDF A5
                  </Button>
                  <Button onClick={imprimir} className="gap-2">
                    <Printer className="size-4" />
                    Imprimir
                  </Button>
                </div>
              </div>
            </>
          )}
          {cargando && (
            <div className="flex h-40 items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Cargando comprobante...
            </div>
          )}
        </DialogContent>
      </Dialog>
      {venta &&
        typeof document !== "undefined" &&
        createPortal(
          <div id="print-area" className="hidden bg-white text-slate-900">
            <Documento venta={venta} />
          </div>,
          document.body,
        )}
    </>
  );
}

function Documento({ venta }: { venta: VentaParaImprimir }) {
  const tipo = venta.tipoComprobante as TipoComprobante;

  return (
    <div data-venta-documento className="relative space-y-4 text-sm">
      <div className="border-b border-slate-300 pb-3 text-center">
        <div className="text-lg font-bold">
          {venta.empresa?.razonSocial || "Empresa"}
        </div>
        <div className="font-mono text-xs">
          RUC: {venta.empresa?.ruc || "—"}
        </div>
        <div className="mt-2 inline-block rounded border border-slate-400 px-4 py-0.5 text-sm font-bold tracking-widest uppercase">
          {TIPO_COMPROBANTE_LABEL[tipo]}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 font-mono text-xs">
        <div>
          <div className="text-slate-500">Serie</div>
          <div className="font-semibold">{venta.serie}</div>
        </div>
        <div>
          <div className="text-slate-500">Número</div>
          <div className="font-semibold">
            {String(venta.numero).padStart(6, "0")}
          </div>
        </div>
        <div>
          <div className="text-slate-500">Fecha</div>
          <div className="font-semibold">
            {formatearFechaLocal(venta.fecha)}
          </div>
        </div>
      </div>

      <div className="rounded border border-slate-300 p-3">
        <div className="mb-1 font-semibold uppercase tracking-wide text-slate-500">
          Cliente
        </div>
        {venta.cliente ? (
          <div className="space-y-0.5">
            <div className="font-semibold">{venta.cliente.razonSocial}</div>
            <div className="font-mono text-xs">
              {
                TIPO_DOCUMENTO_LABEL[
                  venta.cliente.tipoDocumento as TipoDocumento
                ]
              }{" "}
              · {venta.cliente.numeroDocumento}
            </div>
            {venta.cliente.direccion && (
              <div className="text-xs">{venta.cliente.direccion}</div>
            )}
          </div>
        ) : (
          <div className="text-xs">Consumidor final</div>
        )}
      </div>

      <div>
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-400 text-left">
              <th className="py-1 pr-2">Producto</th>
              <th className="py-1 pr-2 text-right">Cant.</th>
              <th className="py-1 pr-2 text-right">P. Unit.</th>
              <th className="py-1 text-right">Importe</th>
            </tr>
          </thead>
          <tbody>
            {venta.detalles.map(d => (
              <tr
                key={
                  d.id ??
                  `${d.codigo}-${d.descripcion}-${d.precioUnitario}-${d.cantidad}`
                }
                className="border-b border-slate-200">
                <td className="py-1 pr-2">
                  <div className="font-medium">{d.descripcion}</div>
                  <div className="font-mono text-[10px] text-slate-500">
                    {d.codigo}
                  </div>
                </td>
                <td className="py-1 pr-2 text-right tabular-nums">
                  {d.cantidad}
                </td>
                <td className="py-1 pr-2 text-right tabular-nums">
                  {formatearMoneda(d.precioUnitario)}
                </td>
                <td className="py-1 text-right font-medium tabular-nums">
                  {formatearMoneda(d.importe)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ml-auto w-56 space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Subtotal</span>
          <span className="tabular-nums">
            {formatearMoneda(venta.subtotal)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">IGV (18%)</span>
          <span className="tabular-nums">{formatearMoneda(venta.igv)}</span>
        </div>
        <div className="flex justify-between border-t border-slate-400 pt-1 text-base font-bold">
          <span>Total</span>
          <span className="tabular-nums">{formatearMoneda(venta.total)}</span>
        </div>
      </div>

      <div className="flex justify-between border-t border-slate-300 pt-2 font-mono text-xs text-slate-600">
        <span>{FORMA_PAGO_LABEL[venta.formaPago as FormaPago]}</span>
        <span>{METODO_PAGO_LABEL[venta.metodoPago as MetodoPago]}</span>
      </div>
      {venta.estado === "ANULADA" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rotate-[-12deg] border-[5px] border-red-600 px-6 py-2 text-3xl font-black tracking-widest text-red-600 uppercase opacity-70">
            ANULADA
          </div>
        </div>
      )}
    </div>
  );
}
