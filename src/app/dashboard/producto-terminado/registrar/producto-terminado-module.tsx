"use client";

import { useMemo, useState, useTransition, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  registrarMovimientoPT,
  obtenerStockPT,
  eliminarMovimientoPT,
  actualizarMovimientoPT,
} from "@/actions/producto-terminado.actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  PackageSearch,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  RotateCcw,
  FileSpreadsheet,
  FileText,
  Printer,
  SlidersHorizontal,
  X,
  ClipboardList,
  Layers,
  Coins,
  Save,
  Loader2,
  CalendarDays,
  Pencil,
  Trash2,
} from "lucide-react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

type StockInfo = { stock: number; costoValorizado: number };

export function ProductoTerminadoModule({ data }: { data: any }) {
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [editando, setEditando] = useState<any | null>(null);
  const [eliminando, setEliminando] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [tipo, setTipo] = useState<"ENTRADA" | "SALIDA">("ENTRADA");
  const [productoId, setProductoId] = useState("");
  const [presentacionId, setPresentacionId] = useState("");
  const [periodoId, setPeriodoId] = useState("");
  const [establecimientoId, setEstablecimientoId] = useState("");
  const [tipoOperacionId, setTipoOperacionId] = useState("");
  const [motivo, setMotivo] = useState("");
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null);
  const [message, setMessage] = useState("");
  const [filtroProducto, setFiltroProducto] = useState("todos");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [costoUnitario, setCostoUnitario] = useState("0");
  const [ingCampo, setIngCampo] = useState("NO");

  const presentations = useMemo(
    () =>
      data.presentaciones.filter(
        (p: any) => String(p.productoId) === productoId,
      ),
    [data.presentaciones, productoId],
  );

  const movimientosFiltrados = useMemo(() => {
    let filtered = data.movimientos;
    if (filtroProducto !== "todos") {
      filtered = filtered.filter((m: any) => m.productoId === filtroProducto);
    }
    if (filtroTipo !== "todos") {
      filtered = filtered.filter((m: any) => m.tipoMovimiento === filtroTipo);
    }
    if (fechaDesde) {
      filtered = filtered.filter((m: any) => {
        const f = new Date(m.fecha).toISOString().slice(0, 10);
        return f >= fechaDesde;
      });
    }
    if (fechaHasta) {
      filtered = filtered.filter((m: any) => {
        const f = new Date(m.fecha).toISOString().slice(0, 10);
        return f <= fechaHasta;
      });
    }
    return filtered;
  }, [data.movimientos, filtroProducto, filtroTipo, fechaDesde, fechaHasta]);

  const totales = useMemo(
    () =>
      movimientosFiltrados.reduce(
        (acc: any, m: any) => {
          if (m.tipoMovimiento === "ENTRADA") {
            acc.entradaCan += Number(m.entradaCan) || 0;
            acc.entradaCostoTotal += Number(m.entradaCostoTotal) || 0;
          }
          if (m.tipoMovimiento === "SALIDA") {
            acc.salidaCan += Number(m.salidaCan) || 0;
            acc.salidaCostoTotal += Number(m.salidaCostoTotal) || 0;
          }
          return acc;
        },
        {
          entradaCan: 0,
          entradaCostoTotal: 0,
          salidaCan: 0,
          salidaCostoTotal: 0,
        },
      ),
    [movimientosFiltrados],
  );

  const formatNumber = (value: unknown) => {
    const number = Number(value);
    return Number.isFinite(number) && number !== 0
      ? number.toLocaleString("es-PE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : "—";
  };

  const handleProductoChange = useCallback(
    async (id: string | null, presId?: string) => {
      const idv = id ?? "";
      setProductoId(idv);
      setPresentacionId(presId ?? "");
      if (idv) {
        const result = await obtenerStockPT(idv, presId ?? null);
        if (result.ok) {
          setStockInfo({
            stock: result.stock,
            costoValorizado: result.costoValorizado,
          });
        }
      } else {
        setStockInfo(null);
      }
    },
    [],
  );

  const handlePresentacionChange = useCallback(
    async (presId: string | null) => {
      const presIdv = presId ?? "";
      setPresentacionId(presIdv);
      if (productoId) {
        const result = await obtenerStockPT(productoId, presIdv || null);
        if (result.ok) {
          setStockInfo({
            stock: result.stock,
            costoValorizado: result.costoValorizado,
          });
        }
      }
    },
    [productoId],
  );

  function aplicarHoy() {
    const d = new Date();
    const hoy = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    setFechaDesde(hoy);
    setFechaHasta(hoy);
  }

  function limpiar() {
    setFiltroProducto("todos");
    setFiltroTipo("todos");
    setFechaDesde("");
    setFechaHasta("");
  }

  function openModal(row?: any) {
    if (row) {
      setEditando(row);
      setTipo(row.tipoMovimiento);
      setProductoId(row.productoId);
      setPresentacionId(row.presentacionId ?? "");
      setPeriodoId(row.periodoId);
      setEstablecimientoId(row.establecimientoId);
      setTipoOperacionId(row.tipoOperacionId ?? "");
      setMotivo(row.motivo ?? "");
      setStockInfo(null);
      setMessage("");
      setCantidad(String(row.tipoMovimiento === "ENTRADA" ? row.entradaCan : row.salidaCan));
      setCostoUnitario(String(row.tipoMovimiento === "ENTRADA" ? row.entradaCostoUnitario : "0"));
      setIngCampo(row.ingCampo ?? "NO");
    } else {
      setEditando(null);
      setTipo("ENTRADA");
      setProductoId("");
      setPresentacionId("");
      setPeriodoId("");
      setEstablecimientoId("");
      setTipoOperacionId(data.operaciones[0]?.id ?? "");
      setMotivo("");
      setStockInfo(null);
      setMessage("");
      setCantidad("");
      setCostoUnitario("0");
      setMotivo("VENTA");
      setIngCampo("NO");
      setPeriodoId(data.periodos[0]?.id ?? "");
      setEstablecimientoId(data.establecimientos[0]?.id ?? "");
    }
    setModalOpen(true);
  }

  function submit(form: HTMLFormElement) {
    setMessage("");
    const fd = new FormData(form);
    fd.set("productoId", productoId);
    fd.set("presentacionId", presentacionId || "");
    fd.set("periodoId", periodoId);
    fd.set("establecimientoId", establecimientoId);
    fd.set("tipoOperacionId", tipoOperacionId || "");
    fd.set("tipoMovimiento", tipo);
    fd.set("cantidad", cantidad);
    fd.set("costoUnitario", costoUnitario);
    fd.set("ingCampo", ingCampo);
    if (tipo === "SALIDA" && motivo) {
      fd.set("motivo", motivo);
    } else {
      fd.delete("motivo");
    }
    startTransition(async () => {
      let result;
      if (editando) {
        result = await actualizarMovimientoPT(editando.id, fd);
      } else {
        result = await registrarMovimientoPT(fd);
      }
      setMessage(result.message);
      if (result.ok) {
        setEditando(null);
        setModalOpen(false);
        toast.success(result.message);
        router.refresh();
      }
    });
  }

  function confirmarEliminar() {
    if (!eliminando) return;
    startDeleteTransition(async () => {
      const result = await eliminarMovimientoPT(eliminando.id);
      if (result.ok) {
        toast.success(result.message);
        setEliminando(null);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  const selectedProduct = data.productos.find((p: any) => p.id === productoId);
  const selectedPres = data.presentaciones.find(
    (p: any) => p.id === presentacionId,
  );

  function exportarExcel() {
    const header = [
      "FECHA", "SERIE", "NÚMERO", "OBSERVACIÓN", "RESPONSABLE",
      "TIPO DE OPERACIÓN",
      "ENTRADA CAN", "ENTRADA C.UNT", "ENTRADA COSTO TOTAL",
      "SALIDA CAN", "SALIDA C.UNT", "SALIDA C.TOTAL",
      "SALDO CAN", "SALDO C.UNT", "SALDO C.TOTAL",
      "PRODUCCIÓN", "VENTA", "ENSAYO",
      "FACTURA/GUÍA", "EMPRESA", "ING. DE CAMPO",
    ];
    const aoa = [
      header,
      ...movimientosFiltrados.map((m: any) => [
        new Date(m.fecha).toISOString().slice(0, 10),
        m.serie ?? "",
        m.numero ?? "",
        m.observacion ?? "",
        m.responsableDespacho ?? "",
        m.tipoOperacion?.nombre ?? m.tipoOperacion?.codigo ?? "",
        m.tipoMovimiento === "ENTRADA" ? Number(m.entradaCan) : "",
        m.tipoMovimiento === "ENTRADA" ? Number(m.entradaCostoUnitario) : "",
        m.tipoMovimiento === "ENTRADA" ? Number(m.entradaCostoTotal) : "",
        m.tipoMovimiento === "SALIDA" ? Number(m.salidaCan) : "",
        m.tipoMovimiento === "SALIDA" ? Number(m.salidaCostoUnitario) : "",
        m.tipoMovimiento === "SALIDA" ? Number(m.salidaCostoTotal) : "",
        m.saldo ?? "",
        m.costoUnitarioSaldo ?? "",
        m.costoTotalSaldo ?? "",
        m.motivo === "PRODUCCION" ? "X" : "",
        m.motivo === "VENTA" ? "X" : "",
        m.motivo === "ENSAYO" ? "X" : "",
        m.facturaGuia ?? "",
        m.empresaDestino ?? "",
        m.ingCampo ?? "",
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Kardex PT");
    XLSX.writeFile(
      wb,
      `kardex_producto_terminado_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  }

  function exportarPDF() {
    const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 10;

    doc.setFillColor(6, 78, 59);
    doc.rect(0, 0, pageW, 18, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("KARDEX DE PRODUCTO TERMINADO", pageW / 2, 8, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("MÉTODO DE VALUACIÓN: PEPS", pageW / 2, 13, { align: "center" });

    autoTable(doc, {
      startY: 22,
      margin: { left: margin, right: margin },
      head: [[
        "FECHA", "DOC. TRASLADO", "NÚM", "OBSERVACIÓN", "RESPONSABLE",
        "TIPO OPERACIÓN",
        "ENT CAN", "ENT C.UNT", "ENT COSTO",
        "SAL CAN", "SAL C.UNT", "SAL COSTO",
        "SALDO CAN", "SALDO C.UNT", "SALDO COSTO",
        "PROD", "VENTA", "ENSAYO",
        "FACTURA/GUÍA", "EMPRESA", "ING. CAMPO",
      ]],
      body: movimientosFiltrados.map((m: any) => [
        new Date(m.fecha).toLocaleDateString("es-PE"),
        [m.serie, m.numero].filter(Boolean).join("-") || "—",
        m.numero ?? "—",
        m.observacion ?? "—",
        m.responsableDespacho ?? "—",
        m.tipoOperacion?.nombre ?? m.tipoOperacion?.codigo ?? "—",
        m.tipoMovimiento === "ENTRADA" ? Number(m.entradaCan).toFixed(2) : "",
        m.tipoMovimiento === "ENTRADA" ? Number(m.entradaCostoUnitario).toFixed(2) : "",
        m.tipoMovimiento === "ENTRADA" ? Number(m.entradaCostoTotal).toFixed(2) : "",
        m.tipoMovimiento === "SALIDA" ? Number(m.salidaCan).toFixed(2) : "",
        m.tipoMovimiento === "SALIDA" ? Number(m.salidaCostoUnitario).toFixed(2) : "",
        m.tipoMovimiento === "SALIDA" ? Number(m.salidaCostoTotal).toFixed(2) : "",
        m.saldo ?? "—",
        m.costoUnitarioSaldo ?? "—",
        m.costoTotalSaldo ?? "—",
        m.motivo === "PRODUCCION" ? "X" : "",
        m.motivo === "VENTA" ? "X" : "",
        m.motivo === "ENSAYO" ? "X" : "",
        m.facturaGuia ?? "—",
        m.empresaDestino ?? "—",
        m.ingCampo ?? "—",
      ]),
      styles: { fontSize: 6, cellPadding: 1.5, textColor: [30, 41, 59] },
      headStyles: { fillColor: [6, 78, 59], textColor: 255, fontStyle: "bold" },
      didDrawPage: () => {
        doc.setFillColor(6, 78, 59);
        doc.rect(0, 0, pageW, 18, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("KARDEX DE PRODUCTO TERMINADO", pageW / 2, 8, { align: "center" });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text("MÉTODO DE VALUACIÓN: PEPS", pageW / 2, 13, { align: "center" });
      },
    });
    doc.save(`kardex_producto_terminado_${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  function imprimir() {
    if (typeof document === "undefined") return;
    window.print();
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-3 md:py-4 px-4 lg:px-6">
          {/* HEADER */}
          <div className="relative overflow-hidden rounded-xl border p-4 text-white shadow-lg shadow-emerald-500/20">
            <div className="absolute -right-8 -top-2 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/10 blur-xl" />
            <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-base font-bold tracking-tight md:text-lg">
                    KARDEX DE PRODUCTO TERMINADO
                  </h1>
                  <p className="text-xs text-zinc-200">
                    PRODUCTO TERMINADO
                    <span className="mx-1.5 text-white/40">·</span>
                    Registro de producción, ventas y ensayos - Método PEPS
                  </p>
                </div>
              </div>
              <Button
                onClick={() => openModal()}
                className="w-fit gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-900/20 font-semibold">
                <Plus className="h-4 w-4" />
                Registrar Movimiento
              </Button>
            </div>
          </div>

          {/* INDICADORES */}
          {/* <div className="no-print grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="group relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md dark:hover:border-emerald-800">
              <div className="relative">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 text-[12px] font-semibold">
                    Entradas
                  </Badge>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                    {data.resumen.totalEntradas.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">Total entradas (UND)</p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-all hover:border-red-200 hover:shadow-md dark:hover:border-red-800">
              <div className="relative">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400">
                    <TrendingDown className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400 text-[12px] font-semibold">
                    Salidas
                  </Badge>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold tabular-nums text-red-600 dark:text-red-400">
                    {data.resumen.totalSalidas.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">Total salidas (UND)</p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-all hover:border-sky-200 hover:shadow-md dark:hover:border-sky-800">
              <div className="relative">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400">
                    <PackageSearch className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-400 text-[12px] font-semibold">
                    Stock Actual
                  </Badge>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold tabular-nums text-sky-600 dark:text-sky-400">
                    {data.resumen.stockActual.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">Stock saldo actual (UND)</p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-all hover:border-violet-200 hover:shadow-md dark:hover:border-violet-800">
              <div className="relative">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-400">
                    <Coins className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-400 text-[12px] font-semibold">
                    Costo Total
                  </Badge>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold tabular-nums text-violet-600 dark:text-violet-400">
                    S/ {data.resumen.costoValorizadoTotal.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">Costo valorizado total</p>
                </div>
              </div>
            </div>
          </div> */}

          {/* FILTROS */}
          <div className="no-print rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex flex-col gap-3">
              <div className="mb-1 flex items-center gap-2">
                <SlidersHorizontal className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">
                  Filtros
                </span>
                <div className="ml-auto flex items-center gap-2">
                  <span className="whitespace-nowrap text-[11px] font-medium text-muted-foreground">
                    <span className="font-bold text-foreground">{movimientosFiltrados.length}</span>{" "}
                    {movimientosFiltrados.length === 1 ? "registro" : "registros"}
                  </span>
                  {(filtroProducto !== "todos" || filtroTipo !== "todos" || fechaDesde || fechaHasta) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={limpiar}
                      className="h-6 gap-1 text-[12px] text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                      Limpiar
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-5">
                <div className="space-y-0.5">
                  <Label className="text-[12px] font-semibold text-muted-foreground">
                    Producto
                  </Label>
                  <Combobox
                    value={filtroProducto === "todos" ? "" : filtroProducto}
                    items={data.productos.map((p: any) => p.id)}
                    onValueChange={(v) => setFiltroProducto(v ?? "todos")}
                    itemToStringLabel={(val) => {
                      if (!val) return "Todos los productos";
                      const p = data.productos.find((x: any) => x.id === val);
                      return p ? `${p.codigo} — ${p.descripcion}` : "";
                    }}>
                    <ComboboxInput
                      placeholder="Todos los productos..."
                      className="h-8 text-[11px]"
                    />
                    <ComboboxContent>
                      <ComboboxList>
                        {data.productos.map((p: any) => (
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
                  <Label className="text-[12px] font-semibold text-muted-foreground">
                    Tipo
                  </Label>
                  <Select
                    value={filtroTipo}
                    onValueChange={(v) => setFiltroTipo(v ?? "todos")}>
                    <SelectTrigger className="h-8 w-full">
                      <SelectValue placeholder="Todos los tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los tipos</SelectItem>
                      <SelectItem value="ENTRADA">Entradas</SelectItem>
                      <SelectItem value="SALIDA">Salidas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-0.5">
                  <Label className="text-[12px] font-semibold text-muted-foreground">
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
                  <Label className="text-[12px] font-semibold text-muted-foreground">
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
                    variant="outline"
                    size="sm"
                    onClick={aplicarHoy}
                    className="h-8 gap-1.5 border-emerald-300 text-[11px] text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Hoy
                  </Button>
                  <Button
                    variant="outline"
                    onClick={limpiar}
                    className="h-8 gap-1.5 text-[11px] text-muted-foreground hover:text-foreground">
                    <RotateCcw className="h-3.5 w-3.5" />
                    Limpiar
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {movimientosFiltrados.length > 0 && (
            <>
              {/* BOTONES EXPORTAR */}
              {/* <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
                    <FileSpreadsheet className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold tracking-wide">
                      Kardex Producto Terminado
                    </h2>
                    <p className="text-[11px] text-muted-foreground">
                      {movimientosFiltrados.length}{" "}
                      {movimientosFiltrados.length === 1 ? "movimiento" : "movimientos"} · Método PEPS
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
                    onClick={exportarPDF}
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
              </div> */}

              {/* TABLA KARDEX */}
              <section data-report-print="true" className="border rounded-2xl bg-card shadow-sm">
                
                <div className="overflow-x-auto ">
                  <table className="w-full  text-[11px]">
                    <thead>
                      <tr>
                        <th rowSpan={2} className="border border-emerald-700 bg-emerald-700 py-1.5 text-center text-[12px] font-bold uppercase text-white">
                          Fecha
                        </th>
                        <th colSpan={4} className="border border-emerald-700 bg-emerald-700 py-1.5 text-center text-[12px] font-bold uppercase text-white">
                          Documento de traslado / comprobante
                        </th>
                        <th rowSpan={2} className="border border-emerald-700 bg-emerald-700 py-1.5 text-center text-[12px] font-bold uppercase text-white">
                          Operación
                        </th>
                        <th colSpan={3} className="border border-emerald-700 bg-emerald-700 py-1.5 text-center text-[12px] font-bold uppercase text-white">
                          Entradas
                        </th>
                        <th colSpan={3} className="border border-emerald-700 bg-emerald-700 py-1.5 text-center text-[12px] font-bold uppercase text-white">
                          Salidas
                        </th>
                        <th colSpan={3} className="border border-blue-600 bg-blue-600 py-1.5 text-center text-[12px] font-bold uppercase text-white">
                          Saldo final
                        </th>
                        <th colSpan={3} className="border border-emerald-200 dark:border-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 py-1.5 text-center text-[12px] font-bold uppercase text-emerald-900 dark:text-emerald-300">
                          Motivo de salida
                        </th>
                        <th rowSpan={2} className="border border-emerald-200 dark:border-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 py-1.5 text-center text-[12px] font-bold uppercase text-emerald-900 dark:text-emerald-300">
                          Factura / guía
                        </th>
                        <th rowSpan={2} className="border border-emerald-200 dark:border-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 py-1.5 text-center text-[12px] font-bold uppercase text-emerald-900 dark:text-emerald-300">
                          Empresa
                        </th>
                        <th rowSpan={2} className="border border-emerald-200 dark:border-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 py-1.5 text-center text-[12px] font-bold uppercase text-emerald-900 dark:text-emerald-300">
                          Ing. campo
                        </th>
                        <th rowSpan={2} className="border border-emerald-200 dark:border-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 py-1.5 text-center text-[12px] font-bold uppercase text-emerald-900 dark:text-emerald-300">
                          Acciones
                        </th>
                      </tr>
                      <tr className="bg-emerald-50 dark:bg-emerald-950/40 text-[9px] font-semibold">
                        <th className="border px-1.5 py-1 text-center bg-muted/50">Serie</th>
                        <th className="border px-1.5 py-1 text-center bg-muted/50">Núm</th>
                        <th className="border px-1.5 py-1 text-center bg-muted/50">Observación</th>
                        <th className="border px-1.5 py-1 text-center bg-muted/50">Responsable</th>
                        <th className="border px-1.5 py-1 text-center">CAN</th>
                        <th className="border px-1.5 py-1 text-center">C. UNT</th>
                        <th className="border px-1.5 py-1 text-center">Costo Total</th>
                        <th className="border px-1.5 py-1 text-center">CAN</th>
                        <th className="border px-1.5 py-1 text-center">C. UNT</th>
                        <th className="border px-1.5 py-1 text-center">C. Total</th>
                        <th className="border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-1 text-center">CAN</th>
                        <th className="border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-1 text-center">C. UNT</th>
                        <th className="border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-1 text-center">C. Total</th>
                        <th className="border border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-1 text-center">Prod.</th>
                        <th className="border border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-1 text-center">Venta</th>
                        <th className="border border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-1 text-center">Ensayo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movimientosFiltrados.map((m: any) => (
                        <tr
                          key={m.id}
                          className={`hover:bg-muted/30 ${m.tipoMovimiento === "SALIDA" ? "bg-red-50/40 dark:bg-red-950/10" : "bg-emerald-50/30 dark:bg-emerald-950/5"}`}>
                          <td className="border px-1.5 py-1 text-center whitespace-nowrap">
                            {new Date(m.fecha).toLocaleDateString("es-PE")}
                          </td>
                          <td className="border px-1.5 py-1 text-center">{m.serie ?? "—"}</td>
                          <td className="border px-1.5 py-1 text-center">{m.numero ?? "—"}</td>
                          <td className="border px-1.5 py-1 text-left">{m.observacion ?? "—"}</td>
                          <td className="border px-1.5 py-1 text-left">{m.responsableDespacho ?? "—"}</td>
                          <td className="border px-1.5 py-1 text-center">
                            <Badge
                              variant="outline"
                              className={`whitespace-nowrap text-[9px] font-semibold ${
                                m.tipoMovimiento === "SALIDA"
                                  ? "border-red-200 bg-red-100/60 text-red-700 dark:border-red-900 dark:bg-red-900/30 dark:text-red-300"
                                  : "border-emerald-200 bg-emerald-100/60 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-300"
                              }`}>
                              {m.tipoOperacion?.nombre ?? m.tipoOperacion?.codigo ?? "—"}
                            </Badge>
                          </td>
                          {/* Entradas */}
                          <td className="border px-1.5 py-1 text-right font-medium text-emerald-600 dark:text-emerald-400">
                            {m.tipoMovimiento === "ENTRADA" ? formatNumber(m.entradaCan) : "—"}
                          </td>
                          <td className="border px-1.5 py-1 text-right text-muted-foreground">
                            {m.tipoMovimiento === "ENTRADA" ? formatNumber(m.entradaCostoUnitario) : "—"}
                          </td>
                          <td className="border px-1.5 py-1 text-right font-medium text-emerald-600 dark:text-emerald-400">
                            {m.tipoMovimiento === "ENTRADA" ? formatNumber(m.entradaCostoTotal) : "—"}
                          </td>
                          {/* Salidas */}
                          <td className="border px-1.5 py-1 text-right font-medium text-red-500">
                            {m.tipoMovimiento === "SALIDA" ? formatNumber(m.salidaCan) : "—"}
                          </td>
                          <td className="border px-1.5 py-1 text-right text-muted-foreground">
                            {m.tipoMovimiento === "SALIDA" ? formatNumber(m.salidaCostoUnitario) : "—"}
                          </td>
                          <td className="border px-1.5 py-1 text-right font-medium text-red-500">
                            {m.tipoMovimiento === "SALIDA" ? formatNumber(m.salidaCostoTotal) : "—"}
                          </td>
                          {/* Saldo */}
                          <td className="border border-blue-300 dark:border-blue-700 bg-blue-50/30 dark:bg-blue-950/20 px-1.5 py-1 text-right font-medium">
                            {formatNumber(m.saldo)}
                          </td>
                          <td className="border border-blue-300 dark:border-blue-700 bg-blue-50/30 dark:bg-blue-950/20 px-1.5 py-1 text-right text-muted-foreground">
                            {formatNumber(m.costoUnitarioSaldo)}
                          </td>
                          <td className="border border-blue-300 dark:border-blue-700 bg-blue-50/30 dark:bg-blue-950/20 px-1.5 py-1 text-right font-semibold text-blue-500">
                            {formatNumber(m.costoTotalSaldo)}
                          </td>
                          {/* Motivo */}
                          <td className="border border-emerald-200 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/20 px-1.5 py-1 text-center">
                            {m.motivo === "PRODUCCION" ? "X" : ""}
                          </td>
                          <td className="border border-emerald-200 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/20 px-1.5 py-1 text-center">
                            {m.motivo === "VENTA" ? "X" : ""}
                          </td>
                          <td className="border border-emerald-200 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/20 px-1.5 py-1 text-center">
                            {m.motivo === "ENSAYO" ? "X" : ""}
                          </td>
                          {/* Info */}
                          <td className="border border-emerald-200 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/20 px-1.5 py-1 text-center">
                            {m.facturaGuia ?? "—"}
                          </td>
                          <td className="border border-emerald-200 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/20 px-1.5 py-1">
                            {m.empresaDestino ?? "—"}
                          </td>
                          <td className="border border-emerald-200 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/20 px-1.5 py-1 text-center">
                            {m.ingCampo ?? "—"}
                          </td>
                          <td className="border border-emerald-200 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/20 px-1 py-1">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                title="Editar"
                                onClick={() => openModal(m)}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary">
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                title="Eliminar"
                                onClick={() => setEliminando(m)}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
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
                          {formatNumber(totales.entradaCan)}
                        </td>
                        <td className="border px-1.5 py-1.5 text-right">-</td>
                        <td className="border px-1.5 py-1.5 text-right">
                          {formatNumber(totales.entradaCostoTotal)}
                        </td>
                        <td className="border px-1.5 py-1.5 text-right">
                          {formatNumber(totales.salidaCan)}
                        </td>
                        <td className="border px-1.5 py-1.5 text-right">-</td>
                        <td className="border px-1.5 py-1.5 text-right">
                          {formatNumber(totales.salidaCostoTotal)}
                        </td>
                        <td colSpan={11} />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </section>
            </>
          )}

          {movimientosFiltrados.length === 0 && (
            <div className="no-print flex flex-col items-center justify-center gap-3 rounded-xl border bg-card p-12 text-center shadow-sm">
              <PackageSearch className="size-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                No se encontraron movimientos de producto terminado.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL FORM - SIN CAMBIOS */}
      <Dialog open={modalOpen} onOpenChange={(open) => { setModalOpen(open); if (!open) setEditando(null); }}>
        <DialogContent
          key="pt-modal"
          className="max-w-225! w-full gap-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-0 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
          <DialogHeader className="flex-row items-center justify-between space-y-0 bg-slate-900 px-6 py-4 text-white">
            <DialogTitle className="flex items-center gap-2 text-base">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              {editando ? "Editar Movimiento Kardex" : "Registrar Nuevo Movimiento Kardex"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={e => {
              e.preventDefault();
              submit(e.currentTarget);
            }}>
            <div className="flex max-h-[85vh] flex-col gap-4 overflow-y-auto bg-white p-6 text-xs text-foreground dark:bg-slate-950">
              {/* SECCION 1 */}
              <section className="order-1 space-y-3 rounded-xl border border-sky-200 bg-sky-50/70 p-4 dark:border-sky-900 dark:bg-sky-950/20">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  <h3 className="font-bold uppercase tracking-wide text-sky-900 dark:text-sky-200">
                    Producto PT / Presentación *
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                  <div className="space-y-1 md:col-span-8">
                    <Label className="font-semibold text-slate-700 dark:text-slate-300">
                      Producto
                    </Label>
                    <Combobox
                      value={productoId}
                      onValueChange={v => handleProductoChange(v)}
                      itemToStringLabel={v => {
                        const p = data.productos.find((x: any) => x.id === v);
                        return p ? `${p.codigo} — ${p.descripcion}` : "";
                      }}>
                      <ComboboxInput
                        placeholder="Buscar Producto Terminado..."
                        className="h-9 border-sky-300 bg-white font-semibold dark:bg-slate-950"
                      />
                      <ComboboxContent>
                        <ComboboxList>
                          {data.productos.map((p: any) => (
                            <ComboboxItem key={p.id} value={p.id}>
                              {p.codigo} — {p.descripcion}
                            </ComboboxItem>
                          ))}
                        </ComboboxList>
                        <ComboboxEmpty>
                          No se encontró el producto.
                        </ComboboxEmpty>
                      </ComboboxContent>
                    </Combobox>
                  </div>
                  <div className="space-y-1 md:col-span-4">
                    <Label className="font-semibold text-slate-700 dark:text-slate-300">
                      Presentación
                    </Label>
                    <Select
                      value={presentacionId || "none"}
                      onValueChange={v =>
                        handlePresentacionChange(v === "none" ? "" : v)
                      }>
                      <SelectTrigger className="h-9 w-full border-sky-300 bg-white dark:bg-slate-950">
                        {presentations.find((p: any) => p.id === presentacionId)
                          ?.nombre ?? (
                          <SelectValue placeholder="Sin presentación" />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin presentación</SelectItem>
                        {presentations.map((p: any) => (
                          <SelectItem
                            key={p.id}
                            value={p.id}
                            className="text-xs">
                            {p.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {stockInfo && (
                  <div className="flex items-center justify-between rounded-lg border border-sky-300 bg-white px-4 py-2.5 dark:bg-slate-950">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Stock disponible actual
                    </span>
                    <span className="rounded-lg border border-sky-300 px-3 py-1 font-mono font-bold text-sky-700 dark:text-sky-300">
                      {stockInfo.stock.toLocaleString("es-PE", {
                        minimumFractionDigits: 2,
                      })}{" "}
                      {selectedPres?.unidadMedida?.nombre ??
                        selectedProduct?.unidadMedida?.nombre ??
                        "UND"}
                    </span>
                  </div>
                )}
              </section>

              {/* SECCION 2 */}
              <section className="order-2 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-200 dark:bg-slate-800">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  </span>
                  <h3 className="font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                    Documento de traslado y responsable
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                  <div className="space-y-1 md:col-span-4">
                    <Label>Fecha *</Label>
                    <Input
                      name="fecha"
                      type="date"
                      required
                      defaultValue={new Date().toISOString().slice(0, 10)}
                      className="h-10 bg-white dark:bg-slate-950"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-4">
                    <Label>Serie</Label>
                    <Input
                      name="serie"
                      placeholder="Ej: E001"
                      className="h-10 bg-white dark:bg-slate-950"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-4">
                    <Label>Número</Label>
                    <Input
                      name="numero"
                      placeholder="Ej: 1852"
                      className="h-10 bg-white dark:bg-slate-950"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-4">
                    <Label>Observación (Área)</Label>
                    <Input
                      name="observacion"
                      placeholder="Ej: Almacén PT / Área Tricho"
                      className="h-10 bg-white dark:bg-slate-950"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-8">
                    <Label>Responsable</Label>
                    <Input
                      name="responsableDespacho"
                      placeholder="Ej: YOBER GARCIA"
                      className="h-10 bg-white dark:bg-slate-950"
                    />
                  </div>
                </div>
              </section>

              {/* SECCION 3 */}
              <section className="order-3 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-200 dark:bg-slate-800">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  </span>
                  <h3 className="font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                    Tipo de operación y detalle
                  </h3>
                </div>
                <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-3">
                  <div className="space-y-1">
                    <Label>Tipo de Operación *</Label>
                    <Select
                      value={tipoOperacionId}
                      onValueChange={v => {
                        const operation = data.operaciones.find(
                          (op: any) => op.id === v,
                        );
                        setTipoOperacionId(v ?? "");
                        setTipo(
                          /salida/i.test(
                            `${operation?.codigo ?? ""} ${operation?.nombre ?? ""}`,
                          )
                            ? "SALIDA"
                            : "ENTRADA",
                        );
                      }}>
                      <SelectTrigger className="h-10 bg-white dark:bg-slate-950">
                        <SelectValue placeholder="Seleccionar operación..." />
                      </SelectTrigger>
                      <SelectContent>
                        {data.operaciones.map((op: any) => (
                          <SelectItem key={op.id} value={op.id}>
                            {op.nombre} ({op.codigo})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Cantidad (CAN) *</Label>
                    <Input
                      name="cantidad"
                      type="number"
                      min="0.01"
                      step="0.01"
                      required
                      value={cantidad}
                      onChange={e => setCantidad(e.target.value)}
                      placeholder="0"
                      className="h-10 bg-white text-xs font-semibold dark:bg-slate-950"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Costo Unitario (S/)</Label>
                    <Input
                      name="costoUnitario"
                      type="number"
                      min="0"
                      step="0.01"
                      value={costoUnitario}
                      onChange={e => setCostoUnitario(e.target.value)}
                      placeholder="0.00"
                      className="h-10 bg-white text-xs font-semibold dark:bg-slate-950"
                    />
                  </div>
                </div>
              </section>

              {/* SECCION 4 */}
              <section className="order-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-orange-100 dark:bg-orange-900/30">
                    <span className="h-2 w-2 rounded-full bg-violet-500" />
                  </span>
                  <h3 className="font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                    Detalle de salida y comprobante
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="space-y-1 md:col-span-1">
                    <Label>Motivo de Salida</Label>
                    <Select
                      value={motivo}
                      onValueChange={v => setMotivo(v ?? "")}>
                      <SelectTrigger className="h-10 w-full bg-white dark:bg-slate-950">
                        {motivo ? (
                          <span>
                            {motivo === "PRODUCCION"
                              ? "Producción"
                              : motivo === "VENTA"
                                ? "Venta"
                                : "Ensayo"}
                          </span>
                        ) : (
                          <SelectValue placeholder="Seleccionar motivo..." />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PRODUCCION" className="text-xs">
                          Producción
                        </SelectItem>
                        <SelectItem value="VENTA" className="text-xs">
                          Venta
                        </SelectItem>
                        <SelectItem value="ENSAYO" className="text-xs">
                          Ensayo
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1 md:col-span-1">
                    <Label>Factura / Guía</Label>
                    <Input
                      name="facturaGuia"
                      placeholder="Ej: E001-1851"
                      className="h-10 bg-white text-xs dark:bg-slate-950"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-1">
                    <Label>Ing. de Campo</Label>
                    <Select
                      value={ingCampo}
                      onValueChange={v => setIngCampo(v ?? "NO")}>
                      <SelectTrigger className="h-10 bg-white dark:bg-slate-950">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NO">NO</SelectItem>
                        <SelectItem value="SI">SI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1 md:col-span-3">
                    <Label>Empresa</Label>
                    <Input
                      name="empresaDestino"
                      placeholder="Ej: ALTERNATIVAS GLOBALES K & G S.A."
                      className="h-10 bg-white text-xs dark:bg-slate-950"
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* FOOTER */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-950">
              <span className="text-xs text-destructive">{message}</span>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setEditando(null); setModalOpen(false); }}
                  disabled={isPending}
                  className="h-10 px-5">
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="h-10 bg-emerald-600 px-5 font-semibold hover:bg-emerald-700 shadow-sm">
                  {isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {isPending
                    ? "Guardando..."
                    : editando
                      ? "Actualizar"
                      : tipo === "SALIDA"
                        ? "Registrar Salida"
                        : "Registrar Ingreso"}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(eliminando)} onOpenChange={(open) => !open && setEliminando(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Eliminar movimiento
            </AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará el movimiento del{" "}
              <strong className="text-foreground">
                {eliminando ? new Date(eliminando.fecha).toLocaleDateString("es-PE") : ""}
              </strong>{" "}
              para el producto{" "}
              <strong className="text-foreground">
                {eliminando?.producto?.descripcion ?? ""}
              </strong>
              . Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={confirmarEliminar}>
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Eliminar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
