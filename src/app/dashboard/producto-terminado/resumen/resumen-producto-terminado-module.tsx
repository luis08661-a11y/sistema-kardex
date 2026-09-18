"use client";

import { useMemo, useState } from "react";
import {
  coreFeatures,
  createColumnHelper,
  createPaginatedRowModel,
  rowPaginationFeature,
  tableFeatures,
  useTable,
  type ColumnDef,
  FlexRender,
} from "@tanstack/react-table";
import {
  CalendarDays,
  FileSpreadsheet,
  FileText,
  Printer,
  RotateCcw,
  Search,
  PackageSearch,
  SlidersHorizontal,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { obtenerResumenPT } from "@/actions/resumen-producto-terminado.actions";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  ComboboxEmpty,
} from "@/components/ui/combobox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PdfPreviewDialog } from "@/components/reportes/pdf-preview-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const fmt = (n: number) =>
  n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const COLUMN_CLASS: Record<string, string> = {
  descripcion: "min-w-[280px]",
  codigo: "w-[90px] text-center",
  presentacion: "w-[150px] text-center",
  stock: "w-[160px] text-right",
  observaciones: "w-[220px]",
};

const fechaCorta = (d: string | Date) => {
  const dt = typeof d === "string" ? new Date(d) : d;
  if (isNaN(dt.getTime())) return "";
  return dt.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
};

type Item = {
  productoId: string;
  codigo: string;
  descripcion: string;
  presentacion: string;
  stock: number;
  observaciones: string;
};

type ResumenData = {
  empresa: {
    ruc: string;
    razonSocial: string;
    logoUrl?: string | null;
    firmaUrl?: string | null;
    responsableReporte?: string | null;
    cargoReporte?: string | null;
  };
  fechaCorte: Date;
  items: Item[];
  totalGeneral: number;
};

type Fila = {
  id: string;
  descripcion: string;
  codigo: string;
  presentacion: string;
  stock: number;
  observaciones: string;
};

const features = tableFeatures({
  ...coreFeatures,
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
});
const helper = createColumnHelper<typeof features, Fila>();

const PAGE_SIZES = [5, 10, 20, 50];

function aplanarFilas(items: Item[]): Fila[] {
  return items.map((item, idx) => ({
    id: String(idx),
    descripcion: item.descripcion,
    codigo: item.codigo,
    presentacion: item.presentacion,
    stock: item.stock,
    observaciones: item.observaciones?.trim() || "",
  }));
}

export function ResumenProductoTerminadoModule({
  contexto,
  inicial,
}: {
  contexto: {
    productos: Array<{ id: string; codigo: string; descripcion: string }>;
  };
  inicial: ResumenData;
}) {
  const [productoId, setProductoId] = useState("");
  const hoyStr = useMemo(() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
  }, []);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState(hoyStr);
  const [error, setError] = useState("");
  const [data, setData] = useState<ResumenData>(inicial);
  const [consultado, setConsultado] = useState(true);
  const [cargando, setCargando] = useState(false);
  const [fechaConsultada, setFechaConsultada] = useState<Date>(new Date(inicial.fechaCorte));
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [soloConStock, setSoloConStock] = useState(true);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const [pdfPreviewLoading, setPdfPreviewLoading] = useState(false);

  const productoLabel = useMemo(
    () => new Map(contexto.productos.map((p) => [p.id, `${p.codigo} — ${p.descripcion}`])),
    [contexto.productos],
  );

  async function consultar() {
    setError("");
    if (fechaDesde && fechaHasta && fechaDesde > fechaHasta) {
      setError("La fecha desde no puede ser mayor que la fecha hasta.");
      return;
    }
    setCargando(true);
    setConsultado(false);
    try {
      const res = await obtenerResumenPT({
        productoId: productoId || undefined,
        fechaDesde: fechaDesde || undefined,
        fechaHasta: fechaHasta || undefined,
        soloConStock,
      });
      setData(res as ResumenData);
      setFechaConsultada(new Date(`${fechaHasta || hoyStr}T23:59:59`));
      setPagination((p) => ({ ...p, pageIndex: 0 }));
      setConsultado(true);
    } finally {
      setCargando(false);
    }
  }

  function limpiar() {
    setProductoId("");
    setFechaDesde("");
    setFechaHasta(hoyStr);
    setError("");
    setPagination((p) => ({ ...p, pageIndex: 0 }));
    setConsultado(false);
  }

  const totalGeneral = data.items.reduce((acc, item) => acc + item.stock, 0);
  const productosConStock = useMemo(
    () => new Set(data.items.map((i) => i.productoId)).size,
    [data.items],
  );
  const presentaciones = data.items.length;
  const hayRegistros = data.items.length > 0;
  const filas = useMemo(() => aplanarFilas(data.items), [data.items]);

  const columns = useMemo(
    () =>
      [
        helper.accessor("descripcion", {
          header: "DESCRIPCIÓN",
          cell: (info) => (
            <span className="font-medium">{info.row.original.descripcion}</span>
          ),
        }),
        helper.accessor("codigo", {
          header: "CÓDIGO",
          cell: (info) => (
            <div className="text-center">{info.row.original.codigo}</div>
          ),
        }),
        helper.accessor("presentacion", {
          header: "PRESENTACIÓN",
          cell: (info) => (
            <div className="text-center">{info.row.original.presentacion}</div>
          ),
        }),
        helper.accessor("stock", {
          header: "STOCK TOTAL",
          cell: (info) => (
            <div className="text-right tabular-nums font-semibold">
              {fmt(info.row.original.stock)}
            </div>
          ),
        }),
        helper.accessor("observaciones", {
          header: "OBSERVACIONES",
          cell: (info) => <span>{info.row.original.observaciones}</span>,
        }),
      ] as ColumnDef<typeof features, Fila>[],
    [],
  );

  const table = useTable(
    {
      features,
      columns,
      data: filas,
      getRowId: (row) => row.id,
      state: { pagination },
      onPaginationChange: setPagination,
      autoResetPageIndex: false,
    },
    (state) => state,
  );

  function exportarExcel() {
    const aoa: (string | number)[][] = [
      [data.empresa.razonSocial],
      ["CUADRO RESUMEN DE INVENTARIO PRODUCTO TERMINADO"],
      [],
      ["DESCRIPCIÓN", "CÓDIGO", "PRESENTACIÓN", "STOCK TOTAL", "OBSERVACIONES"],
    ];
    for (const item of data.items) {
      aoa.push([
        item.descripcion,
        item.codigo,
        item.presentacion,
        item.stock,
        item.observaciones?.trim() || "",
      ]);
    }
    aoa.push([]);
    aoa.push(["TOTAL GENERAL", "", "", totalGeneral, ""]);
    aoa.push([]);
    aoa.push(["Informe al", fechaCorta(fechaConsultada)]);
    aoa.push(["Elaborado por:", data.empresa.responsableReporte ?? ""]);
    aoa.push(["Aprobado por:", ""]);

    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!cols"] = [{ wch: 35 }, { wch: 10 }, { wch: 18 }, { wch: 16 }, { wch: 28 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Resumen Producto Terminado");
    XLSX.writeFile(wb, `resumen_producto_terminado_${fechaCorta(fechaConsultada).replace(/\//g, "-")}.xlsx`);
  }

  async function crearPdf(): Promise<jsPDF> {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 12;

    let logo: string | null = null;
    if (data.empresa.logoUrl) {
      logo = await imagenComoDataUrl(data.empresa.logoUrl);
    }

    let currentY = 10;

    function dibujarEncabezado() {
      currentY = 10;

      if (logo) {
        try {
          doc.addImage(logo, "PNG", margin, currentY, 80, 20);
        } catch { /* opcional */ }
      }

      doc.setTextColor(30, 41, 59);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      const rightX = pageW - margin;
      doc.text(data.empresa.razonSocial, rightX, currentY + 8, { align: "right" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`RUC: ${data.empresa.ruc}`, rightX, currentY + 14, { align: "right" });

      const titleY = currentY + 22;
      doc.setFillColor(30, 143, 60);
      doc.rect(margin, titleY, pageW - margin * 2, 8, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("CUADRO RESUMEN DE INVENTARIO PRODUCTO TERMINADO", pageW / 2, titleY + 5.5, { align: "center" });

      currentY = titleY + 10;
    }

    dibujarEncabezado();

    const body = data.items.map((item) => [
      item.descripcion,
      item.codigo,
      item.presentacion,
      fmt(item.stock),
      item.observaciones?.trim() || "",
    ]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [["DESCRIPCIÓN", "CÓDIGO", "PRESENTACIÓN", "STOCK TOTAL", "OBSERVACIONES"]],
      body,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        textColor: [30, 41, 59],
        lineWidth: 0.1,
        lineColor: [200, 200, 200],
      },
      headStyles: {
        fillColor: [6, 78, 59],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        lineWidth: 0.2,
        lineColor: [6, 78, 59],
      },
      alternateRowStyles: {
        fillColor: [255, 255, 255],
      },
      columnStyles: {
        0: { cellWidth: 55 },
        1: { cellWidth: 18, halign: "center" },
        2: { cellWidth: 30, halign: "center" },
        3: { halign: "right" },
        4: { cellWidth: 45 },
      },
      didDrawPage: (pageData) => {
        if (pageData.pageNumber > 1) dibujarEncabezado();
      },
    });

    const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

    const bloqueY = Math.min(pageH - 40, finalY + 12);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text(`Informe al ${fechaCorta(fechaConsultada)}`, margin, bloqueY);

    const firmaY = Math.min(pageH - 22, finalY + 40);
    const xCen = pageW / 2;

    let firma: string | null = null;
    if (data.empresa.firmaUrl) {
      firma = await imagenComoDataUrl(data.empresa.firmaUrl);
    }

    if (firma) {
      try {
        const img = new Image();
        img.src = firma;
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("No se pudo cargar la firma"));
        });
        const escala = Math.min(50 / img.naturalWidth, 22 / img.naturalHeight);
        const fw = img.naturalWidth * escala;
        const fh = img.naturalHeight * escala;
        doc.addImage(firma, "PNG", xCen - fw / 2, firmaY - fh - 1, fw, fh);
      } catch {
        /* opcional */
      }
    }

    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.2);
    doc.setLineDashPattern([1, 1], 0);
    doc.line(xCen - 25, firmaY, xCen + 25, firmaY);
    doc.setLineDashPattern([], 0);

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("Firma del Responsable", xCen, firmaY + 3, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.text(
      data.empresa.responsableReporte ?? "Responsable",
      xCen,
      firmaY + 6,
      { align: "center" },
    );
    if (data.empresa.cargoReporte)
      doc.text(data.empresa.cargoReporte.toUpperCase(), xCen, firmaY + 9, {
        align: "center",
      });

    return doc;
  }

  async function exportarPdf() {
    const doc = await crearPdf();
    doc.save(`resumen_producto_terminado_${fechaCorta(fechaConsultada).replace(/\//g, "-")}.pdf`);
  }

  async function abrirPreviewPdf() {
    setPdfPreviewLoading(true);
    setPdfPreviewOpen(true);
    try {
      const doc = await crearPdf();
      const url = doc.output("bloburl");
      setPdfPreviewUrl(String(url));
    } finally {
      setPdfPreviewLoading(false);
    }
  }

  function imprimir() {
    if (typeof document === "undefined") return;
    window.print();
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-3 md:py-4 px-4 lg:px-6">
          {/* ENCABEZADO */}
          <div className="no-print relative overflow-hidden rounded-xl border p-4 text-white shadow-lg shadow-emerald-500/20">
            <div className="absolute -right-8 -top-2 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/10 blur-xl" />
            <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-base font-bold tracking-tight md:text-lg">
                    CUADRO RESUMEN DE INVENTARIO PRODUCTO TERMINADO
                  </h1>
                  <p className="text-xs text-zinc-200">
                    Productos terminados, presentaciones y existencias.
                  </p>
                </div>
              </div>
              {consultado && hayRegistros && (
                <Badge
                  variant="outline"
                  className="border-white/30 bg-white/10 text-white backdrop-blur-sm"
                >
                  <CalendarDays className="size-3.5" />
                  Corte: {fechaCorta(fechaConsultada)}
                </Badge>
              )}
            </div>
          </div>

          {/* FILTROS */}
          <div className="no-print rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex flex-col gap-3">
              <div className="mb-1 flex items-center gap-2">
                <SlidersHorizontal className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Búsqueda y Filtros
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-5">
                <div className="space-y-0.5">
                  <Label className="text-[10px] font-semibold text-muted-foreground">
                    Producto
                  </Label>
                  <Combobox
                    value={productoId}
                    items={["__all__", ...contexto.productos.map((p) => p.id)]}
                    onValueChange={(v) => {
                      setProductoId(v === "__all__" ? "" : (v ?? ""));
                    }}
                    itemToStringLabel={(val) => {
                      if (!val || val === "__all__") return "Todos";
                      return productoLabel.get(val) ?? "";
                    }}>
                    <ComboboxInput
                      placeholder="Todos..."
                      className="h-8 text-[11px]"
                    />
                    <ComboboxContent>
                      <ComboboxList>
                        <ComboboxItem value="__all__">
                          Todos
                        </ComboboxItem>
                        {contexto.productos.map((p) => (
                          <ComboboxItem key={p.id} value={p.id}>
                            {p.codigo} — {p.descripcion}
                          </ComboboxItem>
                        ))}
                      </ComboboxList>
                      <ComboboxEmpty>No se encontró el producto.</ComboboxEmpty>
                    </ComboboxContent>
                  </Combobox>
                </div>

                <div className="space-y-0.5">
                  <Label className="text-[10px] font-semibold text-muted-foreground">
                    Fecha Desde
                  </Label>
                  <Input
                    type="date"
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.target.value)}
                    className="h-8 text-[11px]"
                  />
                </div>

                <div className="space-y-0.5">
                  <Label className="text-[10px] font-semibold text-muted-foreground">
                    Fecha Hasta
                  </Label>
                  <Input
                    type="date"
                    value={fechaHasta}
                    onChange={(e) => setFechaHasta(e.target.value)}
                    className="h-8 text-[11px]"
                  />
                </div>

                <div className="flex items-end gap-2">
                  <Button
                    onClick={consultar}
                    disabled={cargando}
                    className="h-8 gap-1.5 bg-emerald-600 text-[11px] text-white hover:bg-emerald-700 shadow-md shadow-emerald-900/20 font-semibold">
                    {cargando ? (
                      <span className="flex items-center gap-2">
                        <Skeleton className="size-4 animate-spin rounded-full bg-white/40" />
                        Consultando...
                      </span>
                    ) : (
                      <Search className="h-3.5 w-3.5" />
                    )}
                    Consultar
                  </Button>
                  <Button
                    onClick={limpiar}
                    variant="outline"
                    className="h-8 gap-1.5 text-[11px] text-muted-foreground hover:text-foreground">
                    <RotateCcw className="h-3.5 w-3.5" />
                    Limpiar
                  </Button>
                </div>

                <div className="flex items-center gap-2 sm:col-span-2 md:col-span-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={soloConStock}
                      onChange={e => setSoloConStock(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-[11px] font-medium text-muted-foreground">
                      Solo mostrar productos con stock
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {cargando && (
            <Card>
              <CardContent className="space-y-3 pt-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </CardContent>
            </Card>
          )}

          {consultado && !cargando && !hayRegistros && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center gap-2 py-12 text-center text-sm text-muted-foreground">
                <PackageSearch className="size-10 text-muted-foreground/40" />
                Sin registros para los filtros seleccionados.
              </CardContent>
            </Card>
          )}

          {consultado && !cargando && hayRegistros && (
            <>
              <Card className="no-print overflow-hidden">
                <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 border-b">
                  <ExportButtons onExcel={exportarExcel} onPdf={exportarPdf} onPrint={imprimir} onPreview={abrirPreviewPdf} />
                </CardHeader>
                <CardContent className="pt-0">
                  <Table className="min-w-[980px] border-collapse text-[13px] leading-tight">
                    <TableHeader>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow
                          key={headerGroup.id}
                          className="bg-primary/90 hover:bg-primary/90">
                          {headerGroup.headers.map((header) => (
                            <TableHead
                              key={header.id}
                              className={cn(
                                "border-r border-primary/30 py-2 font-bold uppercase tracking-wider text-primary-foreground",
                                COLUMN_CLASS[header.column.id] ?? "text-left",
                              )}>
                              {header.isPlaceholder ? null : <FlexRender header={header} />}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          className="border-b border-border transition-colors hover:bg-muted/40">
                          {row.getAllCells().map((cell) => (
                            <TableCell
                              key={cell.id}
                              className={cn("py-2", COLUMN_CLASS[cell.column.id] ?? "text-left")}>
                              <FlexRender cell={cell} />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow className="border-t border-border bg-emerald-50/80 hover:bg-emerald-50/80 dark:bg-emerald-950/20">
                        <TableCell
                          colSpan={4}
                          className="py-2.5 pl-3 text-sm font-bold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">
                          Total General
                        </TableCell>
                        <TableCell className="py-2.5 text-right font-extrabold tabular-nums text-emerald-800 dark:text-emerald-300">
                          {fmt(totalGeneral)}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </CardContent>
              </Card>

              {filas.length > 0 && (
                <div className="no-print flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[11px] text-muted-foreground">
                    Mostrando{" "}
                    <span className="font-semibold text-foreground">
                      {table.getRowModel().rows.length > 0
                        ? pagination.pageIndex * pagination.pageSize + 1
                        : 0}
                      –
                      {Math.min(
                        (pagination.pageIndex + 1) * pagination.pageSize,
                        filas.length,
                      )}
                    </span>{" "}
                    de{" "}
                    <span className="font-semibold text-foreground">{filas.length}</span>{" "}
                    registros
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Select
                      value={String(pagination.pageSize)}
                      onValueChange={(v) =>
                        setPagination({ pageIndex: 0, pageSize: Number(v) })
                      }>
                      <SelectTrigger className="h-8 w-[110px] text-[11px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {PAGE_SIZES.map((ps) => (
                            <SelectItem key={ps} value={String(ps)} className="text-[11px]">
                              {ps} por página
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        disabled={!table.getCanPreviousPage()}
                        onClick={() => table.firstPage()}
                        aria-label="Primera página">
                        <ChevronsLeft className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        disabled={!table.getCanPreviousPage()}
                        onClick={() => table.previousPage()}
                        aria-label="Página anterior">
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </Button>
                      <span className="px-2 text-[11px] font-medium text-muted-foreground">
                        {pagination.pageIndex + 1} / {table.getPageCount()}
                      </span>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        disabled={!table.getCanNextPage()}
                        onClick={() => table.nextPage()}
                        aria-label="Página siguiente">
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        disabled={!table.getCanNextPage()}
                        onClick={() => table.lastPage()}
                        aria-label="Última página">
                        <ChevronsRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <PdfPreviewDialog
        open={pdfPreviewOpen}
        onOpenChange={(open) => {
          setPdfPreviewOpen(open);
          if (!open && pdfPreviewUrl) {
            URL.revokeObjectURL(pdfPreviewUrl);
            setPdfPreviewUrl(null);
          }
        }}
        url={pdfPreviewUrl}
        filename={`resumen_producto_terminado_${fechaCorta(fechaConsultada).replace(/\//g, "-")}.pdf`}
        onDescargar={exportarPdf}
        cargando={pdfPreviewLoading}
        titulo="Vista previa - Resumen Producto Terminado"
      />
    </div>
  );
}

function ExportButtons({
  onExcel,
  onPdf,
  onPrint,
  onPreview,
}: {
  onExcel: () => void;
  onPdf: () => void;
  onPrint: () => void;
  onPreview: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        className="gap-1.5"
        style={{ backgroundColor: "#15803d" }}
        onClick={onExcel}>
        <FileSpreadsheet />
        Excel
      </Button>
      <Button
        size="sm"
        className="gap-1.5 bg-rose-500 text-white hover:bg-rose-600"
        onClick={onPdf}>
        <FileText />
        Exportar PDF
      </Button>
      <Button
        size="sm"
        variant="secondary"
        className="gap-1.5"
        onClick={onPreview}>
        <FileText />
        Vista previa
      </Button>
      {/* <Button size="sm" variant="outline" className="gap-1.5" onClick={onPrint}>
        <Printer />
        Imprimir
      </Button> */}
    </div>
  );
}

function imagenComoDataUrl(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(null);
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}
