"use client";

import { useCallback, useMemo, useState } from "react";
import { useTable } from "@tanstack/react-table";
import { CalendarDays, Loader2 } from "lucide-react";

import { FiltrosReporteVentas } from "./filtros-reporte-ventas";
import { ReporteVentasHeader } from "./reporte-ventas-header";
import { ReporteVentasTabla } from "./reporte-ventas-tabla";
import { crearColumnasReporteVentas, features } from "./reporte-ventas-columnas";
import { useAccionesVenta } from "./use-acciones-venta";
import { useConsultaReporteVentas } from "./use-consulta-reporte-ventas";
import { useExportesReporteVentas } from "./use-exportes-reporte-ventas";
import { DialogosReporteVentas } from "./dialogos-reporte-ventas";
import { fechaCorta, fmt, fmtEntero, imprimir } from "@/lib/reportes/formatters";
import type { ReporteVentasContexto } from "@/actions/reporte-ventas.actions";
import {
  FileSpreadsheet,
  FileText,
  Printer,
  ReceiptText,
  ShoppingCart,
  TrendingUp,
  DollarSign,
} from "lucide-react";

const PAGE_SIZES = [10, 20, 50];

export function ReporteVentasModule({
  contexto,
}: {
  contexto: ReporteVentasContexto;
}) {
  const {
    filtros,
    setCampo,
    data,
    cargando,
    error,
    hayFiltros,
    consultar,
    limpiar,
  } = useConsultaReporteVentas();

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const ejecutarConsulta = useCallback(async () => {
    setPageIndex(0);
    await consultar();
  }, [consultar]);

  const ejecutarLimpiar = useCallback(() => {
    setPageIndex(0);
    limpiar();
  }, [limpiar]);

  const acciones = useAccionesVenta();
  const exportes = useExportesReporteVentas({
    data,
    contexto,
    fechaHasta: filtros.fechaHasta,
  });

  const columns = useMemo(
    () => crearColumnasReporteVentas({ ...acciones }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [acciones.accionando],
  );

  const filasReporte = useMemo(() => data?.items ?? [], [data?.items]);

  const table = useTable({
    features,
    columns,
    data: filasReporte,
    state: { pagination: { pageIndex, pageSize } },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const next = updater({ pageIndex, pageSize });
        setPageIndex(next.pageIndex);
        setPageSize(next.pageSize);
      } else {
        setPageIndex(updater.pageIndex);
        setPageSize(updater.pageSize);
      }
    },
    getRowId: (row) => row.ventaId,
  });

  const totalPaginas = Math.ceil((data?.items.length ?? 0) / pageSize);

  /* ─── Resumen cards (UI alternativa) ─── */
/*   const resumenCards = data
    ? [
        { label: "Ventas", value: fmtEntero(data.resumen.cantidad), icon: ShoppingCart, color: "emerald" },
        { label: "Subtotal", value: `S/ ${fmt(data.resumen.subtotal)}`, icon: DollarSign, color: "blue" },
        { label: "IGV", value: `S/ ${fmt(data.resumen.igv)}`, icon: TrendingUp, color: "amber" },
        { label: "Total", value: `S/ ${fmt(data.resumen.total)}`, icon: ReceiptText, color: "emerald" },
      ]
    : [];

  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-500/10 text-emerald-400",
    blue: "bg-blue-500/10 text-blue-400",
    amber: "bg-amber-500/10 text-amber-400",
  }; */

  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 px-4 py-3 md:py-4 lg:px-6">
        <div className="space-y-4">
          {/* ── HEADER ── */}
          <ReporteVentasHeader data={data} cargando={cargando} />

          {/* ── FILTROS ── */}
          <FiltrosReporteVentas
            fechaDesde={filtros.fechaDesde}
            fechaHasta={filtros.fechaHasta}
            tipoComprobante={filtros.tipoComprobante}
            estado={filtros.estado}
            formaPago={filtros.formaPago}
            numeroComprobante={filtros.numeroComprobante}
            documento={filtros.documento}
            cantidadVentas={data && !cargando ? data.items.length : null}
            hayFiltros={hayFiltros}
            cargando={cargando}
            error={error}
            onFechaDesdeChange={(v) => setCampo("fechaDesde", v)}
            onFechaHastaChange={(v) => setCampo("fechaHasta", v)}
            onTipoComprobanteChange={(v) => setCampo("tipoComprobante", v)}
            onEstadoChange={(v) => setCampo("estado", v)}
            onFormaPagoChange={(v) => setCampo("formaPago", v)}
            onNumeroComprobanteChange={(v) => setCampo("numeroComprobante", v)}
            onDocumentoChange={(v) => setCampo("documento", v)}
            onConsultar={() => void ejecutarConsulta()}
            onLimpiar={ejecutarLimpiar}
          />

          {/* ── LOADING ── */}
          {cargando && (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-700/60 bg-[#0f172a] p-6 text-xs text-slate-400 shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
              Consultando...
            </div>
          )}

          {/* ── EMPTY STATES ── */}
          {!cargando && data && data.items.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-700/60 bg-[#0f172a] p-12 text-center shadow-sm">
              <ReceiptText className="size-10 text-slate-600" />
              <p className="text-xs text-slate-400">
                Sin ventas para los filtros seleccionados.
              </p>
            </div>
          )}

          {!cargando && !data && (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-700/60 bg-[#0f172a] p-12 text-center shadow-sm">
              <CalendarDays className="size-10 text-slate-600" />
              <p className="text-xs text-slate-400">
                Presiona{" "}
                <span className="font-semibold text-slate-200">Consultar</span>{" "}
                para generar el reporte de ventas.
              </p>
            </div>
          )}

          {/* ── RESULTS ── */}
          {data && !cargando && data.items.length > 0 && (
            <>
              {/* Resumen cards */}
              {/* <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {resumenCards.map((c) => {
                  const Icon = c.icon;
                  return (
                    <div key={c.label} className="flex items-center gap-3 rounded-xl border border-slate-700/60 bg-[#0f172a] px-4 py-3 shadow-sm">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${colorMap[c.color]}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wide text-slate-400">{c.label}</div>
                        <div className="text-sm font-bold tabular-nums text-white">{c.value}</div>
                      </div>
                    </div>
                  );
                })}
              </div> */}

              {/* Export buttons */}
              {/* <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-700/60 bg-[#0f172a] px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                    <ReceiptText className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold tracking-wide text-white">
                      Reporte de Ventas
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      {data.items.length} {data.items.length === 1 ? "venta" : "ventas"} · Total S/ {fmt(data.resumen.total)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={exportarExcel}
                    className="h-8 gap-1.5 bg-emerald-600 text-[11px] text-white hover:bg-emerald-700 shadow-md shadow-emerald-900/20 font-semibold">
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                    Excel
                  </Button>
                  <Button
                    onClick={exportarPdf}
                    className="h-8 gap-1.5 bg-red-600 text-[11px] text-white hover:bg-red-700 shadow-md shadow-red-900/20 font-semibold">
                    <FileText className="h-3.5 w-3.5" />
                    PDF
                  </Button>
                  <Button
                    onClick={imprimir}
                    variant="outline"
                    className="h-8 gap-1.5 border-slate-700 bg-slate-800/60 text-[11px] text-slate-300 hover:text-white">
                    <Printer className="h-3.5 w-3.5" />
                    Imprimir
                  </Button>
                </div>
              </div> */}

              <ReporteVentasTabla
                table={table}
                columnas={columns.length}
                total={data.items.length}
                pageIndex={pageIndex}
                pageSize={pageSize}
                totalPaginas={totalPaginas}
                pageSizes={PAGE_SIZES}
                onPageSizeChange={(n) => {
                  setPageSize(n);
                  setPageIndex(0);
                }}
                onPrevious={() => setPageIndex((p) => Math.max(0, p - 1))}
                onNext={() => setPageIndex((p) => Math.min(totalPaginas - 1, p + 1))}
              />
            </>
          )}
        </div>
      </div>

      <DialogosReporteVentas
        acciones={acciones}
        verPdf={exportes.verPdf}
        pdfUrl={exportes.pdfUrl}
        pdfNombre={exportes.pdfNombre}
        cargandoPdf={exportes.cargandoPdf}
        onVerPdfChange={(o) => (o ? exportes.setVerPdf(o) : exportes.cerrarVistaPrevia())}
        onDescargarReporte={() => void exportes.exportarPdf()}
      />
    </div>
  );
}
