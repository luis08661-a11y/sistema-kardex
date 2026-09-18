"use client";

import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  createColumnHelper,
  columnVisibilityFeature,
  createPaginatedRowModel,
  FlexRender,
  rowPaginationFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import {
  Search,
  SlidersHorizontal,
  FileSpreadsheet,
  FileText,
  FileDown,
  Printer,
  ReceiptText,
  Loader2,
  X,
  CalendarDays,
  MoreHorizontal,
  Eye,
  MessageCircle,
  Mail,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Hash,
  UserRound,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { PdfPreviewDialog } from "@/components/reportes/pdf-preview-dialog";
import { VentaDetalleDialog } from "@/components/ventas/venta-detalle-dialog";
import { EnviarWhatsAppDialog } from "@/components/ventas/enviar-whatsapp-dialog";
import {
  enviarVentaCorreo,
  exportarPdfVenta,
} from "@/components/ventas/venta-export";
import { ventaDTOParaImprimir, type VentaParaImprimir } from "@/components/ventas/types";
import { obtenerVenta } from "@/actions/venta.actions";
import {
  consultarReporteVentas,
  type ReporteVentasContexto,
  type ReporteVentasData,
  type ReporteVentasFila,
} from "@/actions/reporte-ventas.actions";
import {
  FORMA_PAGO_LABEL,
  METODO_PAGO_LABEL,
  TIPO_COMPROBANTE_POS_CORTO,
  type FormaPago,
  type MetodoPago,
  type TipoComprobantePos,
} from "@/components/pos/pos-types";

const fmt = (n: number) =>
  n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtEntero = (n: number) =>
  n.toLocaleString("es-PE", { maximumFractionDigits: 0 });

const fechaCorta = (d: string | Date) => {
  const dt = typeof d === "string" ? new Date(d) : d;
  if (isNaN(dt.getTime())) return "";
  return dt.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const tipoLabel = (t: string) => TIPO_COMPROBANTE_POS_CORTO[t as TipoComprobantePos] ?? t;
const formaLabel = (f: string) => FORMA_PAGO_LABEL[f as FormaPago] ?? f;
const metodoLabel = (m: string) => METODO_PAGO_LABEL[m as MetodoPago] ?? m;

const TIPO_OPCIONES = [
  { valor: "TODOS", label: "Todos los comprobantes" },
  { valor: "NOTA_DE_VENTA", label: "NOTA DE VENTA" },
  { valor: "FACTURA", label: "FACTURA" },
  { valor: "BOLETA", label: "BOLETA" },
  { valor: "COTIZACION", label: "COTIZACIÓN" },
];

const ESTADO_OPCIONES = [
  { valor: "TODOS", label: "Todos los estados" },
  { valor: "EMITIDA", label: "Emitida" },
  { valor: "ANULADA", label: "Anulada" },
];

const FORMA_PAGO_OPCIONES = [
  { valor: "TODOS", label: "Todas las formas de pago" },
  { valor: "CONTADO", label: "Contado" },
  { valor: "CREDITO", label: "Crédito" },
];

async function imagenComoDataUrl(url: string): Promise<string | null> {
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

/* ─── TanStack column helper ─── */
const features = tableFeatures({
  rowPaginationFeature,
  columnVisibilityFeature,
  paginatedRowModel: createPaginatedRowModel(),
});
const columnHelper = createColumnHelper<typeof features, ReporteVentasFila>();

/* ─── Page sizes ─── */
const PAGE_SIZES = [10, 20, 50];

export function ReporteVentasModule({
  contexto,
}: {
  contexto: ReporteVentasContexto;
}) {
  const [fechaDesde, setFechaDesde] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [fechaHasta, setFechaHasta] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [tipoComprobante, setTipoComprobante] = useState("TODOS");
  const [estado, setEstado] = useState("TODOS");
  const [formaPago, setFormaPago] = useState("TODOS");
  const [numeroComprobante, setNumeroComprobante] = useState("");
  const [documento, setDocumento] = useState("");
  const [data, setData] = useState<ReporteVentasData | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [ventaEnDetalle, setVentaEnDetalle] = useState<VentaParaImprimir | null>(null);
  const [detalleAbierto, setDetalleAbierto] = useState(false);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [accionando, setAccionando] = useState<string | null>(null);
  const [verPdf, setVerPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfNombre, setPdfNombre] = useState("");
  const [cargandoPdf, setCargandoPdf] = useState(false);
  const [pdfVentaAbierto, setPdfVentaAbierto] = useState(false);
  const [pdfVentaUrl, setPdfVentaUrl] = useState<string | null>(null);
  const [pdfVenta, setPdfVenta] = useState<VentaParaImprimir | null>(null);
  const [whatsappAbierto, setWhatsappAbierto] = useState(false);
  const [ventaParaWhatsapp, setVentaParaWhatsapp] = useState<VentaParaImprimir | null>(null);

  /* ─── Pagination state ─── */
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  async function obtenerImprimible(fila: ReporteVentasFila) {
    const dto = await obtenerVenta(fila.ventaId);
    if (!dto) throw new Error("No se encontró la venta.");
    return ventaDTOParaImprimir(dto);
  }

  async function verDetalle(fila: ReporteVentasFila) {
    setAccionando(fila.ventaId);
    setCargandoDetalle(true);
    setDetalleAbierto(true);
    try {
      setVentaEnDetalle(await obtenerImprimible(fila));
    } catch (e) {
      setDetalleAbierto(false);
      toast.error(e instanceof Error ? e.message : "No se pudo cargar el comprobante");
    } finally {
      setCargandoDetalle(false);
      setAccionando(null);
    }
  }

  async function previsualizarPdfVentaDe(fila: ReporteVentasFila) {
    setAccionando(fila.ventaId);
    try {
      const venta = await obtenerImprimible(fila);
      const url = await exportarPdfVenta(venta, { preview: true });
      if (url) setPdfVentaUrl(url);
      setPdfVenta(venta);
      setPdfVentaAbierto(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo generar la vista previa");
    } finally {
      setAccionando(null);
    }
  }

  function cerrarPdfVentaDe() {
    setPdfVentaAbierto(false);
    if (pdfVentaUrl) {
      URL.revokeObjectURL(pdfVentaUrl);
      setPdfVentaUrl(null);
    }
  }

  async function enviarWhatsApp(fila: ReporteVentasFila) {
    setAccionando(fila.ventaId);
    try {
      const venta = await obtenerImprimible(fila);
      setVentaParaWhatsapp(venta);
      setWhatsappAbierto(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo cargar la venta");
    } finally {
      setAccionando(null);
    }
  }

  async function enviarCorreo(fila: ReporteVentasFila) {
    if (!fila.email) {
      toast.error("El cliente de esta venta no tiene correo registrado");
      return;
    }
    setAccionando(fila.ventaId);
    try {
      enviarVentaCorreo(await obtenerImprimible(fila), fila.email);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo armar el correo");
    } finally {
      setAccionando(null);
    }
  }

  const hayFiltros = Boolean(
    fechaDesde ||
      fechaHasta ||
      tipoComprobante !== "TODOS" ||
      estado !== "TODOS" ||
      formaPago !== "TODOS" ||
      numeroComprobante.trim() ||
      documento.trim(),
  );

  async function consultar() {
    setError("");
    if (fechaDesde && fechaHasta && fechaDesde > fechaHasta) {
      setError("La fecha desde no puede ser mayor que la fecha hasta.");
      return;
    }
    setCargando(true);
    try {
      const res = await consultarReporteVentas({
        fechaDesde: fechaDesde || undefined,
        fechaHasta: fechaHasta || undefined,
        tipoComprobante: tipoComprobante === "TODOS" ? undefined : tipoComprobante,
        estado: estado === "TODOS" ? undefined : estado,
        formaPago: formaPago === "TODOS" ? undefined : formaPago,
        numeroComprobante: numeroComprobante.trim() || undefined,
        documento: documento.trim() || undefined,
      });
      setData(res);
      setPageIndex(0);
    } catch (e) {
      setError((e instanceof Error ? e.message : "Error al consultar el reporte.") || "Error al consultar el reporte.");
    } finally {
      setCargando(false);
    }
  }

  function limpiar() {
    setFechaDesde("");
    setFechaHasta("");
    setTipoComprobante("TODOS");
    setEstado("TODOS");
    setFormaPago("TODOS");
    setNumeroComprobante("");
    setDocumento("");
    setData(null);
    setError("");
    setPageIndex(0);
  }

  function exportarExcel() {
    if (!data) return;
    const aoa: (string | number)[][] = [
      ["REPORTE DE VENTAS"],
      ["PERÍODO:", data.periodo],
      ["RUC:", contexto.empresa.ruc],
      ["DENOMINACIÓN O RAZÓN SOCIAL:", contexto.empresa.razonSocial],
      ["ESTABLECIMIENTO:", contexto.establecimiento ?? "—"],
      [],
      [
        "FECHA", "TIPO", "COMPROBANTE", "CLIENTE", "DOCUMENTO",
        "FORMA PAGO", "MÉTODO PAGO", "OP. GRAVADA", "OP. EXONERADA",
        "OP. INAFECTA", "IGV", "TOTAL", "ESTADO",
      ],
    ];
    for (const r of data.items) {
      aoa.push([
        fechaCorta(r.fecha), tipoLabel(r.tipoComprobante), r.comprobante,
        r.cliente, r.documento, formaLabel(r.formaPago), metodoLabel(r.metodoPago),
        r.opGravada, r.opExonerada, r.opInafecta, r.igv, r.total, r.estado,
      ]);
    }
    aoa.push([
      "TOTALES", "", "", `${data.resumen.cantidad} ventas`, "", "", "",
      data.resumen.opGravada, data.resumen.opExonerada, data.resumen.opInafecta,
      data.resumen.igv, data.resumen.total, "",
    ]);

    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!cols"] = [
      { wch: 12 }, { wch: 18 }, { wch: 14 }, { wch: 30 }, { wch: 18 },
      { wch: 12 }, { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 14 },
      { wch: 12 }, { wch: 14 }, { wch: 10 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte de Ventas");
    XLSX.writeFile(wb, `reporte_ventas_${fechaHasta.replace(/\//g, "-")}.xlsx`);
  }

  async function generarPdfDeReporte() {
    if (!data) throw new Error("No hay datos para generar el PDF.");
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 10;

    const [logo, firma] = await Promise.all([
      contexto.empresa.logoUrl ? imagenComoDataUrl(contexto.empresa.logoUrl) : Promise.resolve(null),
      contexto.empresa.firmaUrl ? imagenComoDataUrl(contexto.empresa.firmaUrl) : Promise.resolve(null),
    ]);

    doc.setFillColor(6, 78, 59);
    doc.rect(0, 0, pageW, 16, "F");
    if (logo) {
      try { doc.addImage(logo, "PNG", margin, 3, 14, 10); } catch { /* logo opcional */ }
    }
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("REPORTE DE VENTAS", pageW / 2, 7, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("PUNTO DE VENTA (POS)", pageW / 2, 12, { align: "center" });

    let y = 22;
    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(`PERÍODO: ${data.periodo}`, margin, y);
    doc.text(`RUC: ${contexto.empresa.ruc}`, margin + 55, y);
    doc.text(`DENOMINACIÓN: ${contexto.empresa.razonSocial}`, margin + 95, y);
    y += 5;
    doc.text(`ESTABLECIMIENTO: ${contexto.establecimiento ?? "—"}`, margin, y);
    doc.setFont("helvetica", "normal");

    autoTable(doc, {
      startY: y + 6,
      margin: { left: margin, right: margin },
      head: [[
        "FECHA", "TIPO", "COMPROBANTE", "CLIENTE", "DOCUMENTO",
        "FORMA", "MÉTODO", "OP. GRAV.", "IGV", "TOTAL", "ESTADO",
      ]],
      body: data.items.map((r) => [
        fechaCorta(r.fecha), tipoLabel(r.tipoComprobante), r.comprobante,
        r.cliente, r.documento, formaLabel(r.formaPago), metodoLabel(r.metodoPago),
        fmt(r.opGravada), fmt(r.igv), fmt(r.total), r.estado,
      ]),
      foot: [[
        "TOTALES", "", "", `${data.resumen.cantidad} ventas`, "",
        "", "", fmt(data.resumen.opGravada), fmt(data.resumen.igv), fmt(data.resumen.total), "",
      ]],
      styles: { fontSize: 7, cellPadding: 1.8, textColor: [30, 41, 59] },
      headStyles: { fillColor: [6, 78, 59], textColor: 255, fontStyle: "bold", fontSize: 7 },
      footStyles: { fillColor: [5, 150, 105], textColor: 255, fontStyle: "bold", fontSize: 7 },
      columnStyles: {
        0: { cellWidth: 22 }, 1: { cellWidth: 32 }, 2: { cellWidth: 26 },
        3: { cellWidth: 40 }, 4: { cellWidth: 26 },
        7: { halign: "right" }, 8: { halign: "right" }, 9: { halign: "right" },
      },
    });

    const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
    const firmaY = Math.min(finalY + 12, doc.internal.pageSize.getHeight() - 35);
    if (firma) {
      try { doc.addImage(firma, "PNG", pageW / 2 - 25, firmaY - 4, 50, 16); } catch { /* firma opcional */ }
    }
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("Elaborado por:", margin + 30, firmaY);
    doc.setFont("helvetica", "normal");
    doc.text(contexto.empresa.responsableReporte ?? "Responsable", margin + 30, firmaY + 4);
    if (contexto.empresa.cargoReporte) doc.text(contexto.empresa.cargoReporte, margin + 30, firmaY + 7);
    doc.setFont("helvetica", "bold");
    doc.text("Aprobado por:", pageW - margin - 40, firmaY);
    doc.setFont("helvetica", "normal");
    doc.text("Ing. Responsable", pageW - margin - 40, firmaY + 4);

    return doc;
  }

  function nombrePdfReporte() {
    return `reporte_ventas_${fechaCorta(fechaHasta).replace(/\//g, "-")}.pdf`;
  }

  async function exportarPdf() {
    try {
      const doc = await generarPdfDeReporte();
      doc.save(nombrePdfReporte());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo exportar el PDF.");
    }
  }

  async function previsualizarPdf() {
    setCargandoPdf(true);
    try {
      const doc = await generarPdfDeReporte();
      const url = URL.createObjectURL(doc.output("blob"));
      setPdfUrl(url);
      setPdfNombre(nombrePdfReporte());
      setVerPdf(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo generar la vista previa.");
    } finally {
      setCargandoPdf(false);
    }
  }

  function cerrarVistaPrevia() {
    setVerPdf(false);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  }

  function imprimir() {
    if (typeof document === "undefined") return;
    window.print();
  }

  /* ─── TanStack columns ─── */
  const columns = useMemo(
    () =>
      columnHelper.columns([
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
                  }`}>
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
                }`}>
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
              className="inline-flex items-center rounded-full border border-sky-400/60 bg-sky-500/10 px-2 py-0 text-[10px] font-bold text-sky-400 shadow-sm">
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
                }`}>
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
                  }>
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
                  <DropdownMenuItem onClick={() => previsualizarPdfVentaDe(row.original)}>
                    <FileDown className="h-4 w-4" />
                    Exportar PDF
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => enviarWhatsApp(row.original)}>
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => enviarCorreo(row.original)}
                    disabled={!row.original.email}>
                    <Mail className="h-4 w-4" />
                    Enviar por correo
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ),

        }),
      ]),
    [accionando],
  );

  /* ─── TanStack table ─── */
  const table = useTable({
    features,
    columns,
    data: data?.items ?? [],
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

  /* ─── Summary cards data ─── */
/*   const resumenCards = data
    ? [
        { label: "Ventas", value: fmtEntero(data.resumen.cantidad), icon: ShoppingCart, color: "emerald" },
        { label: "Subtotal", value: `S/ ${fmt(data.resumen.subtotal)}`, icon: DollarSign, color: "blue" },
        { label: "IGV", value: `S/ ${fmt(data.resumen.igv)}`, icon: TrendingUp, color: "amber" },
        { label: "Total", value: `S/ ${fmt(data.resumen.total)}`, icon: ReceiptText, color: "emerald" },
      ]
    : []; */

  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-500/10 text-emerald-400",
    blue: "bg-blue-500/10 text-blue-400",
    amber: "bg-amber-500/10 text-amber-400",
  };

  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-3 md:py-4 px-4 lg:px-6">
        <div className="space-y-4">
          {/* ── HEADER ── */}
          <div className="relative overflow-hidden rounded-xl border border-slate-700/60 bg-[#0f172a] p-4 text-white shadow-lg shadow-emerald-500/10">
            <div className="absolute -right-8 -top-2 h-32 w-32 rounded-full bg-emerald-500/5 blur-2xl" />
            <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-emerald-500/5 blur-xl" />
            <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 shadow-sm shadow-emerald-500/30">
                  <ReceiptText className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h1 className="text-sm font-bold tracking-tight">
                    REPORTE DE VENTAS
                  </h1>
                  <p className="text-[10px] text-slate-400">
                    PUNTO DE VENTA & FACTURACIÓN
                    <span className="mx-1 text-slate-600">·</span>
                    Ventas emitidas, valorizadas y por comprobante.
                  </p>
                </div>
              </div>
              {data && !cargando && data.items.length > 0 && (
                <div className="flex items-center gap-5 rounded-lg border border-slate-700/60 bg-slate-800/60 px-4 py-2 backdrop-blur-sm">
                  <div className="text-center">
                    <div className="text-[9px] uppercase tracking-wide text-slate-400">Ventas</div>
                    <div className="text-sm font-bold tabular-nums text-white">{fmtEntero(data.resumen.cantidad)}</div>
                  </div>
                  <div className="h-6 w-px bg-slate-700" />
                  <div className="text-center">
                    <div className="text-[9px] uppercase tracking-wide text-slate-400">Total</div>
                    <div className="text-sm font-bold tabular-nums text-emerald-400">S/ {fmt(data.resumen.total)}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── FILTROS ── */}
          <div className="rounded-xl border border-slate-700/60 bg-[#0f172a] p-4 shadow-sm">
            <div className="flex flex-col gap-3">
              <div className="mb-1 flex items-center gap-2">
                <SlidersHorizontal className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Búsqueda y Filtros
                </span>
                <div className="ml-auto flex items-center gap-2">
                  {data && !cargando && (
                    <span className="whitespace-nowrap text-[11px] font-medium text-slate-400">
                      <span className="font-bold text-slate-200">{data.items.length}</span>{" "}
                      {data.items.length === 1 ? "venta" : "ventas"}
                    </span>
                  )}
                  {hayFiltros && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={limpiar}
                      className="h-6 gap-1 text-[10px] text-slate-400 hover:text-rose-400">
                      <X className="h-3 w-3" />
                      Limpiar
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-end gap-3">
                <div className="w-36 space-y-1.5 sm:w-40">
                  <Label className="text-[10px] font-semibold text-slate-400">
                    Fecha desde
                  </Label>
                  <Input
                    type="date"
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.target.value)}
                    className="h-9 border-slate-700 bg-slate-800/60 text-[11px] text-slate-200"
                  />
                </div>
                <div className="w-36 space-y-1.5 sm:w-40">
                  <Label className="text-[10px] font-semibold text-slate-400">
                    Fecha hasta
                  </Label>
                  <Input
                    type="date"
                    value={fechaHasta}
                    onChange={(e) => setFechaHasta(e.target.value)}
                    className="h-9 border-slate-700 bg-slate-800/60 text-[11px] text-slate-200"
                  />
                </div>
                <div className="w-40 space-y-1.5 sm:w-44">
                  <Label className="text-[10px] font-semibold text-slate-400">
                    Tipo de comprobante
                  </Label>
                  <Select value={tipoComprobante} onValueChange={(v) => setTipoComprobante(v ?? "TODOS")}>
                    <SelectTrigger className="h-9 w-full border-slate-700 bg-slate-800/60 text-[11px] text-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPO_OPCIONES.map((op) => (
                        <SelectItem key={op.valor} value={op.valor}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-36 space-y-1.5">
                  <Label className="text-[10px] font-semibold text-slate-400">
                    Estado
                  </Label>
                  <Select value={estado} onValueChange={(v) => setEstado(v ?? "TODOS")}>
                    <SelectTrigger className="h-9 w-full border-slate-700 bg-slate-800/60 text-[11px] text-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ESTADO_OPCIONES.map((op) => (
                        <SelectItem key={op.valor} value={op.valor}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-40 space-y-1.5 sm:w-44">
                  <Label className="text-[10px] font-semibold text-slate-400">
                    Forma de pago
                  </Label>
                  <Select value={formaPago} onValueChange={(v) => setFormaPago(v ?? "TODOS")}>
                    <SelectTrigger className="h-9 w-full border-slate-700 bg-slate-800/60 text-[11px] text-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FORMA_PAGO_OPCIONES.map((op) => (
                        <SelectItem key={op.valor} value={op.valor}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="min-w-44 flex-1 space-y-1.5">
                  <Label className="text-[10px] font-semibold text-slate-400">
                    Número de comprobante
                  </Label>
                  <div className="relative">
                    <Hash className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-500" />
                    <Input
                      value={numeroComprobante}
                      onChange={(e) => setNumeroComprobante(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void consultar();
                      }}
                      placeholder="F001-000001 o 123"
                      className="h-9 border-slate-700 bg-slate-800/60 pl-8 font-mono text-[11px] text-slate-200 placeholder:text-slate-600"
                    />
                  </div>
                </div>
                <div className="min-w-44 flex-1 space-y-1.5">
                  <Label className="text-[10px] font-semibold text-slate-400">
                    DNI / RUC
                  </Label>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-500" />
                    <Input
                      value={documento}
                      onChange={(e) => setDocumento(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void consultar();
                      }}
                      placeholder="Ingrese DNI o RUC"
                      className="h-9 border-slate-700 bg-slate-800/60 pl-8 font-mono text-[11px] text-slate-200 placeholder:text-slate-600"
                    />
                  </div>
                </div>
                <Button
                  onClick={() => void consultar()}
                  disabled={cargando}
                  className="h-9 flex-none gap-1.5 bg-emerald-600 text-[11px] text-white hover:bg-emerald-700 shadow-md shadow-emerald-900/20 font-semibold px-4">
                  {cargando ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Search className="h-3.5 w-3.5" />
                  )}
                  {cargando ? "Consultando..." : "Consultar"}
                </Button>
              </div>

              {error && (
                <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
                  {error}
                </div>
              )}
            </div>
          </div>

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
                Presiona <span className="font-semibold text-slate-200">Consultar</span> para generar el reporte de ventas.
              </p>
            </div>
          )}

          {/* ── RESULTS ── */}
          {!cargando && data && data.items.length > 0 && (
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
             {/*  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-700/60 bg-[#0f172a] px-4 py-3 shadow-sm">
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

              {/* Table + Pagination */}
              <div className="overflow-hidden rounded-xl border border-slate-700/60 bg-[#0f172a] shadow-sm">
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
                  <Table>
                    <TableHeader>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} className="border-b border-slate-700/60 hover:bg-transparent">
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
                          <TableCell colSpan={columns.length} className="h-20 text-center text-xs text-slate-400">
                            Sin resultados.
                          </TableCell>
                        </TableRow>
                      ) : (
                        table.getRowModel().rows.map((row) => (
                          <TableRow
                            key={row.id}
                            className="border-b border-slate-700/40 hover:bg-slate-800/40">
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id} className="py-2">
                                <FlexRender cell={cell} />
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      )}

                      </TableBody>
                  </Table>
                </div>

                {/* Pagination bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-700/60 px-4 py-2.5">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[11px] tabular-nums text-slate-400">
                      Mostrando{" "}
                      <span className="font-bold text-slate-200">
                        {Math.min((pageIndex + 1) * pageSize, data.items.length)}
                      </span>{" "}
                      de <span className="font-bold text-slate-200">{data.items.length}</span> registros
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">Filas por página</span>
                      <Select
                        value={String(pageSize)}
                        onValueChange={(v) => {
                          setPageSize(Number(v));
                          setPageIndex(0);
                        }}>
                        <SelectTrigger className="h-7 w-16 border-slate-700 bg-slate-800/60 text-[11px] text-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PAGE_SIZES.map((n) => (
                            <SelectItem key={n} value={String(n)}>
                              {n}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] tabular-nums text-slate-400">
                      Pág. <span className="font-bold text-slate-200">{pageIndex + 1}</span> / {totalPaginas}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pageIndex === 0}
                        onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                        className="h-7 w-7 border-slate-700 bg-slate-800/60 p-0 text-slate-300 hover:text-white">
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pageIndex + 1 >= totalPaginas}
                        onClick={() => setPageIndex((p) => Math.min(totalPaginas - 1, p + 1))}
                        className="h-7 w-7 border-slate-700 bg-slate-800/60 p-0 text-slate-300 hover:text-white">
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <PdfPreviewDialog
        open={verPdf}
        onOpenChange={(o) => {
          if (!o) {
            cerrarVistaPrevia();
          } else {
            setVerPdf(o);
          }
        }}
        url={pdfUrl}
        filename={pdfNombre}
        cargando={cargandoPdf}
        onDescargar={() => void exportarPdf()}
      />

      <PdfPreviewDialog
        open={pdfVentaAbierto}
        onOpenChange={(o) => {
          if (!o) {
            cerrarPdfVentaDe();
          } else {
            setPdfVentaAbierto(o);
          }
        }}
        url={pdfVentaUrl}
        filename={pdfVenta ? `${pdfVenta.serie}-${String(pdfVenta.numero).padStart(6, "0")}.pdf` : ""}
        titulo="Vista previa del comprobante"
        onDescargar={() => {
          if (pdfVenta) void exportarPdfVenta(pdfVenta);
        }}
      />

      <VentaDetalleDialog
        venta={ventaEnDetalle}
        open={detalleAbierto}
        onOpenChange={setDetalleAbierto}
        cargando={cargandoDetalle}
      />

      {ventaParaWhatsapp && (
        <EnviarWhatsAppDialog
          venta={ventaParaWhatsapp}
          open={whatsappAbierto}
          onOpenChange={(o) => {
            setWhatsappAbierto(o);
            if (!o) setVentaParaWhatsapp(null);
          }}
        />
      )}
    </div>
  );
}
