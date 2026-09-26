"use client";

import { useCallback, useMemo, useRef, useState } from "react";
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
  Ruler,
  Package,
  Database,
  Tags,
  Factory,
  FileText,
  SlidersHorizontal,
  Warehouse,
  Search,
  Plus,
  Pencil,
  Power,
  Trash2,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
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
  cambiarEstadoCatalogo,
  eliminarCatalogo,
  obtenerCatalogos,
} from "@/actions/catalogos.actions";
import { CatalogoDialog } from "@/components/catalogos/catalogo-dialog";
import { PaginacionTabla } from "@/components/shared/paginacion-tabla";
import { ModuloCabecera } from "@/components/shared/modulo-cabecera";

type CatalogoRow = {
  id: string;
  codigo: string | null;
  nombre: string;
  activo: boolean;
  establecimiento?: { id: string; nombre: string } | null;
};

type Tab = "unidades" | "presentaciones" | "existencias" | "categorias" | "marcas" | "afectaciones" | "operaciones" | "almacenamientos";

type CatalogosData = Awaited<ReturnType<typeof obtenerCatalogos>>;

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "unidades", label: "Unidades", icon: Ruler },
  { id: "presentaciones", label: "Presentaciones", icon: Package },
  { id: "existencias", label: "Tipo existencia", icon: Database },
 /*  { id: "categorias", label: "Categorías", icon: Tags },
  { id: "marcas", label: "Marcas", icon: Factory }, 
  { id: "afectaciones", label: "Tipo afectación", icon: FileText },*/
  { id: "operaciones", label: "Tipo operación", icon: SlidersHorizontal },
  { id: "almacenamientos", label: "Almacenamientos", icon: Warehouse },
];

const features = tableFeatures({
  rowPaginationFeature,
  columnVisibilityFeature,
  paginatedRowModel: createPaginatedRowModel(),
});
const columnHelper = createColumnHelper<typeof features, CatalogoRow>();

export function CatalogosModule({ resultadoInicial }: { resultadoInicial: CatalogosData }) {
  const [tab, setTab] = useState<Tab>("unidades");
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState("TODOS");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [resultado, setResultado] = useState<CatalogosData>(resultadoInicial);
  const [cargando, setCargando] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogData, setDialogData] = useState<{ row: CatalogoRow | null; tipo: Tab } | null>(null);
  const [dialogKey, setDialogKey] = useState(0);
  const [confirmar, setConfirmar] = useState<{ tipo: "eliminar" | "desactivar"; fila: CatalogoRow; tipoCatalogo: string } | null>(null);
  const [procesando, setProcesando] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const res = await obtenerCatalogos();
      setResultado(res);
      setPageIndex(0);
    } finally {
      setCargando(false);
    }
  }, []);

  const onSearchChange = (v: string) => {
    setSearch(v);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setPageIndex(0), 350);
  };

  const onTabChange = (newTab: Tab) => {
    setTab(newTab);
    setSearch("");
    setPageIndex(0);
    setEstado("TODOS");
  };

  const abrirNuevo = () => {
    setDialogData({ row: null, tipo: tab });
    setDialogKey((k) => k + 1);
    setDialogOpen(true);
  };

  const abrirEditar = useCallback((fila: CatalogoRow) => {
    setDialogData({ row: fila, tipo: tab });
    setDialogKey((k) => k + 1);
    setDialogOpen(true);
  }, [tab]);

  const onGuardado = () => {
    void cargar();
  };

  const confirmarAccion = async () => {
    if (!confirmar) return;
    setProcesando(true);
    try {
      const fd = new FormData();
      fd.set("tipo", confirmar.tipoCatalogo);
      fd.set("id", confirmar.fila.id);
      if (confirmar.tipo === "desactivar") {
        fd.set("activo", String(!confirmar.fila.activo));
      }
      const res =
        confirmar.tipo === "eliminar"
          ? await eliminarCatalogo({ success: false, message: "" }, fd)
          : await cambiarEstadoCatalogo({ success: false, message: "" }, fd);
      if (res.success) {
        toast.success(res.message);
        setConfirmar(null);
        void cargar();
      } else {
        toast.error(res.message);
      }
    } finally {
      setProcesando(false);
    }
  };

  const filteredData = useMemo(() => {
    const source = tab === "unidades" ? resultado.unidades
      : tab === "presentaciones" ? resultado.presentaciones
      : tab === "existencias" ? resultado.tiposExistencia
      : tab === "categorias" ? resultado.categorias
      : tab === "marcas" ? resultado.marcas
      : tab === "afectaciones" ? resultado.afectaciones
      : tab === "operaciones" ? resultado.operaciones
      : resultado.almacenamientos;

    const q = search.trim().toLowerCase();
    const estadoFilter = estado === "ACTIVO" ? true : estado === "INACTIVO" ? false : null;

    return (source as CatalogoRow[]).filter((r) => {
      const matchesSearch = q.length === 0 || `${r.codigo ?? ""} ${r.nombre} ${r.establecimiento?.nombre ?? ""}`.toLowerCase().includes(q);
      const matchesEstado = estadoFilter === null || r.activo === estadoFilter;
      return matchesSearch && matchesEstado;
    });
  }, [resultado, tab, search, estado]);

  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("codigo", {
          header: "Código",
          cell: ({ row }) => (
            <span className="font-mono text-xs">{row.original.codigo ?? "—"}</span>
          ),
        }),
        columnHelper.accessor("nombre", {
          header: "Nombre",
          cell: ({ row }) => (
            <div className="max-w-56">
              <div className="truncate font-medium">{row.original.nombre}</div>
              {row.original.establecimiento && (
                <div className="mt-0.5 truncate text-xs text-muted-foreground">
                  {row.original.establecimiento.nombre}
                </div>
              )}
            </div>
          ),
        }),
        columnHelper.accessor("activo", {
          header: "Estado",
          cell: ({ row }) => (
            <Badge variant={row.original.activo ? "default" : "secondary"}>
              {row.original.activo ? "Activo" : "Inactivo"}
            </Badge>
          ),
        }),
        columnHelper.display({
          id: "acciones",
          header: () => <div className="text-right">Acciones</div>,
          cell: ({ row }) => (
            <div className="flex justify-end gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                title="Editar"
                onClick={() => abrirEditar(row.original)}
              >
                <Pencil />
              </Button>
              {row.original.activo ? (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  title="Desactivar"
                  className="text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                  onClick={() => setConfirmar({ tipo: "desactivar", fila: row.original, tipoCatalogo: tab })}
                >
                  <Power />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  title="Activar"
                  className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                  onClick={() => setConfirmar({ tipo: "desactivar", fila: row.original, tipoCatalogo: tab })}
                >
                  <Power />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon-sm"
                title="Eliminar"
                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                onClick={() => setConfirmar({ tipo: "eliminar", fila: row.original, tipoCatalogo: tab })}
              >
                <Trash2 />
              </Button>
            </div>
          ),
        }),
      ]),
    [abrirEditar, tab],
  );

  const table = useTable({
    features,
    columns,
    data: filteredData,
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
  const currentTab = tabs.find((t) => t.id === tab);
  const TabIcon = currentTab?.icon || Ruler;

  return (
    <div className="w-full space-y-6 p-4 sm:p-6">
      {/* ── HERO ── */}
      <ModuloCabecera
        icon={TabIcon}
        titulo={currentTab?.label.toUpperCase() ?? "CATÁLOGOS"}
        descripcion="Catálogos maestros del sistema"
        acciones={
          <Button
            size="sm"
            className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-500"
            onClick={abrirNuevo}
          >
            <Plus className="size-4" />
            Nuevo
          </Button>
        }
      />

      {/* ── TABS ── */}
      <div className="space-y-4">
        <div className="flex gap-1 border-b overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                tab === id
                  ? "border-b-2 border-emerald-600 font-semibold text-emerald-600"
                  : "border-b-2 border-transparent text-muted-foreground hover:text-foreground"
              }`}>
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
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
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-1 rounded-lg border bg-muted/50 p-0.5">
              {([
                { value: "TODOS", label: "Todos" },
                { value: "ACTIVO", label: "Activos" },
                { value: "INACTIVO", label: "Inactivos" },
              ] as const).map((opt) => {
                const active = estado === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { setEstado(opt.value); setPageIndex(0); }}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                      active
                        ? opt.value === "ACTIVO"
                          ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40 shadow-sm"
                          : opt.value === "INACTIVO"
                          ? "bg-rose-500/10 text-rose-300 border border-rose-500/40 shadow-sm"
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

          <div className="relative">
            {cargando && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/50">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            )}
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader className="bg-emerald-600">
                  {table.getHeaderGroups().map((hg) => (
                    <TableRow key={hg.id} className="border-emerald-500/30">
                      {hg.headers.map((h) => (
                        <TableHead
                          key={h.id}
                          className="text-[11px] font-semibold uppercase tracking-wide text-white"
                        >
                          {h.isPlaceholder ? null : <FlexRender header={h} />}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {filteredData.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id} className="h-9">
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="h-9 py-0">
                            <FlexRender cell={cell} />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-28 text-center text-muted-foreground"
                      >
                        {cargando
                          ? "Cargando..."
                          : "No se encontraron registros con esos filtros"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <PaginacionTabla
            pageIndex={pageIndex}
            totalPaginas={totalPaginas}
            pageSize={pageSize}
            total={filteredData.length}
            onPageSizeChange={n => {
              setPageSize(n);
              setPageIndex(0);
            }}
            onPrevious={() => setPageIndex(p => Math.max(0, p - 1))}
            onNext={() => setPageIndex(p => p + 1)}
            pageSizes={[5, 10, 20, 50]}
            singular="catálogo"
            plural="catálogos"
            cargando={cargando}
          />
        </CardContent>
      </Card>

      <CatalogoDialog
        key={dialogKey}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        data={dialogData}
        onGuardado={onGuardado}
        catalogos={resultado}
      />

      <AlertDialog open={!!confirmar} onOpenChange={(o) => !o && setConfirmar(null)}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmar?.tipo === "eliminar"
                ? "¿Eliminar registro?"
                : confirmar?.fila.activo
                ? "¿Desactivar registro?"
                : "¿Activar registro?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmar?.tipo === "eliminar"
                ? `Se eliminará permanentemente "${confirmar?.fila.nombre}". Esta acción no se puede deshacer.`
                : confirmar?.fila.activo
                ? `El registro "${confirmar?.fila.nombre}" dejará de estar disponible. Podrá reactivarlo después.`
                : `El registro "${confirmar?.fila.nombre}" será activado y volverá a estar disponible.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={procesando}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => void confirmarAccion()}
              disabled={procesando}
            >
              {procesando ? "Procesando..." : confirmar?.tipo === "eliminar" ? "Eliminar" : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}