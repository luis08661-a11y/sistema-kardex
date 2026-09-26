"use client";

import {
  createColumnHelper,
  columnVisibilityFeature,
  createPaginatedRowModel,
  rowPaginationFeature,
  tableFeatures,
} from "@tanstack/react-table";
import {
  Eye,
  FileDown,
  Loader2,
  Mail,
  MessageCircle,
  MoreHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ReporteVentasFila } from "@/actions/reporte-ventas.actions";
import { fmt, fechaCorta } from "@/lib/reportes/formatters";
import { formaLabel, metodoLabel } from "@/lib/reportes/ventas-labels";

/* ─── TanStack column helper ─── */
export const features = tableFeatures({
  rowPaginationFeature,
  columnVisibilityFeature,
  paginatedRowModel: createPaginatedRowModel(),
});

const columnHelper = createColumnHelper<typeof features, ReporteVentasFila>();

type Handlers = {
  accionando: string | null;
  verDetalle: (fila: ReporteVentasFila) => Promise<void>;
  previsualizarPdfVentaDe: (fila: ReporteVentasFila) => Promise<void>;
  enviarWhatsApp: (fila: ReporteVentasFila) => Promise<void>;
  enviarCorreo: (fila: ReporteVentasFila) => Promise<void>;
};

export function crearColumnasReporteVentas({
  accionando,
  verDetalle,
  previsualizarPdfVentaDe,
  enviarWhatsApp,
  enviarCorreo,
}: Handlers) {
  return columnHelper.columns([
    columnHelper.accessor("fecha", {
      header: "Fecha",
      cell: ({ row }) => (
        <span className="text-xs tabular-nums text-slate-300">
          {fechaCorta(row.original.fecha)}
        </span>
      ),
    }),
    columnHelper.accessor("comprobante", {
      header: "Comprobante",
      cell: ({ row }) => {
        const anulada = row.original.estado === "ANULADA";
        return (
          <div className="flex flex-col gap-0.5">
            <Badge
              variant="outline"
              className={`inline-flex w-fit items-center rounded-full border px-2 py-0 font-mono text-[10px] font-bold tabular-nums shadow-sm ${
                anulada
                  ? "border-rose-400/60 bg-rose-500/10 text-rose-400"
                  : "border-emerald-400/60 bg-emerald-500/10 text-emerald-400"
              }`}
            >
              {row.original.comprobante}
            </Badge>
            {/* <span className="text-[10px] font-semibold text-slate-400">
              {tipoLabel(row.original.tipoComprobante)}
            </span> */}
          </div>
        );
      },
    }),
    columnHelper.accessor("cliente", {
      header: "Razon Social",
      cell: ({ row }) => (
        <div className="min-w-32 max-w-48">
          <span className="text-xs font-medium text-slate-200">
            {row.original.cliente}
          </span>
        </div>
      ),
    }),
    columnHelper.accessor("documento", {
      header: "Documento",
      cell: ({ row }) => (
        <span className="font-mono text-[10px] text-slate-400">
          {row.original.documento}
        </span>
      ),
    }),
    columnHelper.accessor("formaPago", {
      header: "Forma pago",
      cell: ({ row }) => {
        const credito = row.original.formaPago === "CREDITO";
        return (
          <Badge
            variant="outline"
            className={`inline-flex items-center rounded-full border px-2 py-0 text-[10px] font-bold shadow-sm ${
              credito
                ? "border-sky-400/60 bg-sky-500/10 text-sky-400"
                : "border-amber-400/60 bg-amber-500/10 text-amber-400"
            }`}
          >
            {formaLabel(row.original.formaPago)}
          </Badge>
        );
      },
    }),
    columnHelper.accessor("metodoPago", {
      header: "Método",
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className="inline-flex items-center rounded-full border border-sky-400/60 bg-sky-500/10 px-2 py-0 text-[10px] font-bold text-sky-400 shadow-sm"
        >
          {metodoLabel(row.original.metodoPago)}
        </Badge>
      ),
    }),
    columnHelper.accessor("opGravada", {
      header: () => <div className="text-right">Op. Grav.</div>,
      cell: ({ row }) => (
        <div className="text-right text-xs tabular-nums text-slate-300">
          {fmt(row.original.opGravada)}
        </div>
      ),
    }),
    columnHelper.accessor("igv", {
      header: () => <div className="text-right">IGV</div>,
      cell: ({ row }) => (
        <div className="text-right text-xs tabular-nums text-amber-400">
          {fmt(row.original.igv)}
        </div>
      ),
    }),
    columnHelper.accessor("total", {
      header: () => <div className="text-right">Total</div>,
      cell: ({ row }) => (
        <div className="text-right text-xs font-bold tabular-nums text-emerald-400">
          S/ {fmt(row.original.total)}
        </div>
      ),
    }),
    columnHelper.accessor("estado", {
      header: "Estado",
      cell: ({ row }) => {
        const anulada = row.original.estado === "ANULADA";
        return (
          <Badge
            variant="outline"
            className={`inline-flex items-center rounded-full border px-2 py-0 text-[10px] font-bold shadow-sm ${
              anulada
                ? "border-rose-400/60 bg-rose-500/10 text-rose-400"
                : "border-emerald-400/60 bg-emerald-500/10 text-emerald-400"
            }`}
          >
            {anulada ? "ANULADA" : "EMITIDA"}
          </Badge>
        );
      },
    }),
    columnHelper.display({
      id: "acciones",
      header: () => <div className="text-right">Acción</div>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Acciones de venta"
                  className="h-7 w-7"
                  disabled={accionando === row.original.ventaId}
                />
              }
            >
              {accionando === row.original.ventaId ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <MoreHorizontal className="h-3.5 w-3.5" />
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => verDetalle(row.original)}>
                <Eye className="h-4 w-4" />
                Ver detalle
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => previsualizarPdfVentaDe(row.original)}
              >
                <FileDown className="h-4 w-4" />
                Exportar PDF
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => enviarWhatsApp(row.original)}>
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => enviarCorreo(row.original)}
                disabled={!row.original.email}
              >
                <Mail className="h-4 w-4" />
                Enviar por correo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    }),
  ]);
}
