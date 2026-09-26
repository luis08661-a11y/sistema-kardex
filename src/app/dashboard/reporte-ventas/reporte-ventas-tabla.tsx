"use client";

import { FlexRender, type ReactTable } from "@tanstack/react-table";

import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaginacionTabla } from "@/components/shared/paginacion-tabla";
import { features } from "./reporte-ventas-columnas";
import type { ReporteVentasFila } from "@/actions/reporte-ventas.actions";

type TablaReporteVentas = ReactTable<typeof features, ReporteVentasFila>;

type Props = {
  table: TablaReporteVentas;
  columnas: number;
  total: number;
  pageIndex: number;
  pageSize: number;
  totalPaginas: number;
  pageSizes: number[];
  onPageSizeChange: (n: number) => void;
  onPrevious: () => void;
  onNext: () => void;
};

export function ReporteVentasTabla({
  table,
  columnas,
  total,
  pageIndex,
  pageSize,
  totalPaginas,
  pageSizes,
  onPageSizeChange,
  onPrevious,
  onNext,
}: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-700/60 bg-[#0f172a] shadow-sm">
      {/* Table + Pagination */}
      {/* <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/60 px-4 py-2.5">
        <p className="text-[11px] tabular-nums text-slate-400">
          {data.items.length} {data.items.length === 1 ? "venta" : "ventas"} · Total S/ {fmt(data.resumen.total)}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={exportarExcel}
            className="h-8 gap-1.5 bg-emerald-600 text-[11px] text-white shadow-md shadow-emerald-900/20 hover:bg-emerald-700"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Excel
          </Button>
          <Button
            onClick={() => void previsualizarPdf()}
            disabled={cargandoPdf}
            className="h-8 gap-1.5 bg-red-600 text-[11px] text-white shadow-md shadow-red-900/20 hover:bg-red-700"
          >
            {cargandoPdf ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FileText className="h-3.5 w-3.5" />
            )}
            {cargandoPdf ? "Generando..." : "PDF"}
          </Button>
          <Button
            onClick={imprimir}
            variant="outline"
            className="h-8 gap-1.5 border-slate-700 bg-slate-800/60 text-[11px] text-slate-300 hover:text-white"
          >
            <Printer className="h-3.5 w-3.5" />
            Imprimir
          </Button>
        </div>
      </div> */}
      <div className="overflow-x-auto">
        <UITable>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-b border-slate-700/60 hover:bg-transparent"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-[10px] font-semibold uppercase tracking-wider text-slate-400"
                  >
                    {header.isPlaceholder ? null : <FlexRender header={header} />}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columnas}
                  className="h-20 text-center text-xs text-slate-400"
                >
                  Sin resultados.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-b border-slate-700/40 hover:bg-slate-800/40"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2">
                      <FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </UITable>
      </div>

      <PaginacionTabla
        tema="oscuro"
        pageIndex={pageIndex}
        totalPaginas={totalPaginas}
        pageSize={pageSize}
        total={total}
        pageSizes={pageSizes}
        onPageSizeChange={onPageSizeChange}
        onPrevious={onPrevious}
        onNext={onNext}
      />
    </div>
  );
}
