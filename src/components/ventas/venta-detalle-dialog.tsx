"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Mail,
  MessageCircle,
  FileDown,
  User,
  CreditCard,
  Send,
  Receipt,
  Package,
  CalendarDays,
} from "lucide-react";
import {
  columnVisibilityFeature,
  createColumnHelper,
  FlexRender,
  rowPaginationFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FORMA_PAGO_LABEL,
  METODO_PAGO_LABEL,
  TIPO_COMPROBANTE_LABEL,
  TIPO_DOCUMENTO_LABEL,
  formatearFechaLocal,
  formatearMoneda,
  type FormaPago,
  type MetodoPago,
  type TipoComprobante,
  type TipoDocumento,
  type VentaParaImprimir,
} from "@/components/ventas/types";
import { exportarPdfVenta, nombrePdfVenta } from "@/components/ventas/venta-export";
import { PdfPreviewDialog } from "@/components/reportes/pdf-preview-dialog";
import { EnviarCorreoDialog } from "@/components/ventas/enviar-correo-dialog";
import { EnviarWhatsAppDialog } from "@/components/ventas/enviar-whatsapp-dialog";
import { listarEnviosComprobanteAction } from "@/actions/venta-envio.actions";
import type { EnvioComprobanteDTO } from "@/lib/services/envio-comprobante.service";
import { PaginacionModal } from "@/components/shared/paginacion-modal";

interface Props {
  venta: VentaParaImprimir | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cargando?: boolean;
}

const ESTADO_ENVIO_LABEL: Record<EnvioComprobanteDTO["estado"], string> = {
  PENDIENTE: "Pendiente",
  ENVIADO: "Enviado",
  ERROR: "Error",
};

const ESTADO_ENVIO_CLASES: Record<EnvioComprobanteDTO["estado"], string> = {
  PENDIENTE: "bg-amber-500/15 text-amber-400",
  ENVIADO: "bg-emerald-500/15 text-emerald-400",
  ERROR: "bg-rose-500/15 text-rose-400",
};

const TIPO_ENVIO_LABEL: Record<EnvioComprobanteDTO["tipo"], string> = {
  CORREO: "Correo",
  WHATSAPP: "WhatsApp",
};

type DetalleVenta = VentaParaImprimir["detalles"][number];

const features = tableFeatures({
  rowPaginationFeature,
  columnVisibilityFeature,
});
const columnHelper = createColumnHelper<typeof features, DetalleVenta>();

const TH_CLASES: Record<string, string> = {
  descripcion: "w-[200px] px-4 py-2 font-bold",
  cantidad: "px-3 py-2 text-right font-bold",
  precioUnitario: "px-3 py-2 text-right font-bold",
  importe: "px-4 py-2 text-right font-bold",
};

const TD_CLASES: Record<string, string> = {
  descripcion: "w-[200px] max-w-[200px] px-4 py-0",
  cantidad: "px-3 py-0 text-right tabular-nums text-slate-200",
  precioUnitario: "px-3 py-0 text-right tabular-nums text-slate-300",
  importe: "px-4 py-0 text-right font-semibold tabular-nums text-slate-100",
};

export function VentaDetalleDialog({ venta, open, onOpenChange, cargando }: Props) {
  const [correoOpen, setCorreoOpen] = useState(false);
  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const [envios, setEnvios] = useState<EnvioComprobanteDTO[]>([]);
  const [pagina, setPagina] = useState(0);
  const [pdfVentaAbierto, setPdfVentaAbierto] = useState(false);
  const [pdfVentaUrl, setPdfVentaUrl] = useState<string | null>(null);
  const POR_PAGINA = 8;

  const totalPaginas = venta
    ? Math.max(1, Math.ceil(venta.detalles.length / POR_PAGINA))
    : 1;
  const paginaSegura = Math.min(pagina, totalPaginas - 1);
  const detallesVisibles = useMemo(
    () =>
      venta
        ? venta.detalles.slice(
            paginaSegura * POR_PAGINA,
            (paginaSegura + 1) * POR_PAGINA,
          )
        : [],
    [venta, paginaSegura],
  );

  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("descripcion", {
          header: "Producto",
          cell: ({ cell }) => (
            <div
              className="truncate text-[13px] font-medium text-slate-100"
              title={String(cell.getValue())}
            >
              {String(cell.getValue())}
            </div>
          ),
        }),
        columnHelper.accessor("cantidad", {
          header: "Cant.",
          cell: ({ cell }) => String(cell.getValue()),
        }),
        columnHelper.accessor("precioUnitario", {
          header: "P. Unit.",
          cell: ({ cell }) => formatearMoneda(Number(cell.getValue())),
        }),
        columnHelper.accessor("importe", {
          header: "Importe",
          cell: ({ cell }) => formatearMoneda(Number(cell.getValue())),
        }),
      ]),
    [],
  );

  const table = useTable({
    features,
    columns,
    data: detallesVisibles,
    getRowId: (row, index) => row.id ?? String(index),
  });

  useEffect(() => {
    if (!open || !venta) return;
    let activo = true;
    listarEnviosComprobanteAction(venta.id)
      .then((registros) => {
        if (activo) setEnvios(registros);
      })
      .catch(() => {
        if (activo) setEnvios([]);
      });
    return () => {
      activo = false;
    };
  }, [open, venta]);

  const recargarEnvios = () => {
    if (!venta) return;
    void listarEnviosComprobanteAction(venta.id)
      .then(setEnvios)
      .catch(() => setEnvios([]));
  };

  const verPdfVenta = async () => {
    if (!venta) return;
    const url = await exportarPdfVenta(venta, { preview: true });
    if (url) setPdfVentaUrl(url);
    setPdfVentaAbierto(true);
  };

  const cerrarPdfVenta = () => {
    setPdfVentaAbierto(false);
    if (pdfVentaUrl) {
      URL.revokeObjectURL(pdfVentaUrl);
      setPdfVentaUrl(null);
    }
  };

  const enviosCargados = envios.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-200! overflow-hidden border-slate-800 bg-[#0b1220] p-0 text-slate-200">
        <div className="max-h-[80vh] overflow-y-auto">
          {/* Cabecera */}
          <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-[#1e1b4b] via-[#312e81] to-[#4338ca] px-3 py-3">
            <div className="flex items-center gap-3">
            
                <Receipt className="size-5" />
             
              <div>
                <DialogTitle className="text-base font-semibold text-white">
                  Detalle de la venta
                </DialogTitle>
                {/* <p className="text-[11px] text-indigo-200/80">
                  Comprobante, producto y resumen de importes
                </p> */}
              </div>
            </div>
            {venta && (
              <div className="text-right px-8">
                <div className="text-lg font-bold text-white tabular-nums">
                 Total {formatearMoneda(venta.total)}
                </div>
              </div>
            )}
          </div>

          {/* Cuerpo */}
          <div className="space-y-3 p-2">
            {cargando && !venta && (
              <div className="flex h-40 items-center justify-center gap-2 text-sm text-slate-400">
                <Loader2 className="size-4 animate-spin" />
                Cargando detalle...
              </div>
            )}

            {!cargando && venta && (
              <>
                {/* Comprobante */}
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[11px] font-bold uppercase text-white shadow-sm ${
                        venta.estado === "ANULADA"
                          ? "bg-rose-600"
                          : "bg-emerald-600"
                      }`}
                    >
                      {TIPO_COMPROBANTE_LABEL[venta.tipoComprobante as TipoComprobante]}
                    </span>
                    <span className="font-mono text-sm font-semibold text-slate-100">
                      {venta.serie}-{String(venta.numero).padStart(6, "0")}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                        venta.estado === "ANULADA"
                          ? "bg-rose-500/15 text-rose-400"
                          : "bg-emerald-500/15 text-emerald-400"
                      }`}
                    >
                      {venta.estado}
                    </span>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs text-slate-400">
                    <CalendarDays className="size-3.5" />
                    Emitido el {formatearFechaLocal(venta.fecha)}
                  </span>
                </div>

                {/* Datos de pago */}
                {/* <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500">
                      Forma de pago
                    </div>
                    <div className="mt-0.5 text-sm font-medium text-slate-100">
                      {FORMA_PAGO_LABEL[venta.formaPago as FormaPago]}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500">
                      Método de pago
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-slate-100">
                      <CreditCard className="size-3.5 text-indigo-400" />
                      {METODO_PAGO_LABEL[venta.metodoPago as MetodoPago]}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500">
                      N° operación
                    </div>
                    <div className="mt-0.5 font-mono text-xs font-medium text-slate-100">
                      {venta.numeroOperacion || "—"}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500">
                      Observación
                    </div>
                    <div className="mt-0.5 text-xs font-medium text-slate-100">
                      {venta.observacion || "—"}
                    </div>
                  </div>
                </div> */}

                {/* Cliente */}
               {/*  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                  <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <span className="flex size-6 items-center justify-center rounded-md bg-indigo-500/15 text-indigo-400">
                      <User className="size-3.5" />
                    </span>
                    Cliente
                  </div>
                  {venta.cliente ? (
                    <div className="grid gap-1 text-sm sm:grid-cols-2">
                      <div>
                        <div className="font-semibold text-slate-100">
                          {venta.cliente.razonSocial}
                        </div>
                        <div className="font-mono text-xs text-slate-400">
                          {TIPO_DOCUMENTO_LABEL[venta.cliente.tipoDocumento as TipoDocumento]}:{" "}
                          {venta.cliente.numeroDocumento}
                        </div>
                        {venta.cliente.direccion && (
                          <div className="text-xs text-slate-400">{venta.cliente.direccion}</div>
                        )}
                      </div>
                      <div className="pt-1 text-xs sm:pt-0 sm:text-right">
                        <div className="text-slate-400">
                          Teléfono:{" "}
                          <span className="font-medium text-slate-200">
                            {venta.cliente.telefono || "—"}
                          </span>
                        </div>
                        <div className="text-slate-400">
                          Correo:{" "}
                          <span className="font-medium text-slate-200">
                            {venta.cliente.email || "—"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-slate-400">Consumidor final</div>
                  )}
                </div> */}

                {/* Detalles */}
                <div className="overflow-hidden rounded-lg border border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 py-2.5">
                    <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <Package className="size-3.5 text-indigo-400" />
                      Detalle de productos
                    </span>
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-slate-300">
                      {venta.detalles.length} ítem{venta.detalles.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        {table.getHeaderGroups().map(hg => (
                          <tr
                            key={hg.id}
                            className="border-b border-slate-800 bg-slate-950/60 text-left text-[10px] uppercase tracking-wide text-slate-500"
                          >
                            {hg.headers.map(h => (
                              <th
                                key={h.id}
                                className={TH_CLASES[h.id] ?? "px-4 py-2 font-bold"}
                              >
                                {h.isPlaceholder ? null : <FlexRender header={h} />}
                              </th>
                            ))}
                          </tr>
                        ))}
                      </thead>
                      <tbody>
                        {table.getRowModel().rows.map(row => (
<tr
                            key={row.id}
                            className="h-8 border-b border-slate-800/70 transition-colors last:border-b-0 hover:bg-slate-800/40"
                          >
                            {row.getVisibleCells().map(cell => (
                              <td
                                key={cell.id}
                                className={TD_CLASES[cell.column.id] ?? "px-4 py-2.5"}
                              >
                                <FlexRender cell={cell} />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <PaginacionModal
                    pagina={paginaSegura}
                    totalPaginas={totalPaginas}
                    porPagina={POR_PAGINA}
                    total={venta.detalles.length}
                    onCambioPagina={setPagina}
                    tema="oscuro"
                    contenedor="flex items-center justify-between border-t border-slate-800 bg-slate-950/60 px-4 py-2"
                  />
                </div>

                {/* Totales */}
                {/* <div className="flex justify-end">
                  <div className="w-64 space-y-1.5 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm">
                    {[
                      ["Subtotal", formatearMoneda(venta.subtotal)],
                      ["Op. Gravada", formatearMoneda(venta.opGravada)],
                      ["Op. Exonerada", formatearMoneda(venta.opExonerada)],
                      ["Op. Inafecta", formatearMoneda(venta.opInafecta)],
                      ["IGV", formatearMoneda(venta.igv)],
                    ].map(([label, valor]) => (
                      <div key={label} className="flex justify-between">
                        <span className="text-slate-400">{label}</span>
                        <span className="tabular-nums text-slate-200">{valor}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between border-t border-slate-700 pt-2 text-base font-bold">
                      <span className="text-slate-200">Total</span>
                      <span className="tabular-nums text-indigo-300">{formatearMoneda(venta.total)}</span>
                    </div>
                  </div>
                </div> */}

                {/* Historial de envíos */}
                {enviosCargados && (
                  <div className="overflow-hidden rounded-xl border border-slate-800">
                    <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-900/80 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <Send className="size-3.5 text-indigo-400" />
                      Historial de envíos
                    </div>
                    <ul className="divide-y divide-slate-800/70">
                      {envios.map((e) => (
                        <li
                          key={e.id}
                          className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-xs"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              {e.tipo === "CORREO" ? (
                                <Mail className="size-3.5 text-slate-400" />
                              ) : (
                                <MessageCircle className="size-3.5 text-slate-400" />
                              )}
                              <span className="font-semibold text-slate-200">
                                {TIPO_ENVIO_LABEL[e.tipo]}
                              </span>
                              <span className="text-slate-600">·</span>
                              <span className="truncate font-mono text-slate-400">{e.destino}</span>
                            </div>
                            <div className="mt-0.5 text-[11px] text-slate-500">
                              {formatearFechaLocal(e.enviadoAt ?? e.createdAt)}
                              {e.error ? ` · ${e.error}` : ""}
                            </div>
                          </div>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${ESTADO_ENVIO_CLASES[e.estado]}`}
                          >
                            {ESTADO_ENVIO_LABEL[e.estado]}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Acciones */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-3">
                  <p className="max-w-52 text-[11px] text-slate-500">
                    Envía el comprobante en PDF por correo o WhatsApp. Puedes escribir
                    manualmente el destinatario.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 border-slate-700 bg-slate-900 text-[11px] text-slate-200 hover:bg-slate-800 hover:text-white"
                      onClick={() => setWhatsappOpen(true)}
                    >
                      <MessageCircle className="size-3.5" />
                      WhatsApp
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 border-slate-700 bg-slate-900 text-[11px] text-slate-200 hover:bg-slate-800 hover:text-white"
                      onClick={() => setCorreoOpen(true)}
                    >
                      <Mail className="size-3.5" />
                      Correo
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 border-slate-700 bg-slate-900 text-[11px] text-slate-200 hover:bg-slate-800 hover:text-white"
                      onClick={verPdfVenta}
                    >
                      <FileDown className="size-3.5" />
                      Exportar PDF
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {venta && (
          <>
            <PdfPreviewDialog
              open={pdfVentaAbierto}
              onOpenChange={(o) => {
                if (!o) {
                  cerrarPdfVenta();
                } else {
                  setPdfVentaAbierto(o);
                }
              }}
              url={pdfVentaUrl}
              filename={`${nombrePdfVenta(venta)}.pdf`}
              titulo="Vista previa del comprobante"
              onDescargar={() => {
                void exportarPdfVenta(venta);
              }}
            />
            <EnviarCorreoDialog
              venta={venta}
              open={correoOpen}
              onOpenChange={(o) => {
                setCorreoOpen(o);
                if (!o) recargarEnvios();
              }}
            />
            <EnviarWhatsAppDialog
              venta={venta}
              open={whatsappOpen}
              onOpenChange={(o) => {
                setWhatsappOpen(o);
                if (!o) recargarEnvios();
              }}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}