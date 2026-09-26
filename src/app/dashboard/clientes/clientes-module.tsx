"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Users,
  Search,
  Plus,
  Pencil,
  Power,
  Trash2,
  Loader2,
  Mail,
  Phone,
} from "lucide-react";
import {
  columnVisibilityFeature,
  createColumnHelper,
  FlexRender,
  rowPaginationFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";

import {
  cambiarEstadoCliente,
  eliminarCliente,
  obtenerClientes,
} from "@/actions/cliente.actions";
import type { ClientesPaginadasDTO } from "@/lib/services/cliente.service";
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
import { TIPO_DOCUMENTO_LABEL, type TipoDocumento } from "@/components/ventas/types";
import { ClienteDialog } from "@/components/clientes/cliente-dialog";
import { PaginacionTabla } from "@/components/shared/paginacion-tabla";
import { ModuloCabecera } from "@/components/shared/modulo-cabecera";

type Fila = ClientesPaginadasDTO["data"][number];

const features = tableFeatures({ rowPaginationFeature, columnVisibilityFeature });
const columnHelper = createColumnHelper<typeof features, Fila>();

export function ClientesModule({ resultadoInicial }: { resultadoInicial: ClientesPaginadasDTO }) {
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState("TODOS");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(
    () => Math.min(resultadoInicial.pageSize || 10, 10),
  );
  const [resultado, setResultado] = useState<ClientesPaginadasDTO>(resultadoInicial);
  const [cargando, setCargando] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogCliente, setDialogCliente] = useState<Fila | null>(null);
  const [dialogKey, setDialogKey] = useState(0);
  const [confirmar, setConfirmar] = useState<{ tipo: "eliminar" | "desactivar"; fila: Fila } | null>(null);
  const [procesando, setProcesando] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, []);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const res = await obtenerClientes({
        page: pageIndex + 1,
        pageSize,
        search,
        estado,
      });
      setResultado(res);
      if (res.page < pageIndex + 1) setPageIndex(Math.max(0, res.page - 1));
    } finally {
      setCargando(false);
    }
  }, [pageIndex, pageSize, search, estado]);

  const handleDialogOpenChange = (o: boolean) => {
    setDialogOpen(o);
    if (o) void cargar();
  };

  const onSearchChange = (v: string) => {
    setSearch(v);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setPageIndex(0), 350);
  };

  const abrirNuevo = () => {
    setDialogCliente(null);
    setDialogKey((k) => k + 1);
    setDialogOpen(true);
  };

  const abrirEditar = useCallback((fila: Fila) => {
    setDialogCliente(fila);
    setDialogKey((k) => k + 1);
    setDialogOpen(true);
  }, []);

  const onGuardadoCliente = () => {
    void cargar();
  };

  const activar = useCallback(
    async (fila: Fila) => {
      const res = await cambiarEstadoCliente(fila.id, true);
      if (res.success) {
        toast.success(res.message);
        void cargar();
      } else {
        toast.error(res.message);
      }
    },
    [cargar],
  );

  const confirmarAccion = async () => {
    if (!confirmar) return;
    setProcesando(true);
    try {
      const res =
        confirmar.tipo === "eliminar"
          ? await eliminarCliente(confirmar.fila.id)
          : await cambiarEstadoCliente(confirmar.fila.id, false);
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

  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("numeroDocumento", {
          header: "Documento",
          cell: ({ row }) => (
            <div className="whitespace-nowrap">
              <div className="text-xs text-muted-foreground">
                {TIPO_DOCUMENTO_LABEL[row.original.tipoDocumento as TipoDocumento]}
              </div>
              <div className="font-mono text-sm font-semibold tabular-nums">
                {row.original.numeroDocumento}
              </div>
            </div>
          ),
        }),
        columnHelper.accessor("razonSocial", {
          header: "Cliente",
          cell: ({ row }) => (
            <div className="max-w-56">
              <div className="truncate font-medium">{row.original.razonSocial}</div>
              <div className="truncate text-xs text-muted-foreground">
                {row.original.empresa}
              </div>
            </div>
          ),
        }),
        columnHelper.accessor("email", {
          header: "Contacto",
          cell: ({ row }) => (
            <div className="max-w-44 whitespace-nowrap text-xs">
              {row.original.email ? (
                <div className="flex items-center gap-1 truncate">
                  <Mail className="size-3 shrink-0 text-muted-foreground" />
                  {row.original.email}
                </div>
              ) : (
                <div className="text-muted-foreground">—</div>
              )}
              {row.original.telefono ? (
                <div className="mt-0.5 flex items-center gap-1 truncate">
                  <Phone className="size-3 shrink-0 text-muted-foreground" />
                  {row.original.telefono}
                </div>
              ) : null}
            </div>
          ),
        }),
        columnHelper.accessor("ventas", {
          header: "Ventas",
          cell: ({ row }) => (
            <div className="text-center tabular-nums">{row.original.ventas}</div>
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
                  onClick={() =>
                    setConfirmar({ tipo: "desactivar", fila: row.original })
                  }
                >
                  <Power />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  title="Activar"
                  className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                  onClick={() => void activar(row.original)}
                >
                  <Power />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon-sm"
                title={
                  row.original.ventas > 0
                    ? "Tiene ventas, no puede eliminarse"
                    : "Eliminar"
                }
                disabled={row.original.ventas > 0}
                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                onClick={() => setConfirmar({ tipo: "eliminar", fila: row.original })}
              >
                <Trash2 />
              </Button>
            </div>
          ),
        }),
      ]),
    [abrirEditar, activar],
  );

  const table = useTable({
    features,
    columns,
    data: resultado.data,
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
    manualPagination: true,
    pageCount: resultado.totalPaginas,
    getRowId: (row) => row.id,
  });

  const totalPaginas = Math.max(1, resultado.totalPaginas);

  return (
    <div className="w-full space-y-6 p-4 sm:p-6">
      {/* ── HERO ── */}
      <ModuloCabecera
        icon={Users}
        titulo="CLIENTES"
        descripcion="Gestione la cartera de clientes usada en ventas y cotizaciones."
        acciones={
          <Button
            size="sm"
            className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-500"
            onClick={abrirNuevo}
          >
            <Plus className="size-4" />
            Nuevo cliente
          </Button>
        }
      />

      {/* ── TABLA ── */}
      <Card>
        <CardContent className="space-y-4">
          {/* filtros */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:max-w-80">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Buscar por documento, nombre o teléfono..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-1 rounded-lg border bg-muted/50 p-0.5">
              {([
                { value: "TODOS", label: "Todos" },
                { value: "ACTIVO", label: "Activos" },
                { value: "INACTIVO", label: "Inactivos" },
              ] as const).map(opt => {
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
                  {resultado.data.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id} className="h-9">
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="py-1.5">
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
                          ? "Cargando clientes..."
                          : "No se encontraron clientes con esos filtros"}
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
            total={resultado.total}
            onPageSizeChange={n => {
              setPageSize(n);
              setPageIndex(0);
            }}
            onPrevious={() => setPageIndex(p => Math.max(0, p - 1))}
            onNext={() => setPageIndex(p => p + 1)}
            pageSizes={[10, 20, 50]}
            singular="cliente"
            plural="clientes"
            cargando={cargando}
          />
        </CardContent>
      </Card>

      <ClienteDialog
        key={dialogKey}
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
        cliente={dialogCliente}
        onGuardado={onGuardadoCliente}
      />

      <AlertDialog open={!!confirmar} onOpenChange={(o) => !o && setConfirmar(null)}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmar?.tipo === "eliminar"
                ? "¿Eliminar cliente?"
                : "¿Desactivar cliente?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmar?.tipo === "eliminar"
                ? `El cliente ${confirmar?.fila.razonSocial ?? ""} se eliminará permanentemente.`
                : `El cliente ${confirmar?.fila.razonSocial ?? ""} dejará de estar disponible para nuevas ventas. Podrá reactivarlo después.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={procesando}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => void confirmarAccion()}
              disabled={procesando}
            >
              {procesando ? "Procesando..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}