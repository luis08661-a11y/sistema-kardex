"use client";

import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Search,
  SlidersHorizontal,
  FileSpreadsheet,
  FileText,
  Printer,
  PackageSearch,
  Loader2,
  X,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";
import {
  consultarReporteGeneral,
  type ReporteGeneralContexto,
  type ReporteGeneralData,
} from "@/actions/reporte-general-base-activa.actions";

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

export function ReporteGeneralBaseActivaModule({
  contexto,
}: {
  contexto: ReporteGeneralContexto;
}) {
  const [productoId, setProductoId] = useState("");
  const [loteId, setLoteId] = useState("");
  const [fechaDesde, setFechaDesde] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [fechaHasta, setFechaHasta] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [data, setData] = useState<ReporteGeneralData | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const productoLotes = useMemo(
    () => contexto.lotes.filter((l) => !productoId || l.productoId === productoId),
    [contexto.lotes, productoId],
  );

  const hayFiltros = Boolean(productoId || loteId);

  async function consultar() {
    setError("");
    if (fechaDesde && fechaHasta && fechaDesde > fechaHasta) {
      setError("La fecha desde no puede ser mayor que la fecha hasta.");
      return;
    }
    setCargando(true);
    try {
      const res = await consultarReporteGeneral({
        productoId: productoId || undefined,
        loteId: loteId || undefined,
        fechaDesde: fechaDesde || undefined,
        fechaHasta: fechaHasta || undefined,
      });
      setData(res);
    } catch (e) {
      setError((e instanceof Error ? e.message : "Error al consultar.") || "Error al consultar.");
    } finally {
      setCargando(false);
    }
  }

  function limpiar() {
    setProductoId("");
    setLoteId("");
    const d = new Date();
    d.setDate(1);
    setFechaDesde(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
    );
    setFechaHasta(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`,
    );
    setData(null);
    setError("");
  }

  function exportarExcel() {
    if (!data) return;
    const aoa: (string | number)[][] = [
      ["REGISTRO DE INVENTARIO PERMANENTE VALORIZADO"],
      ["DETALLE DEL INVENTARIO VALORIZADO - BASE ACTIVA"],
      [],
      ["PERÍODO:", data.periodo],
      ["RUC:", data.empresa.ruc],
      ["DENOMINACIÓN O RAZÓN SOCIAL:", data.empresa.razonSocial],
      ["ESTABLECIMIENTO:", data.establecimiento],
    ];

    if (data.productoSeleccionado) {
      aoa.push(["CÓDIGO DE LA EXISTENCIA:", data.productoSeleccionado.codigoExistencia]);
      aoa.push(["TIPO (TABLA 5):", data.productoSeleccionado.tipoExistencia]);
      aoa.push(["DESCRIPCIÓN:", data.productoSeleccionado.descripcion]);
      aoa.push(["CÓDIGO DE LA UNIDAD DE MEDIDA (TABLA 6):", data.productoSeleccionado.unidadMedida]);
      aoa.push(["MÉTODO DE VALUACIÓN:", data.productoSeleccionado.metodoValuacion]);
    }

    aoa.push([]);
    aoa.push([
      "FECHA",
      "CÓDIGO",
      "DESCRIPCIÓN",
      "OBSERVACIÓN",
      "RESP. REGISTRO",
      "TIPO OPERACIÓN",
      "ENT. UND",
      "ENT. PESO UNIT.",
      "ENT. PESO TOTAL",
      "SAL. UND",
      "SAL. PESO UNIT.",
      "SAL. PESO TOTAL",
      "SALDO UND",
      "SALDO PESO UNIT.",
      "SALDO PESO TOTAL",
      "FORMULACIÓN",
      "RESP. FORMULACIÓN",
      "CANT. FORMULADO",
      "ALMACENAMIENTO",
    ]);

    for (const item of data.items) {
      aoa.push([
        fechaCorta(item.fecha),
        item.codigoLote,
        item.descripcion,
        item.observacion ?? "",
        item.responsableRegistro ?? "",
        item.tipoOperacion,
        item.entradaUnd || "",
        item.entradaPesoUnitarioKg || "",
        item.entradaPesoTotalKg || "",
        item.salidaUnd || "",
        item.salidaPesoUnitarioKg || "",
        item.salidaPesoTotalKg || "",
        item.saldoUnd,
        item.saldoPesoUnitarioKg,
        item.saldoPesoTotalKg,
        item.formulacion ?? "",
        item.responsableFormulacion ?? "",
        item.cantidadProductoFormulado ?? "",
        item.almacenamientoNombre ?? "",
      ]);
    }

    aoa.push([]);
    aoa.push([
      "TOTALES",
      "",
      "",
      "",
      "",
      "",
      data.totalEntradasUnd,
      "",
      data.totalEntradasPeso,
      data.totalSalidasUnd,
      "",
      data.totalSalidasPeso,
      "",
      "",
      data.stockFinalPeso,
      "",
      "",
      "",
      "",
    ]);
    aoa.push([]);
    aoa.push([`STOCK AL ${fechaCorta(data.fechaHasta)}: ${fmt(data.stockFinalPeso)} KG`]);

    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!cols"] = [
      { wch: 12 }, { wch: 14 }, { wch: 28 }, { wch: 18 }, { wch: 22 },
      { wch: 18 }, { wch: 10 }, { wch: 14 }, { wch: 14 },
      { wch: 10 }, { wch: 14 }, { wch: 14 },
      { wch: 10 }, { wch: 14 }, { wch: 14 },
      { wch: 14 }, { wch: 22 }, { wch: 16 }, { wch: 18 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte General Base Activa");
    XLSX.writeFile(
      wb,
      `reporte_general_base_activa_${fechaCorta(data.fechaHasta).replace(/\//g, "-")}.xlsx`,
    );
  }

  async function exportarPdf() {
    if (!data) return;
    const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 10;

    let logo: string | null = null;
    if (data.empresa.logoUrl) {
      logo = await imagenComoDataUrl(data.empresa.logoUrl);
    }

    // Header
    doc.setFillColor(6, 78, 59);
    doc.rect(0, 0, pageW, 18, "F");
    if (logo) {
      try { doc.addImage(logo, "PNG", margin, 3, 14, 12); } catch { /* logo opcional */ }
    }
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("REGISTRO DE INVENTARIO PERMANENTE VALORIZADO", pageW / 2, 8, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("DETALLE DEL INVENTARIO VALORIZADO - BASE ACTIVA", pageW / 2, 13, { align: "center" });

    let y = 24;
    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(`PERÍODO: ${data.periodo}`, margin, y);
    doc.text(`RUC: ${data.empresa.ruc}`, margin + 50, y);
    doc.text(`DENOMINACIÓN: ${data.empresa.razonSocial}`, margin + 90, y);
    y += 5;
    doc.text(`ESTABLECIMIENTO: ${data.establecimiento}`, margin, y);
    if (data.productoSeleccionado) {
      doc.text(`CÓD. EXISTENCIA: ${data.productoSeleccionado.codigoExistencia}`, margin + 60, y);
      doc.text(`TIPO: ${data.productoSeleccionado.tipoExistencia}`, margin + 100, y);
      doc.text(`DESCRIPCIÓN: ${data.productoSeleccionado.descripcion}`, margin + 120, y);
    }
    y += 5;
    if (data.productoSeleccionado) {
      doc.text(`UNIDAD: ${data.productoSeleccionado.unidadMedida}`, margin, y);
      doc.text(`MÉTODO: ${data.productoSeleccionado.metodoValuacion}`, margin + 50, y);
    }

    const body = data.items.map((item) => [
      fechaCorta(item.fecha),
      item.codigoLote,
      item.descripcion,
      item.observacion ?? "",
      item.responsableRegistro ?? "",
      item.tipoOperacion,
      item.entradaUnd ? fmtEntero(item.entradaUnd) : "",
      item.entradaPesoUnitarioKg ? fmt(item.entradaPesoUnitarioKg) : "",
      item.entradaPesoTotalKg ? fmt(item.entradaPesoTotalKg) : "",
      item.salidaUnd ? fmtEntero(item.salidaUnd) : "",
      item.salidaPesoUnitarioKg ? fmt(item.salidaPesoUnitarioKg) : "",
      item.salidaPesoTotalKg ? fmt(item.salidaPesoTotalKg) : "",
      fmtEntero(item.saldoUnd),
      fmt(item.saldoPesoUnitarioKg),
      fmt(item.saldoPesoTotalKg),
      item.formulacion ?? "",
      item.responsableFormulacion ?? "",
      item.cantidadProductoFormulado ? fmt(item.cantidadProductoFormulado) : "",
      item.almacenamientoNombre ?? "",
    ]);

    autoTable(doc, {
      startY: y + 4,
      margin: { left: margin, right: margin },
      head: [[
        "FECHA", "CÓDIGO", "DESCRIPCIÓN", "OBSERV.", "RESP. REG.",
        "OPERACIÓN",
        "E.UND", "E.P.UNIT", "E.P.TOT",
        "S.UND", "S.P.UNIT", "S.P.TOT",
        "SD.UND", "SD.P.UNIT", "SD.P.TOT",
        "FORMUL.", "RESP.FORM.", "CANT.FORM.", "ALMAC."
      ]],
      body,
      foot: [[
        "TOTALES", "", "", "", "", "",
        fmtEntero(data.totalEntradasUnd), "", fmt(data.totalEntradasPeso),
        fmtEntero(data.totalSalidasUnd), "", fmt(data.totalSalidasPeso),
        "", "", fmt(data.stockFinalPeso),
        "", "", "", ""
      ]],
      styles: { fontSize: 6, cellPadding: 1.5, textColor: [30, 41, 59] },
      headStyles: { fillColor: [6, 78, 59], textColor: 255, fontStyle: "bold", fontSize: 6 },
      footStyles: { fillColor: [5, 150, 105], textColor: 255, fontStyle: "bold", fontSize: 6 },
      columnStyles: {
        0: { cellWidth: 18 },
        1: { cellWidth: 20 },
        2: { cellWidth: 32 },
        6: { halign: "right" },
        7: { halign: "right" },
        8: { halign: "right" },
        9: { halign: "right" },
        10: { halign: "right" },
        11: { halign: "right" },
        12: { halign: "right" },
        13: { halign: "right" },
        14: { halign: "right" },
      },
      didDrawPage: () => {
        doc.setFillColor(6, 78, 59);
        doc.rect(0, 0, pageW, 18, "F");
        if (logo) {
          try { doc.addImage(logo, "PNG", margin, 3, 14, 12); } catch { /* logo opcional */ }
        }
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("REGISTRO DE INVENTARIO PERMANENTE VALORIZADO", pageW / 2, 8, { align: "center" });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text("DETALLE DEL INVENTARIO VALORIZADO - BASE ACTIVA", pageW / 2, 13, { align: "center" });
      },
    });

    const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
    const stockY = Math.min(finalY + 8, doc.internal.pageSize.getHeight() - 30);
    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(
      `STOCK AL ${fechaCorta(data.fechaHasta)}: ${fmt(data.stockFinalPeso)} KG`,
      pageW / 2,
      stockY,
      { align: "center" },
    );

    // Firmas
    const firmaY = stockY + 10;
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("Elaborado por:", margin + 30, firmaY);
    doc.setFont("helvetica", "normal");
    doc.text(data.empresa.responsableReporte ?? "Responsable", margin + 30, firmaY + 4);
    if (data.empresa.cargoReporte) {
      doc.text(data.empresa.cargoReporte, margin + 30, firmaY + 7);
    }
    doc.setFont("helvetica", "bold");
    doc.text("Aprobado por:", pageW - margin - 40, firmaY);
    doc.setFont("helvetica", "normal");
    doc.text("Ing. Responsable", pageW - margin - 40, firmaY + 4);

    doc.save(
      `reporte_general_base_activa_${fechaCorta(data.fechaHasta).replace(/\//g, "-")}.pdf`,
    );
  }

  function imprimir() {
    if (typeof document === "undefined") return;
    window.print();
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-3 md:py-4 px-4 lg:px-6">
          <div className="space-y-6">
            {/* HEADER */}
            <div className="relative overflow-hidden rounded-xl border p-4 text-white shadow-lg shadow-emerald-500/20">
              <div className="absolute -right-8 -top-2 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/10 blur-xl" />
              <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h1 className="text-base font-bold tracking-tight md:text-lg">
                      REPORTE GENERAL BASE ACTIVA
                    </h1>
                    <p className="text-xs text-zinc-200">
                      BASE ACTIVA (MATERIA PRIMA)
                      <span className="mx-1.5 text-white/40">·</span>
                      Registro de Inventario Permanente Valorizado.
                    </p>
                  </div>
                </div>
                {data && !cargando && data.items.length > 0 && (
                  <Badge
                    variant="outline"
                    className="w-fit border-white/30 bg-white/10 text-white backdrop-blur-sm">
                    <CalendarDays className="size-3.5" />
                    Reporte al: {fechaCorta(data.fechaHasta)}
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
            <div className="ml-auto flex items-center gap-2">
              {data && !cargando && (
                <span className="whitespace-nowrap text-[11px] font-medium text-muted-foreground">
                  <span className="font-bold text-foreground">{data.items.length}</span>{" "}
                  {data.items.length === 1 ? "registro" : "registros"}
                </span>
              )}
              {hayFiltros && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={limpiar}
                  className="h-6 gap-1 text-[10px] text-muted-foreground hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                  Limpiar
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-5">
            <div className="space-y-0.5">
              <Label className="text-[10px] font-semibold text-muted-foreground">
                Producto
              </Label>
              <Combobox
                value={productoId}
                items={contexto.productos.map((p) => p.id)}
                onValueChange={(v) => {
                  setProductoId(v ?? "");
                  setLoteId("");
                }}
                itemToStringLabel={(val) => {
                  if (!val) return "";
                  const p = contexto.productos.find((x) => x.id === val);
                  return p ? `${p.codigo} — ${p.descripcion}` : "";
                }}>
                <ComboboxInput
                  placeholder="Todos los productos..."
                  className="h-8 text-[11px]"
                />
                <ComboboxContent>
                  <ComboboxList>
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
                Lote
              </Label>
              <Combobox
                value={loteId}
                items={productoLotes.map((l) => l.id)}
                onValueChange={(v) => setLoteId(v ?? "")}
                itemToStringLabel={(val) => {
                  if (!val) return "";
                  const l = contexto.lotes.find((x) => x.id === val);
                  return l ? l.codigo : "";
                }}>
                <ComboboxInput
                  placeholder="Todos los lotes..."
                  className="h-8 text-[11px]"
                />
                <ComboboxContent>
                  <ComboboxList>
                    {productoLotes.map((l) => (
                      <ComboboxItem key={l.id} value={l.id}>
                        {l.codigo}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                  <ComboboxEmpty>No se encontró el lote.</ComboboxEmpty>
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

            <div className="flex items-end">
              <Button
                onClick={consultar}
                disabled={cargando}
                className="h-8 w-full gap-1.5 bg-emerald-600 text-[11px] text-white hover:bg-emerald-700 shadow-md shadow-emerald-900/20 font-semibold">
                {cargando ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Search className="h-3.5 w-3.5" />
                )}
                {cargando ? "Consultando..." : "Consultar"}
              </Button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>
      </div>

      {cargando && (
        <div className="no-print flex items-center justify-center gap-2 rounded-xl border bg-card p-6 text-sm text-muted-foreground shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Consultando...
        </div>
      )}

      {data && !cargando && data.items.length === 0 && (
        <div className="no-print flex flex-col items-center justify-center gap-3 rounded-xl border bg-card p-12 text-center shadow-sm">
          <PackageSearch className="size-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            Sin registros para los filtros seleccionados.
          </p>
        </div>
      )}

      {data && !cargando && data.items.length > 0 && (
        <>
          {/* BOTONES EXPORTAR */}
          <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
                <FileSpreadsheet className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold tracking-wide">
                  Reporte General Base Activa
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  {data.items.length}{" "}
                  {data.items.length === 1 ? "registro" : "registros"} · Stock final{" "}
                  {fmt(data.stockFinalPeso)} KG
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
                className="h-8 gap-1.5 text-[11px] text-muted-foreground hover:text-foreground">
                <Printer className="h-3.5 w-3.5" />
                Imprimir
              </Button>
            </div>
          </div>

          {/* REPORTE */}
          <section data-report-print="true" className="rounded-xl border bg-card shadow-sm">
            {/* ENCABEZADO OFICIAL */}
            <div className="border-b p-6">
              <h3 className="mb-4 text-center text-sm font-bold uppercase tracking-wide text-foreground">
                Registro de Inventario Permanente Valorizado
                <br />
                <span className="text-xs">- Detalle del Inventario Valorizado - Base Activa</span>
              </h3>

              <div className="flex items-start justify-between">
                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="font-semibold text-foreground">PERÍODO:</span>{" "}
                    <span className="text-primary">{data.periodo}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">RUC:</span>{" "}
                    <span className="text-primary">{data.empresa.ruc}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">DENOMINACIÓN O RAZÓN SOCIAL:</span>{" "}
                    <span className="text-primary">{data.empresa.razonSocial}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">ESTABLECIMIENTO:</span>{" "}
                    <span className="text-primary">{data.establecimiento}</span>
                  </div>
                  {data.productoSeleccionado && (
                    <>
                      <div>
                        <span className="font-semibold text-foreground">CÓDIGO DE LA EXISTENCIA:</span>{" "}
                        <span className="text-primary">{data.productoSeleccionado.codigoExistencia}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-foreground">TIPO (TABLA 5):</span>{" "}
                        <span className="text-primary">{data.productoSeleccionado.tipoExistencia}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-foreground">DESCRIPCIÓN:</span>{" "}
                        <span className="text-primary">{data.productoSeleccionado.descripcion}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-foreground">CÓDIGO DE LA UNIDAD DE MEDIDA (TABLA 6):</span>{" "}
                        <span className="text-primary">{data.productoSeleccionado.unidadMedida}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-foreground">MÉTODO DE VALUACIÓN:</span>{" "}
                        <span className="text-primary">{data.productoSeleccionado.metodoValuacion}</span>
                      </div>
                    </>
                  )}
                </div>

                {data.empresa.logoUrl && (
                  <div className="h-16 w-16 flex-shrink-0">
                    <img
                      src={data.empresa.logoUrl}
                      alt="Logo"
                      className="h-full w-full object-contain"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* TABLA PRINCIPAL */}
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  {/* Fila de grupos */}
                  <tr>
                    <th
                      colSpan={5}
                      className="border border-emerald-700 bg-emerald-700 py-1.5 text-center text-[10px] font-bold uppercase text-white"
                    >
                      Detalle del Registro
                    </th>
                    <th
                      className="border border-emerald-700 bg-emerald-700 py-1.5 text-center text-[10px] font-bold uppercase text-white"
                    >
                      Tipo de Operación
                      <br />
                      <span className="text-[8px] font-normal">(Tabla 12)</span>
                    </th>
                    <th
                      colSpan={3}
                      className="border border-emerald-700 bg-emerald-700 py-1.5 text-center text-[10px] font-bold uppercase text-white"
                    >
                      Entradas
                    </th>
                    <th
                      colSpan={3}
                      className="border border-emerald-700 bg-emerald-700 py-1.5 text-center text-[10px] font-bold uppercase text-white"
                    >
                      Salidas
                    </th>
                    <th
                      colSpan={3}
                      className="border border-blue-600 bg-blue-600 py-1.5 text-center text-[10px] font-bold uppercase text-white"
                    >
                      Saldo Final
                    </th>
                    <th
                      colSpan={1}
                      className="border border-emerald-700 bg-emerald-700 py-1.5 text-center text-[10px] font-bold uppercase text-white"
                    >
                      Motivo de Salida
                      <br />
                      <span className="text-[8px] font-normal">Formulación</span>
                    </th>
                    <th
                      colSpan={3}
                      className="border border-emerald-200 dark:border-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 py-1.5 text-center text-[10px] font-bold uppercase text-emerald-900 dark:text-emerald-300"
                    >
                      Registro de Cantidad Final de Base Activa
                    </th>
                  </tr>
                  {/* Fila de sub-encabezados */}
                  <tr className="bg-emerald-50 dark:bg-emerald-950/40 text-[9px] font-semibold">
                    <th className="border px-1.5 py-1 text-center bg-muted/50">Fecha</th>
                    <th className="border px-1.5 py-1 text-center bg-muted/50">Código</th>
                    <th className="border px-1.5 py-1 text-center bg-muted/50">Descripción</th>
                    <th className="border px-1.5 py-1 text-center bg-muted/50">Observación</th>
                    <th className="border px-1.5 py-1 text-center bg-muted/50">Responsable del registro</th>
                    <th className="border px-1.5 py-1 text-center bg-muted/50">Tipo de Operación</th>
                    <th className="border px-1.5 py-1 text-center">UND</th>
                    <th className="border px-1.5 py-1 text-center">Peso Unitario</th>
                    <th className="border px-1.5 py-1 text-center">Peso Total</th>
                    <th className="border px-1.5 py-1 text-center">UND</th>
                    <th className="border px-1.5 py-1 text-center">Peso Unitario</th>
                    <th className="border px-1.5 py-1 text-center">Peso Total</th>
                    <th className="border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-1 text-center">UND</th>
                    <th className="border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-1 text-center">Peso Unitario</th>
                    <th className="border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-1 text-center">Peso Total</th>
                    <th className="border px-1.5 py-1 text-center">Tipo</th>
                    <th className="border border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-1 text-center">Resp. Formulación</th>
                    <th className="border border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-1 text-center">Cant. Prod. Formulado</th>
                    <th className="border border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-1 text-center">Almacenamiento</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30">
                      <td className="border px-1.5 py-1 text-center whitespace-nowrap">
                        {fechaCorta(item.fecha)}
                      </td>
                      <td className="border px-1.5 py-1 text-center font-medium">
                        {item.codigoLote}
                      </td>
                      <td className="border px-1.5 py-1">{item.descripcion}</td>
                      <td className="border px-1.5 py-1">{item.observacion ?? ""}</td>
                      <td className="border px-1.5 py-1">{item.responsableRegistro ?? ""}</td>
                      <td className="border px-1.5 py-1 text-center">{item.tipoOperacion}</td>
                      {/* Entradas */}
                      <td className="border px-1.5 py-1 text-right">
                        {item.entradaUnd ? fmtEntero(item.entradaUnd) : ""}
                      </td>
                      <td className="border px-1.5 py-1 text-right">
                        {item.entradaPesoUnitarioKg ? fmt(item.entradaPesoUnitarioKg) : ""}
                      </td>
                      <td className="border px-1.5 py-1 text-right">
                        {item.entradaPesoTotalKg ? fmt(item.entradaPesoTotalKg) : ""}
                      </td>
                      {/* Salidas */}
                      <td className="border px-1.5 py-1 text-right">
                        {item.salidaUnd ? fmtEntero(item.salidaUnd) : ""}
                      </td>
                      <td className="border px-1.5 py-1 text-right">
                        {item.salidaPesoUnitarioKg ? fmt(item.salidaPesoUnitarioKg) : ""}
                      </td>
                      <td className="border px-1.5 py-1 text-right">
                        {item.salidaPesoTotalKg ? fmt(item.salidaPesoTotalKg) : ""}
                      </td>
                      {/* Saldo */}
                      <td className="border border-blue-300 dark:border-blue-700 bg-blue-50/30 dark:bg-blue-950/20 px-1.5 py-1 text-right">
                        {fmtEntero(item.saldoUnd)}
                      </td>
                      <td className="border border-blue-300 dark:border-blue-700 bg-blue-50/30 dark:bg-blue-950/20 px-1.5 py-1 text-right">
                        {fmt(item.saldoPesoUnitarioKg)}
                      </td>
                      <td className="border border-blue-300 dark:border-blue-700 bg-blue-50/30 dark:bg-blue-950/20 px-1.5 py-1 text-right font-medium">
                        {fmt(item.saldoPesoTotalKg)}
                      </td>
                      {/* Formulación */}
                      <td className="border px-1.5 py-1 text-center">
                        {item.formulacion ?? ""}
                      </td>
                      {/* Cantidad final */}
                      <td className="border border-emerald-200 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/20 px-1.5 py-1">
                        {item.responsableFormulacion ?? ""}
                      </td>
                      <td className="border border-emerald-200 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/20 px-1.5 py-1 text-right">
                        {item.cantidadProductoFormulado != null
                          ? fmt(item.cantidadProductoFormulado)
                          : ""}
                      </td>
                      <td className="border border-emerald-200 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/20 px-1.5 py-1">
                        {item.almacenamientoNombre ?? ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-emerald-50 dark:bg-emerald-950/40 font-semibold">
                    <td
                      colSpan={6}
                      className="border px-1.5 py-1.5 text-center text-xs text-emerald-800 dark:text-emerald-300"
                    >
                      TOTALES
                    </td>
                    <td className="border px-1.5 py-1.5 text-right">
                      {fmtEntero(data.totalEntradasUnd)}
                    </td>
                    <td className="border px-1.5 py-1.5 text-right">-</td>
                    <td className="border px-1.5 py-1.5 text-right">
                      {fmt(data.totalEntradasPeso)}
                    </td>
                    <td className="border px-1.5 py-1.5 text-right">
                      {fmtEntero(data.totalSalidasUnd)}
                    </td>
                    <td className="border px-1.5 py-1.5 text-right">-</td>
                    <td className="border px-1.5 py-1.5 text-right">
                      {fmt(data.totalSalidasPeso)}
                    </td>
                    <td className="border border-blue-300 dark:border-blue-700 bg-blue-100 dark:bg-blue-950/60 px-1.5 py-1.5 text-right">
                      -
                    </td>
                    <td className="border border-blue-300 dark:border-blue-700 bg-blue-100 dark:bg-blue-950/60 px-1.5 py-1.5 text-right">
                      -
                    </td>
                    <td className="border border-blue-300 dark:border-blue-700 bg-blue-100 dark:bg-blue-950/60 px-1.5 py-1.5 text-right font-bold">
                      {fmt(data.stockFinalPeso)}
                    </td>
                    <td className="border px-1.5 py-1.5" />
                    <td className="border border-emerald-200 dark:border-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-1.5" />
                    <td className="border border-emerald-200 dark:border-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-1.5" />
                    <td className="border border-emerald-200 dark:border-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-1.5" />
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* STOCK FINAL */}
            <div className="border-t p-4 text-center bg-card">
              <span className="text-sm font-bold text-primary">
                STOCK AL {fechaCorta(data.fechaHasta)}: {fmt(data.stockFinalPeso)} KG
              </span>
            </div>

            {/* INFORME / FIRMAS */}
            {/* <div className="flex items-end justify-between border-t px-6 py-4 bg-card">
              <div className="text-xs text-muted-foreground">
                Informe al: {fechaCorta(data.fechaHasta)}
              </div>
              <div className="text-center text-xs">
                <div className="mb-8 w-48 border-b border-muted-foreground" />
                <div className="font-semibold text-foreground">Elaborado por:</div>
                <div className="font-bold text-foreground">
                  {data.empresa.responsableReporte ?? "Responsable"}
                </div>
                <div className="text-muted-foreground">
                  {data.empresa.cargoReporte ?? "Responsable de Almacén"}
                </div>
              </div>
              <div className="text-center text-xs">
                <div className="mb-8 w-48 border-b border-muted-foreground" />
                <div className="font-semibold text-foreground">Aprobado por:</div>
                <div className="font-bold text-foreground">Ing. Responsable</div>
              </div>
            </div> */}
          </section>
        </>
      )}
          </div>
        </div>
      </div>
    </div>
  );
}