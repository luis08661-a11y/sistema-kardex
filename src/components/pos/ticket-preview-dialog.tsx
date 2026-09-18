"use client";

import { useEffect, useState } from "react";
import { Printer, FileText, Download, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { VentaPosGuardadaDTO } from "@/lib/services/pos.service";
import { exportarPdfVenta } from "@/components/ventas/venta-export";
import {
  TIPO_COMPROBANTE_POS_CORTO,
  TIPO_DOCUMENTO_LABEL,
  FORMA_PAGO_LABEL,
  METODO_PAGO_LABEL,
  ventaPosParaImprimir,
  type TipoComprobantePos,
  type TipoDocumento,
  type FormaPago,
  type MetodoPago,
} from "@/components/pos/pos-types";
import { formatearMonedaSoles } from "@/lib/pos/calculations";

interface Props {
  venta: VentaPosGuardadaDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TicketPreviewDialog({ venta, open, onOpenChange }: Props) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open) setPdfUrl(null);
  }, [open]);

  useEffect(
    () => () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    },
    [pdfUrl],
  );

  const imprimir = () => window.print();
  const verPdf = async () => {
    if (!venta) return;
    const url = await exportarPdfVenta(ventaPosParaImprimir(venta), {
      preview: true,
    });
    if (url) setPdfUrl(url);
  };
  const descargarPdf = () => {
    if (venta) void exportarPdfVenta(ventaPosParaImprimir(venta));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg! print:static print:max-w-none print:w-full print:translate-x-0 print:translate-y-0 print:rounded-none print:ring-0">
        <style>{`@media print {
          [data-slot="dialog-overlay"] { display: none !important; }
          [data-slot="dialog-content"] {
            position: static !important;
            transform: none !important;
            width: auto !important;
            max-width: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
          }
          .pos-ticket { width: 80mm !important; max-width: 80mm !important; }
        }`}</style>
        {!venta && (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            Cargando comprobante...
          </div>
        )}
        {venta && (
          <>
            {pdfUrl ? (
              <div className="space-y-3">
                <DialogHeader className="flex-row items-center justify-between gap-2 print:hidden">
                  <DialogTitle>Vista previa PDF</DialogTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={descargarPdf}
                      className="gap-1.5">
                      <Download className="size-3.5" />
                      Descargar PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPdfUrl(null)}
                      className="gap-1.5">
                      <RotateCcw className="size-3.5" />
                      Volver al ticket
                    </Button>
                  </div>
                </DialogHeader>
                <iframe
                  src={pdfUrl}
                  title="Vista previa PDF"
                  className="h-[68vh] w-full rounded border bg-white"
                />
              </div>
            ) : (
              <>
                <DialogHeader className="print:hidden">
                  <DialogTitle>Vista previa del comprobante</DialogTitle>
                </DialogHeader>
                <div className="pos-ticket mx-auto w-full max-w-[80mm] rounded bg-white px-3 py-4 font-mono text-[11px] text-slate-900 *:[&_*]:text-slate-900">
              <div className="text-center">
                <div className="text-sm font-bold uppercase">
                  {venta.empresa.razonSocial}
                </div>
                <div>RUC: {venta.empresa.ruc}</div>
                {venta.empresa.direccion && <div>{venta.empresa.direccion}</div>}
                <div className="mt-2 inline-block border border-slate-400 px-4 py-0.5 text-sm font-bold tracking-[0.2em]">
                  {TIPO_COMPROBANTE_POS_CORTO[venta.tipoComprobante as TipoComprobantePos]}
                </div>
              </div>

              <div className="mt-2 border-t border-dashed border-slate-400 pt-2">
                <div className="flex justify-between">
                  <span>Serie</span>
                  <span className="font-bold">{venta.serie}</span>
                </div>
                <div className="flex justify-between">
                  <span>Número</span>
                  <span className="font-bold">{String(venta.numero).padStart(6, "0")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fecha</span>
                  <span>
                    {new Date(venta.fecha).toLocaleString("es-PE", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              <div className="mt-2 border-t border-dashed border-slate-400 pt-2">
                <div className="font-bold uppercase">Cliente</div>
                <div>{venta.cliente?.razonSocial ?? "CONSUMIDOR FINAL"}</div>
                {venta.cliente && (
                  <div>
                    {TIPO_DOCUMENTO_LABEL[venta.cliente.tipoDocumento as TipoDocumento]} ·{" "}
                    {venta.cliente.numeroDocumento}
                  </div>
                )}
                {venta.cliente?.direccion && <div>{venta.cliente.direccion}</div>}
              </div>

              <div className="mt-2 border-t border-dashed border-slate-400 pt-2">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-400 text-left">
                      <th className="pb-1">Producto</th>
                      <th className="pb-1 text-center">Cant</th>
                      <th className="pb-1 text-right">P.Unit</th>
                      <th className="pb-1 text-right">Importe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {venta.detalles.map((d, i) => (
                      <tr key={i}>
                        <td>
                          <div className="font-bold">{d.descripcion}</div>
                          <div>{d.codigo}</div>
                        </td>
                        <td className="text-center tabular-nums">{d.cantidad}</td>
                        <td className="text-right tabular-nums">
                          {formatearMonedaSoles(d.precioUnitario)}
                        </td>
                        <td className="text-right tabular-nums">
                          {formatearMonedaSoles(d.importe)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-2 space-y-0.5 border-t border-dashed border-slate-400 pt-2">
                <div className="flex justify-between">
                  <span>OP. GRAVADA</span>
                  <span className="tabular-nums">{formatearMonedaSoles(venta.opGravada)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IGV (18%)</span>
                  <span className="tabular-nums">{formatearMonedaSoles(venta.igv)}</span>
                </div>
                <div className="flex justify-between">
                  <span>OP. EXONERADA</span>
                  <span className="tabular-nums">{formatearMonedaSoles(venta.opExonerada)}</span>
                </div>
                <div className="flex justify-between">
                  <span>OP. INAFECTA</span>
                  <span className="tabular-nums">{formatearMonedaSoles(venta.opInafecta)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-500 pt-1 text-base font-black">
                  <span>TOTAL</span>
                  <span className="tabular-nums">{formatearMonedaSoles(venta.total)}</span>
                </div>
                {venta.recibido !== null && (
                  <div className="flex justify-between">
                    <span>RECIBIDO</span>
                    <span className="tabular-nums">{formatearMonedaSoles(venta.recibido)}</span>
                  </div>
                )}
                {venta.vuelto !== null && (
                  <div className="flex justify-between">
                    <span>VUELTO</span>
                    <span className="tabular-nums">{formatearMonedaSoles(venta.vuelto)}</span>
                  </div>
                )}
              </div>

              <div className="mt-2 flex justify-between border-t border-dashed border-slate-400 pt-2">
                <span>{FORMA_PAGO_LABEL[venta.formaPago as FormaPago]}</span>
                <span>{METODO_PAGO_LABEL[venta.metodoPago as MetodoPago]}</span>
              </div>

              {venta.tipoComprobante === "COTIZACION" && (
                <div className="mt-2 border border-dashed border-slate-400 p-2 text-center text-[10px]">
                  <div className="font-bold">DOCUMENTO INFORMATIVO DE COTIZACIÓN</div>
                  <div>NO FISCAL</div>
                  <div>VALIDEZ: 15 DÍAS</div>
                </div>
              )}

              <div className="mt-3 text-center text-[10px]">
                *** GRACIAS POR SU COMPRA ***
              </div>
            </div>
            <div className="print:hidden">
              <div className="flex items-center justify-end gap-2 border-t pt-4">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cerrar
                </Button>
                <Button variant="outline" onClick={verPdf} className="gap-2">
                  <FileText className="size-4" />
                  Vista previa PDF
                </Button>
                <Button onClick={imprimir} className="gap-2">
                  <Printer className="size-4" />
                  Imprimir
                </Button>
              </div>
            </div>
              </>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
