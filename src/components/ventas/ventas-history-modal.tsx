"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Printer,
  Trash2,
  Loader2,
  Search,
  History,
  ShoppingCart,
  X,
  Mail,
  MessageCircle,
  Eye,
  Receipt,
  CalendarDays,
  Inbox,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  createColumnHelper,
  columnVisibilityFeature,
  FlexRender,
  rowPaginationFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";

import {
  anularVenta,
  eliminarVenta,
  obtenerVenta,
  obtenerVentas,
} from "@/actions/venta.actions";
import { obtenerHistorialVentasPos } from "@/actions/pos.actions";
import type { HistorialVentasPosDTO } from "@/lib/services/pos.service";
import type { VentasPaginadasDTO } from "@/lib/services/venta.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  TIPO_COMPROBANTE_LABEL,
  FORMA_PAGO_LABEL,
  formatearMoneda,
  formatearNumero,
  ventaDTOParaImprimir,
  type TipoComprobante,
  type FormaPago,
  type VentaParaImprimir,
} from "@/components/ventas/types";
import { EnviarCorreoDialog } from "@/components/ventas/enviar-correo-dialog";
import { EnviarWhatsAppDialog } from "@/components/ventas/enviar-whatsapp-dialog";

export type Fila = VentasPaginadasDTO["data"][number];

const features = tableFeatures({
  rowPaginationFeature,
  columnVisibilityFeature,
});
const columnHelper = createColumnHelper<typeof features, Fila>();

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecargar: (fila: Fila) => void;
  onImprimir: (
    venta: import("@/components/ventas/types").VentaParaImprimir,
  ) => void;
  onCambio: () => void;
}

interface Filtros {
  search: string;
  tipoComprobante: string;
  estado: string;
  formaPago: string;
  fechaDesde: string;
  fechaHasta: string;
}

const filtrosIniciales: Filtros = {
  search: "",
  tipoComprobante: "TODOS",
  estado: "TODOS",
  formaPago: "TODOS",
  fechaDesde: "",
  fechaHasta: "",
};

function fechaISO(d = new Date()) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function TotalAzul({ value }: { value: number }) {
  const texto = formatearMoneda(value);
  const inicio = texto.search(/\d/);
  return (
    <span className="font-bold tabular-nums text-emerald-600">
      <span>{texto.slice(0, inicio)}</span>
      {texto.slice(inicio)}
    </span>
  );
}

export function VentasHistoryModal({
  open,
  onOpenChange,
  onRecargar,
  onImprimir,
  onCambio,
}: Props) {
  const [filtros, setFiltros] = useState<Filtros>(() => ({
    ...filtrosIniciales,
    fechaDesde: fechaISO(),
    fechaHasta: fechaISO(),
  }));
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [resultado, setResultado] = useState<VentasPaginadasDTO>({
    data: [],
    total: 0,
    page: 1,
    pageSize: 10,
    totalPaginas: 0,
  });
  const [cargando, setCargando] = useState(false);
  const [confirmar, setConfirmar] = useState<{
    tipo: "anular" | "eliminar";
    fila: Fila;
  } | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [envio, setEnvio] = useState<{
    tipo: "correo" | "whatsapp";
    venta: VentaParaImprimir;
  } | null>(null);
  const [detalleFila, setDetalleFila] = useState<Fila | null>(null);
  const [detallePagina, setDetallePagina] = useState(0);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [searchInput, setSearchInput] = useState(filtrosIniciales.search);
  const [resumen, setResumen] = useState<
    HistorialVentasPosDTO["resumen"] | null
  >(null);

  useEffect(() => {
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, []);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const res = await obtenerVentas({
        page: pageIndex + 1,
        pageSize,
        search: filtros.search,
        tipoComprobante: filtros.tipoComprobante,
        estado: filtros.estado,
        formaPago: filtros.formaPago,
        fechaDesde: filtros.fechaDesde
          ? new Date(`${filtros.fechaDesde}T00:00:00`)
          : undefined,
        fechaHasta: filtros.fechaHasta
          ? new Date(`${filtros.fechaHasta}T00:00:00`)
          : undefined,
      });
      setResultado(res);
      if (res.page < pageIndex + 1) setPageIndex(Math.max(0, res.page - 1));
    } finally {
      setCargando(false);
    }
  }, [pageIndex, pageSize, filtros]);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => void cargar(), 0);
    obtenerHistorialVentasPos()
      .then(r => setResumen(r.resumen))
      .catch(() => setResumen(null));
    return () => window.clearTimeout(id);
  }, [open, cargar]);

  const handleOpenChange = (o: boolean) => {
    if (o) setDetalleFila(null);
    onOpenChange(o);
  };

  const cambiarFiltro = (k: keyof Filtros, v: string, debounce = false) => {
    const aplicar = () => {
      setFiltros(f => ({ ...f, [k]: v }));
      setPageIndex(0);
      setDetalleFila(null);
    };
    if (debounce) {
      if (searchTimer.current) clearTimeout(searchTimer.current);
      searchTimer.current = setTimeout(aplicar, 250);
    } else {
      aplicar();
    }
  };

  const recargarYcerrar = useCallback(
    (fila: Fila) => {
      onRecargar(fila);
      onOpenChange(false);
    },
    [onRecargar, onOpenChange],
  );

  const verDetalle = useCallback((fila: Fila) => {
    setDetallePagina(0);
    setDetalleFila(fila);
  }, []);

  const imprimir = useCallback(
    async (fila: Fila) => {
      try {
        const dto = await obtenerVenta(fila.id);
        if (dto) onImprimir(ventaDTOParaImprimir(dto));
      } catch {
        toast.error("No se pudo cargar el comprobante");
      }
    },
    [onImprimir],
  );

  const enviar = useCallback(
    async (fila: Fila, tipo: "correo" | "whatsapp") => {
      try {
        const dto = await obtenerVenta(fila.id);
        if (!dto) {
          toast.error("No se pudo cargar el comprobante");
          return;
        }
        setEnvio({ tipo, venta: ventaDTOParaImprimir(dto) });
      } catch {
        toast.error("No se pudo cargar el comprobante");
      }
    },
    [],
  );

  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("comprobante", {
          header: "Comprobante",
          cell: ({ row }) => {
            const anulada = row.original.estado === "ANULADA";
            const bubble = anulada
              ? "border-rose-300 bg-gradient-to-br from-rose-100 to-rose-200 text-rose-700 line-through shadow-rose-300/40"
              : "border-violet-400/60 bg-gradient-to-br from-violet-100 via-violet-200 to-violet-300 text-violet-800 shadow-violet-300/40";
            return (
              <div className="min-w-0">
                <Badge
                  variant="outline"
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[11px] font-bold tabular-nums shadow-md ring-1 ring-black/5 ${bubble}`}>
                  {row.original.comprobante}
                </Badge>
              </div>
            );
          },
        }),
        columnHelper.accessor("fecha", {
          header: "Fecha",
          cell: ({ row }) => (
            <div className="whitespace-nowrap text-sm font-semibold text-slate-300 tabular-nums">
              {new Date(row.original.fecha).toLocaleDateString("es-PE")}
            </div>
          ),
        }),
        columnHelper.accessor("clienteRazonSocial", {
          header: "Razón social",
          cell: ({ row }) => (
            <div className="min-w-40 max-w-56">
              <div className="break-words whitespace-normal text-sm font-medium text-slate-300">
                {row.original.clienteRazonSocial}
              </div>
              {/* {row.original.clienteDocumento && (
                <div className="text-[10px] font-medium text-slate-400">
                  {row.original.clienteDocumento}
                </div>
              )} */}
            </div>
          ),
        }),
        columnHelper.accessor("formaPago", {
          header: "Forma pago",
          cell: ({ row }) => {
            const credito = row.original.formaPago === "CREDITO";
            return (
              <div className="whitespace-nowrap">
                <Badge
                  variant="outline"
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold shadow-md ring-1 ring-black/5 ${
                    credito
                      ? "border-sky-300 bg-gradient-to-br from-sky-100 to-sky-200 text-sky-800 shadow-sky-300/40"
                      : "border-amber-300 bg-gradient-to-br from-amber-100 to-amber-200 text-amber-800 shadow-amber-300/40"
                  }`}>
                  {FORMA_PAGO_LABEL[row.original.formaPago as FormaPago]}
                </Badge>
                {/* <div className="text-[10px] font-medium text-slate-400">
                {METODO_PAGO_LABEL[row.original.metodoPago as MetodoPago]}
              </div> */}
              </div>
            );
          },
        }),
        columnHelper.accessor("total", {
          header: "Total",
          cell: ({ row }) => (
            <div className="text-right text-sm font-bold tabular-nums">
              <TotalAzul value={row.original.total} />
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
                className={
                  anulada
                    ? "rounded-full border-rose-300 bg-gradient-to-br from-rose-100 to-rose-200 px-2 py-0.5 text-[10px] font-bold text-rose-700 shadow-md shadow-rose-300/40 ring-1 ring-black/5"
                    : "rounded-full border-emerald-300 bg-gradient-to-br from-emerald-100 to-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700 shadow-md shadow-emerald-300/40 ring-1 ring-black/5"
                }>
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
              <Acciones
                fila={row.original}
                onRecargar={recargarYcerrar}
                onImprimir={f => void imprimir(f)}
                onEnviar={(f, tipo) => void enviar(f, tipo)}
                setConfirmar={setConfirmar}
                onVer={verDetalle}
              />
            </div>
          ),
        }),
      ]),
    [recargarYcerrar, imprimir, enviar, verDetalle],
  );

  const table = useTable({
    features,
    columns,
    data: resultado.data,
    state: { pagination: { pageIndex, pageSize } },
    onPaginationChange: updater => {
      if (typeof updater === "function") {
        const next = updater({ pageIndex, pageSize });
        setPageIndex(next.pageIndex);
        setPageSize(next.pageSize);
      } else {
        setPageIndex(updater.pageIndex);
        setPageSize(updater.pageSize);
      }
      setDetalleFila(null);
    },
    manualPagination: true,
    pageCount: resultado.totalPaginas,
    getRowId: row => row.id,
  });

  const confirmarAccion = async () => {
    if (!confirmar) return;
    setProcesando(true);
    try {
      const res =
        confirmar.tipo === "anular"
          ? await anularVenta(confirmar.fila.id)
          : await eliminarVenta(confirmar.fila.id);
      if (res.success) {
        toast.success(res.message);
        setConfirmar(null);
        void cargar();
        onCambio();
      } else {
        toast.error(res.message);
      }
    } finally {
      setProcesando(false);
    }
  };

  const totalPaginas = Math.max(1, resultado.totalPaginas);
  const desde = resultado.total === 0 ? 0 : pageIndex * pageSize + 1;
  const hasta = Math.min((pageIndex + 1) * pageSize, resultado.total);

  const DETALLE_POR_PAGINA = 6;
  const detalleItems = detalleFila?.detalles ?? [];
  const totalPagDetalle = Math.max(
    1,
    Math.ceil(detalleItems.length / DETALLE_POR_PAGINA),
  );
  const paginaDetalleSegura = Math.min(detallePagina, totalPagDetalle - 1);
  const detalleVisibles = detalleItems.slice(
    paginaDetalleSegura * DETALLE_POR_PAGINA,
    (paginaDetalleSegura + 1) * DETALLE_POR_PAGINA,
  );

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="max-w-5xl! overflow-hidden border-0 bg-[#0f172a] p-0 text-slate-100 shadow-2xl">
          {/* Cabecera */}
          <div className="flex items-center justify-between gap-3 border-b border-slate-700/80 bg-gradient-to-r from-slate-900 via-[#111827] to-slate-900 px-3 py-2">
            <div className="flex items-center gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-gradient-to-br from-amber-400 to-amber-600 text-slate-900 shadow-lg shadow-amber-500/25">
                <History className="size-5" strokeWidth={2.2} />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold tracking-tight text-white">
                  Ventas de Hoy
                </DialogTitle>
                {/* <p className="text-xs capitalize text-slate-400">
                  <CalendarDays className="mr-1 inline size-3.5 -translate-y-px text-slate-500" />
                  {new Date().toLocaleDateString("es-PE", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p> */}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 sm:flex">
                <Receipt className="size-3.5 text-amber-400" />
                {resumen?.totalDocumentos ?? "–"} comprobantes
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => onOpenChange(false)}
                className="shrink-0 text-slate-200 hover:bg-white/10 hover:text-white"
                aria-label="Cerrar">
                <X />
              </Button>
            </div>
          </div>

          {/* Resumen del día */}
          {/*   <div className="px-5 pt-4">
            <div className="grid gap-2 sm:grid-cols-3">
              <ResumenCard
                icon={Receipt}
                label="Comprobantes"
                value={
                  resumen
                    ? String(resumen.totalDocumentos)
                    : "—"
                }
                accent="text-amber-300"
                iconClass="bg-amber-400/15 text-amber-300"
              />
              <ResumenCard
                icon={Banknote}
                label="Ingresos"
                value={resumen ? formatearMoneda(resumen.ingresoTotal) : "—"}
                accent="text-emerald-300"
                iconClass="bg-emerald-400/15 text-emerald-300"
              />
              <ResumenCard
                icon={Calculator}
                label="Ticket promedio"
                value={
                  resumen ? formatearMoneda(resumen.ticketPromedio) : "—"
                }
                accent="text-sky-300"
                iconClass="bg-sky-400/15 text-sky-300"
              />
            </div>
          </div> */}

          {/* Barra de búsqueda y filtros */}
          <div className="px-3 pt-0">
            <div className="flex flex-col gap-2 md:flex-row md:items-end">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  className="border-slate-700 bg-slate-800/60 pl-8 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:border-amber-500/60 focus-visible:ring-amber-500/20"
                  placeholder="Buscar por cliente, RUC/DNI o Nº comprobante..."
                  value={searchInput}
                  onChange={e => {
                    setSearchInput(e.target.value);
                    cambiarFiltro("search", e.target.value, true);
                  }}
                />
              </div>
              <Campo label="Comprobante">
                <Select
                  value={filtros.tipoComprobante}
                  onValueChange={v =>
                    cambiarFiltro("tipoComprobante", v ?? "TODOS")
                  }>
                  <SelectTrigger className="w-full border-slate-700 bg-slate-800/60 text-slate-100 data-placeholder:text-slate-500 md:w-44">
                    <SelectValue placeholder="Todos los Comprobantes" />
                  </SelectTrigger>
                  <SelectContent>
                    {["TODOS", "COTIZACION", "FACTURA", "BOLETA"].map(t => (
                      <SelectItem key={t} value={t}>
                        {t === "TODOS"
                          ? "Todos los Comprobantes"
                          : TIPO_COMPROBANTE_LABEL[t as TipoComprobante]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Campo>
              <Campo label="Estado">
                <Select
                  value={filtros.estado}
                  onValueChange={v => cambiarFiltro("estado", v ?? "TODOS")}>
                  <SelectTrigger className="w-full border-slate-700 bg-slate-800/60 text-slate-100 data-placeholder:text-slate-500 md:w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      { value: "TODOS", label: "Todos" },
                      { value: "EMITIDA", label: "Emitidas" },
                      { value: "ANULADA", label: "Anuladas" },
                    ].map(o => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Campo>
              <div className="flex h-9 shrink-0 items-center gap-2 rounded-lg border border-amber-500/40 bg-gradient-to-br from-amber-400/15 to-amber-500/5 px-3 self-end">
                <CalendarDays className="size-4 text-amber-400" />
                <div className="leading-none">
                  <span className="block text-[11px] font-semibold uppercase tracking-wide text-amber-300">
                    Hoy
                  </span>
                  <span className="block text-xs font-medium text-slate-300 tabular-nums">
                    {new Date().toLocaleDateString("es-PE", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* <Separator className="my-0 bg-slate-700/60" /> */}

          {/* Tabla */}
          <div className="relative bg-[#0f172a] px-3 pb-0 pt-0">
            {/* <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-sm text-slate-300">
                {resultado.total > 0 ? (
                  <>
                    <span className="font-semibold text-white tabular-nums">
                      {resultado.total}
                    </span>{" "}
                    comprobante{resultado.total !== 1 ? "s" : ""} de hoy
                  </>
                ) : (
                  "Sin resultados"
                )}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Package2 className="size-3.5 text-amber-400/80" />
                Hoy
              </div>
            </div> */}
            {cargando && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-slate-950/40 backdrop-blur-[1px]">
                <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200 shadow-xl">
                  <Loader2 className="size-4 animate-spin text-amber-400" />
                  Consultando…
                </div>
              </div>
            )}
            <div className="max-h-[52vh] overflow-auto rounded-xl border border-slate-700/80 bg-slate-900/40">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-[#472596]">
                  {table.getHeaderGroups().map(hg => (
                    <TableRow key={hg.id} className="hover:bg-transparent">
                      {hg.headers.map(h => (
                        <TableHead
                          key={h.id}
                          className="h-9 border-b border-slate-700/80 px-3 py-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-100">
                          {h.isPlaceholder ? null : <FlexRender header={h} />}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {resultado.data.length ? (
                    table.getRowModel().rows.map(row => (
                      <TableRow
                        key={row.id}
                        className="border-b border-slate-700/60 bg-[#0f172a] transition-colors hover:bg-slate-800/40">
                        {row.getVisibleCells().map(cell => (
                          <TableCell
                            key={cell.id}
                            className="h-7 border-b border-slate-700/40 px-3 py-0 align-middle text-slate-200">
                            <FlexRender cell={cell} />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-40 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="flex size-12 items-center justify-center rounded-full bg-slate-800 text-slate-500">
                            <Inbox className="size-6" />
                          </div>
                          <p className="text-sm font-medium text-slate-300">
                            No se encontraron comprobantes
                          </p>
                          <p className="max-w-60 text-xs text-slate-500">
                            {filtros.search ||
                            filtros.estado !== "TODOS" ||
                            filtros.tipoComprobante !== "TODOS"
                              ? "Ajusta los filtros o el rango de fechas para ver resultados."
                              : "Aún no hay ventas registradas en este rango."}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pie: paginación + cerrar */}
          <div className="flex flex-col gap-3 border-t border-slate-700/80 bg-[#0f172a] px-5 py-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
              <span className="tabular-nums">
                Mostrando{" "}
                <span className="font-semibold text-white">{desde}</span>–
                <span className="font-semibold text-white">{hasta}</span> de{" "}
                <span className="font-semibold text-white tabular-nums">
                  {resultado.total}
                </span>{" "}
                comprobante{resultado.total !== 1 ? "s" : ""}
              </span>
              <Select
                value={String(pageSize)}
                onValueChange={v => {
                  setPageSize(Number(v));
                  setPageIndex(0);
                }}>
                <SelectTrigger
                  size="sm"
                  className="w-20 border-slate-700 bg-slate-800/60 text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 20, 50].map(n => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-xs text-slate-500">por página</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 rounded-md border border-slate-700 bg-slate-800/60 px-2.5 py-1.5 text-xs font-semibold text-slate-300 tabular-nums">
                Pág. {pageIndex + 1} / {totalPaginas}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pageIndex === 0 || cargando}
                onClick={() => setPageIndex(p => Math.max(0, p - 1))}>
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pageIndex + 1 >= totalPaginas || cargando}
                onClick={() => setPageIndex(p => p + 1)}>
                Siguiente
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="bg-slate-900 text-white hover:bg-slate-800">
                Cerrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!confirmar}
        onOpenChange={o => !o && setConfirmar(null)}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmar?.tipo === "anular"
                ? "¿Anular comprobante?"
                : "¿Eliminar comprobante?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmar?.tipo === "anular"
                ? `El comprobante ${confirmar.fila.comprobante} quedará en estado ANULADA y dejará de ser contable.`
                : `El comprobante ${confirmar?.fila.comprobante ?? ""} se eliminará permanentemente. Solo las cotizaciones pueden eliminarse.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={procesando}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => void confirmarAccion()}
              disabled={procesando}>
              {procesando ? "Procesando..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={!!detalleFila}
        onOpenChange={o => !o && setDetalleFila(null)}>
        <DialogContent className="max-w-150! overflow-hidden border-0 bg-[#0f172a] p-0 text-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-700/60 bg-[#111827] px-3 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-7 items-center justify-center rounded-md bg-emerald-600 text-white shadow-sm shadow-emerald-500/30">
                <ShoppingCart className="size-3.5" />
              </div>
              <DialogTitle className="text-sm font-semibold text-white">
                Detalle de Ventas -{" "}
                <span className="text-emerald-400">
                  {detalleFila?.comprobante ?? ""}
                </span>
              </DialogTitle>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setDetalleFila(null)}
              className="text-slate-400 hover:bg-white/5 hover:text-white"
              aria-label="Cerrar detalle">
              <X className="size-4" />
            </Button>
          </div>

          {detalleFila && (
            <div className="bg-[#0f172a] px-3 pb-4 pt-0">
              {/* Info del cliente */}
              {/* <div className="mb-3 grid grid-cols-2 gap-2 rounded-xl border border-slate-700/60 bg-gradient-to-br from-[#111c30] to-[#0d1523] p-2.5 lg:grid-cols-4">
                <InfoItem
                  icon={User}
                  iconClass="bg-violet-500/15 text-violet-300"
                  label="Cliente"
                  value={detalleFila.clienteRazonSocial}
                />
                <InfoItem
                  icon={CalendarDays}
                  iconClass="bg-amber-500/15 text-amber-300"
                  label="Fecha / Hora"
                  value={new Date(detalleFila.fecha).toLocaleString("es-PE", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                />
                <InfoItem
                  icon={Wallet}
                  iconClass="bg-emerald-500/15 text-emerald-300"
                  label="Pago"
                  value={FORMA_PAGO_LABEL[detalleFila.formaPago as FormaPago]}
                />
                <InfoItem
                  icon={Receipt}
                  iconClass="bg-sky-500/15 text-sky-300"
                  label="Tipo"
                  value={
                    TIPO_COMPROBANTE_LABEL[
                      detalleFila.tipoComprobante as TipoComprobante
                    ]
                  }
                />
              </div> */}

              <div className="overflow-hidden rounded-lg border border-slate-700/60 bg-[#101f34]">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#1b2b42] text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                      <th className="px-3 py-2 text-left">Producto</th>
                      <th className="px-3 py-2 text-center">Unidad Medida</th>
                      <th className="px-3 py-2 text-center">Cant.</th>
                      <th className="px-3 py-2 text-right">P.Unit</th>
                      <th className="px-3 py-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalleFila.detalles.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="h-16 text-center text-xs text-slate-400">
                          Sin detalle de productos.
                        </td>
                      </tr>
                    ) : (
                      detalleVisibles.map((d, i) => (
                        <tr
                          key={i}
                          className="border-t border-slate-700/50 text-slate-200 last:border-b-0">
<td className="px-3 py-2 text-xs font-medium text-slate-100">
  {d.descripcion || "Producto"}
</td>
                          <td className="px-3 py-2 text-center text-xs">
                            <span className="inline-block rounded border border-slate-600/80 bg-slate-800/80 px-1.5 py-px text-[10px] font-semibold uppercase text-slate-300">
                              {d.unidadMedida || "—"}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-center text-xs tabular-nums">
                            {formatearNumero(d.cantidad)}
                          </td>
                          <td className="px-3 py-2 text-right text-xs tabular-nums">
                            {formatearMoneda(d.precioUnitario)}
                          </td>
                          <td className="px-3 py-2 text-right text-xs font-semibold tabular-nums text-slate-100">
                            {formatearMoneda(d.importe)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                {detalleItems.length > DETALLE_POR_PAGINA && (
                  <div className="flex items-center justify-between border-t border-slate-700/60 bg-[#1b2b42] px-3 py-1.5">
                    <span className="text-[11px] font-medium text-slate-400">
                      {paginaDetalleSegura * DETALLE_POR_PAGINA + 1}–
                      {Math.min(
                        (paginaDetalleSegura + 1) * DETALLE_POR_PAGINA,
                        detalleItems.length,
                      )}{" "}
                      de {detalleItems.length} productos
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={paginaDetalleSegura === 0}
                        onClick={() =>
                          setDetallePagina(p => Math.max(0, p - 1))
                        }
                        className="text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-40">
                        <ChevronLeft className="size-3.5" />
                      </Button>
                      <span className="px-1 text-[11px] font-semibold text-slate-300 tabular-nums">
                        {paginaDetalleSegura + 1} / {totalPagDetalle}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={
                          paginaDetalleSegura + 1 === totalPagDetalle
                        }
                        onClick={() =>
                          setDetallePagina(p =>
                            Math.min(totalPagDetalle - 1, p + 1),
                          )
                        }
                        className="text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-40">
                        <ChevronRight className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Totales */}
              <div className="mt-3 ml-auto w-full max-w-[260px] space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Subtotal:</span>
                  <span className="tabular-nums text-slate-100">
                    {formatearMoneda(detalleFila.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-emerald-400">
                  <span>Impuesto (IGV):</span>
                  <span className="tabular-nums">
                    {formatearMoneda(detalleFila.igv)}
                  </span>
                </div>
                {detalleFila.estado === "ANULADA" && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Estado:</span>
                    <span className="font-semibold text-rose-400">ANULADA</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-700/60 pt-1.5 text-sm font-bold text-emerald-400">
                  <span>TOTAL:</span>
                  <span className="tabular-nums">
                    {formatearMoneda(detalleFila.total)}
                  </span>
                </div>
              </div>

              {/* Botón cerrar */}
              <div className="mt-4 flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setDetalleFila(null)}
                  className="bg-slate-700 text-white hover:bg-slate-600">
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {envio?.tipo === "correo" && (
        <EnviarCorreoDialog
          venta={envio.venta}
          open
          onOpenChange={o => !o && setEnvio(null)}
        />
      )}
      {envio?.tipo === "whatsapp" && (
        <EnviarWhatsAppDialog
          venta={envio.venta}
          open
          onOpenChange={o => !o && setEnvio(null)}
        />
      )}
    </>
  );
}

function Campo({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </Label>
      {children}
    </div>
  );
}

interface AccionesProps {
  fila: Fila;
  onRecargar: (fila: Fila) => void;
  onImprimir: (fila: Fila) => void;
  onEnviar: (fila: Fila, tipo: "correo" | "whatsapp") => void;
  setConfirmar: (c: { tipo: "anular" | "eliminar"; fila: Fila } | null) => void;
  onVer: (fila: Fila) => void;
}

function Acciones({
  fila,
  onRecargar,
  onImprimir,
  onEnviar,
  setConfirmar,
  onVer,
}: AccionesProps) {
  const esCotizacion = fila.tipoComprobante === "COTIZACION";
  const puedeEliminar = esCotizacion;
  const puedeAnular = !esCotizacion && fila.estado !== "ANULADA";

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Button
        variant="ghost"
        size="icon-sm"
        title="Ver productos"
        onClick={() => onVer(fila)}
        className="h-8 w-8 rounded-md bg-transparent p-0 text-blue-400 hover:bg-transparent hover:text-blue-300">
        <Eye className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        title="Enviar por correo"
        onClick={() => onEnviar(fila, "correo")}
        className="h-8 w-8 rounded-md bg-transparent p-0 text-sky-400 hover:bg-transparent hover:text-sky-300">
        <Mail className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        title="Enviar por WhatsApp"
        onClick={() => onEnviar(fila, "whatsapp")}
        className="h-8 w-8 rounded-md bg-transparent p-0 text-emerald-400 hover:bg-transparent hover:text-emerald-300">
        <MessageCircle className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        title="Recargar en el formulario"
        onClick={() => onRecargar(fila)}
        className="h-8 w-8 rounded-md bg-transparent p-0 text-violet-400 hover:bg-transparent hover:text-violet-300">
        <ShoppingCart className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        title="Reimprimir"
        onClick={() => onImprimir(fila)}
        className="h-8 w-8 rounded-md bg-transparent p-0 text-amber-400 hover:bg-transparent hover:text-amber-300">
        <Printer className="size-4" />
      </Button>
      {(puedeEliminar || puedeAnular) && (
        <Button
          variant="ghost"
          size="icon-sm"
          title={puedeEliminar ? "Eliminar cotización" : "Anular comprobante"}
          className="h-8 w-8 rounded-md bg-transparent p-0 text-rose-500 hover:bg-transparent hover:text-rose-400"
          onClick={() =>
            setConfirmar({ tipo: puedeEliminar ? "eliminar" : "anular", fila })
          }>
          <Trash2 className="size-4" />
        </Button>
      )}
    </div>
  );
}
