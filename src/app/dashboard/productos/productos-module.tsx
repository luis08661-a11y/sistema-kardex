"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  columnVisibilityFeature,
  createColumnHelper,
  createPaginatedRowModel,
  FlexRender,
  rowPaginationFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import {
  Package,
  Search,
  Plus,
  Pencil,
  Power,
  Trash2,
  Boxes,
  Tag,
  FileSpreadsheet,
  FileText,
  ChevronsLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsRightIcon,
  Layers,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
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
import { cambiarEstadoProducto, eliminarProducto } from "@/actions/productos.actions";
import {
  exportProductosExcel,
  exportProductosPDF,
  type ProductoExportRow,
} from "@/lib/client-exports";
import { ProductoDialog } from "@/components/productos/producto-dialog";
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

/* -------------------------------------------------------------------------- */
/* TIPOS                                                                      */
/* -------------------------------------------------------------------------- */

type Producto = {
  id: string;
  tipoInventario: string;
  codigo: string;
  codigoExistencia: string | null;
  descripcion: string;
  observaciones: string | null;
  unidadMedidaId: string;
  tipoExistenciaId: string | null;
  activo: boolean;
  precioVenta: number;
  unidadMedida?: { id: string; codigo: string | null; nombre: string } | null;
  tipoExistencia?: { id: string; codigo: string | null; nombre: string } | null;
  presentacion?: { id: string; nombre: string; unidadMedidaId: string | null; activo: boolean } | null;
};

type Catalogo = { id: string; codigo?: string | null; nombre: string };

type Catalogos = {
  unidades: Catalogo[];
  tipos: Catalogo[];
  categorias: Catalogo[];
  marcas: Catalogo[];
  afectaciones: Catalogo[];
  presentaciones: Catalogo[];
};

type Props = {
  productos: Producto[];
  catalogos: Catalogos;
};

/* -------------------------------------------------------------------------- */
/* TANSTACK TABLE                                                             */
/* -------------------------------------------------------------------------- */

const features = tableFeatures({ rowPaginationFeature, columnVisibilityFeature, paginatedRowModel: createPaginatedRowModel() });
const columnHelper = createColumnHelper<typeof features, Producto>();

/* -------------------------------------------------------------------------- */
/* COMPONENTE PRINCIPAL                                                       */
/* -------------------------------------------------------------------------- */

export function ProductosModule({ productos, catalogos }: Props) {
  const router = useRouter();

  /* filtros */
  const [query, setQuery] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("TODOS");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  /* dialog */
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Producto | null>(null);

  /* estados */
  const [pending, startTransition] = useTransition();
  const [exporting, setExporting] = useState<"excel" | "pdf" | null>(null);
  const [deleteId, setDeleteId] = useState<Producto | null>(null);

  const changeQuery = (value: string) => { setQuery(value); setPageIndex(0); };
  const changeTipoFiltro = (value: string) => { setTipoFiltro(value); setPageIndex(0); };

  /* filtrado */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return productos.filter(p => {
      const matchesType = tipoFiltro === "TODOS" || p.tipoInventario === tipoFiltro;
      const text = `${p.codigo} ${p.descripcion}`.toLowerCase();
      const matchesQuery = q.length === 0 || text.includes(q);
      return matchesType && matchesQuery;
    });
  }, [productos, query, tipoFiltro]);

  /* export rows */
  const exportRows = useMemo<ProductoExportRow[]>(
    () => filtered.map(p => ({
      codigo: p.codigo,
      codigoExistencia: p.codigoExistencia ?? "",
      nombre: p.descripcion,
      tabla5: p.tipoExistencia ? `${p.tipoExistencia.codigo ?? ""} ${p.tipoExistencia.nombre}`.trim() : "—",
      tipoInventario: p.tipoInventario === "BASE_ACTIVA" ? "BASE ACTIVA" : "PRODUCTO TERMINADO",
      presentacion: p.presentacion?.nombre ?? "",
      unidadMedida: p.unidadMedida?.nombre || p.unidadMedida?.codigo || "",
      observaciones: p.observaciones ?? "",
    })),
    [filtered],
  );

  const exportExcel = async () => { setExporting("excel"); try { await exportProductosExcel(exportRows); } finally { setExporting(null); } };
  const exportPdf = async () => { setExporting("pdf"); try { await exportProductosPDF(exportRows); } finally { setExporting(null); } };

  /* dialog handlers */
  const openNew = () => { setEditing(null); setOpen(true); };
  const openEdit = (producto: Producto) => { setEditing(producto); setOpen(true); };

  /* toggle activo */
  const toggleProduct = (producto: Producto) => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", String(producto.id));
      fd.set("activo", String(!producto.activo));
      const result = await cambiarEstadoProducto(fd);
      if (result.success) { toast.success(result.message); router.refresh(); }
      else { toast.error(result.message); }
    });
  };

  /* eliminar */
  const confirmDelete = () => {
    if (!deleteId) return;
    const id = deleteId.id;
    setDeleteId(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", id);
      const result = await eliminarProducto(fd);
      if (result.success) { toast.success(result.message); router.refresh(); }
      else { toast.error(result.message); }
    });
  };

  /* columnas TanStack */
  const columns = useMemo(
    () => columnHelper.columns([
      columnHelper.accessor("codigo", {
        header: "Codigo",
        cell: ({ row }) => {
          const isBase = row.original.tipoInventario === "BASE_ACTIVA";
          return (
            <Badge variant="outline" className={`font-mono text-xs font-bold ${isBase ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-violet-500/40 bg-violet-500/10 text-violet-300"}`}>
              {row.original.codigo}
            </Badge>
          );
        },
      }),
      columnHelper.accessor("descripcion", {
        header: "Producto",
        cell: ({ row }) => (
          <div className="max-w-56">
            <div className="truncate font-medium">{row.original.descripcion}</div>
            {/* {row.original.observaciones && (
              <div className="mt-0.5 truncate text-xs text-muted-foreground">{row.original.observaciones}</div>
            )} */}
          </div>
        ),
      }),
      columnHelper.accessor(row => row.tipoExistencia?.nombre ?? "", {
        id: "tabla5",
        header: "Tabla 5",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.tipoExistencia
              ? `${row.original.tipoExistencia.codigo ?? ""} ${row.original.tipoExistencia.nombre}`.trim()
              : "—"}
          </span>
        ),
      }),
      columnHelper.accessor(row => row.unidadMedida?.nombre ?? "", {
        id: "unidadMedida",
        header: "Unidad Medida",
        cell: ({ row }) => (
          <span className="font-mono text-sm tabular-nums">
            {row.original.unidadMedida?.nombre || row.original.unidadMedida?.codigo || "—"}
          </span>
        ),
      }),
      columnHelper.accessor("tipoInventario", {
        header: "Tipo",
        cell: ({ row }) => {
          const isBase = row.original.tipoInventario === "BASE_ACTIVA";
          return (
            <Badge variant="outline" className={isBase ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-violet-500/40 bg-violet-500/10 text-violet-300"}>
              {isBase ? "BASE" : "PT"}
            </Badge>
          );
        },
      }),
      columnHelper.accessor(row => row.presentacion?.nombre ?? "", {
        id: "presentacion",
        header: "Presentación",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{row.original.presentacion?.nombre ?? "—"}</span>
        ),
      }),
      columnHelper.accessor("precioVenta", {
        header: () => <div className="text-right">Precio</div>,
        cell: ({ row }) => (
          <div className="text-right font-mono text-sm tabular-nums">
            {row.original.tipoInventario === "PRODUCTO_TERMINADO"
              ? `S/ ${Number(row.original.precioVenta).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : "—"}
          </div>
        ),
      }),
      columnHelper.accessor("activo", {
        header: () => <div className="text-right">Estado</div>,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Badge variant={row.original.activo ? "default" : "secondary"} className={row.original.activo ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" : ""}>
              <span className={`mr-1 size-1.5 rounded-full ${row.original.activo ? "bg-emerald-400" : "bg-muted-foreground"}`} />
              {row.original.activo ? "Activo" : "Inactivo"}
            </Badge>
          </div>
        ),
      }),
      columnHelper.display({
        id: "acciones",
        header: () => <div className="text-right">Acciones</div>,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon-sm" title="Editar" onClick={() => openEdit(row.original)}>
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={pending}
              title={row.original.activo ? "Desactivar" : "Activar"}
              className={row.original.activo ? "text-amber-500 hover:bg-amber-500/10 hover:text-amber-400" : "text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-400"}
              onClick={() => toggleProduct(row.original)}
            >
              <Power className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={pending}
              title="Eliminar"
              className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              onClick={() => setDeleteId(row.original)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ),
      }),
    ]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pending],
  );

  const table = useTable({
    features,
    columns,
    data: filtered,
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
    getRowId: (row) => row.id,
  });

  const totalPaginas = Math.max(1, table.getPageCount());

  return (
    <div className="w-full space-y-6 p-4 sm:p-6">
      {/* ── HERO ── */}
      <div className="relative overflow-hidden rounded-xl border border-slate-700/60 bg-[#0f172a] p-4 text-white shadow-lg shadow-emerald-500/10">
        <div className="absolute -right-8 -top-2 h-32 w-32 rounded-full bg-emerald-500/5 blur-2xl" />
        <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-emerald-500/5 blur-xl" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 shadow-sm shadow-emerald-500/30">
              <Boxes className="h-4.5 w-4.5" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight">
                PRODUCTOS 
              </h1>
              <p className="text-[14px] text-slate-400">
              Códigos, tipos de existencia y unidades de medida para el Kardex.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="border-slate-600 bg-slate-800/60 text-slate-300 hover:!bg-emerald-600 hover:!text-white hover:!border-emerald-500" disabled={exporting !== null || filtered.length === 0} onClick={exportExcel}>
              <FileSpreadsheet className="mr-1.5 size-4" />
              {exporting === "excel" ? "Generando..." : "Excel"}
            </Button>
            <Button variant="outline" size="sm" className="border-slate-600 bg-slate-800/60 text-slate-300 hover:!bg-rose-600 hover:!text-white hover:!border-rose-500" disabled={exporting !== null || filtered.length === 0} onClick={exportPdf}>
              <FileText className="mr-1.5 size-4" />
              {exporting === "pdf" ? "Generando..." : "PDF"}
            </Button>
            <Button size="sm" className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-500" onClick={openNew}>
              <Plus className="size-4" />
              Nuevo producto
            </Button>
          </div>
        </div>
      </div>

      {/* ── TABLA ── */}
      <Card>
        <CardContent className="space-y-4">
          {/* filtros */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:max-w-80">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Buscar por código o nombre..."
                value={query}
                onChange={e => changeQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-1 rounded-lg border bg-muted/50 p-0.5">
              {([
                { value: "TODOS", label: "Todos" },
                { value: "BASE_ACTIVA", label: "Base activa" },
                { value: "PRODUCTO_TERMINADO", label: "Terminado" },
              ] as const).map(opt => {
                const active = tipoFiltro === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => changeTipoFiltro(opt.value)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                      active
                        ? opt.value === "BASE_ACTIVA"
                          ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40 shadow-sm"
                          : opt.value === "PRODUCTO_TERMINADO"
                            ? "bg-violet-500/10 text-violet-300 border border-violet-500/40 shadow-sm"
                            : "bg-background text-foreground shadow-sm border border-transparent"
                        : "text-muted-foreground hover:text-foreground border border-transparent"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* tabla */}
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="bg-emerald-600">
                {table.getHeaderGroups().map(hg => (
                  <TableRow key={hg.id} className="border-emerald-500/30">
                    {hg.headers.map(h => (
                      <TableHead key={h.id} className="text-[11px] font-semibold uppercase tracking-wide text-white">
                        {h.isPlaceholder ? null : <FlexRender header={h} />}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map(row => (
                    <TableRow key={row.id} data-state={row.original.activo ? undefined : "inactive"} className="h-9">
                      {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id} className="py-1.5">
                          <FlexRender cell={cell} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="rounded-full bg-muted p-4">
                          <Package className="size-8 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">No se encontraron productos</p>
                          <p className="text-sm text-muted-foreground">Intenta ajustar los filtros de búsqueda</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* paginación */}
          <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="tabular-nums">
                Página {pageIndex + 1} de {totalPaginas}
              </span>
              <span className="tabular-nums">
                {filtered.length > 0
                  ? `${(pageIndex * pageSize + 1).toLocaleString("es-PE")}–${Math.min((pageIndex + 1) * pageSize, filtered.length).toLocaleString("es-PE")} de ${filtered.length.toLocaleString("es-PE")}`
                  : "0 resultados"}
              </span>
              <Select
                value={String(pageSize)}
                onValueChange={v => { setPageSize(Number(v)); setPageIndex(0); }}
              >
                <SelectTrigger size="sm" className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 20, 50].map(n => (
                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-1.5">
              <Button variant="outline" size="icon-sm" disabled={pageIndex === 0} onClick={() => setPageIndex(0)}>
                <ChevronsLeftIcon className="size-4" />
              </Button>
              <Button variant="outline" size="icon-sm" disabled={pageIndex === 0} onClick={() => setPageIndex(p => Math.max(0, p - 1))}>
                <ChevronLeftIcon className="size-4" />
              </Button>
              <Button variant="outline" size="icon-sm" disabled={pageIndex + 1 >= totalPaginas} onClick={() => setPageIndex(p => p + 1)}>
                <ChevronRightIcon className="size-4" />
              </Button>
              <Button variant="outline" size="icon-sm" disabled={pageIndex + 1 >= totalPaginas} onClick={() => setPageIndex(totalPaginas - 1)}>
                <ChevronsRightIcon className="size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── DIALOG ── */}
      <ProductoDialog
        key={editing?.id ?? "new"}
        open={open}
        onOpenChange={setOpen}
        editing={editing}
        catalogos={catalogos}
      />

      {/* ── CONFIRMAR ELIMINAR ── */}
      <AlertDialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará permanentemente el producto <span className="font-semibold text-foreground">{deleteId?.descripcion}</span> ({deleteId?.codigo}). Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => void confirmDelete()}
              disabled={pending}
            >
              {pending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
