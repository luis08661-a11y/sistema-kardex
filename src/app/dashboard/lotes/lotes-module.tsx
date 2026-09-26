"use client";

import * as React from "react";
import { useActionState, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  LayersIcon,
  SearchIcon,
  PlusIcon,
  PackagePlusIcon,
  PencilIcon,
  Trash2Icon,
  BoxesIcon,
  LinkIcon,
  ScaleIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PaginacionTabla } from "@/components/shared/paginacion-tabla";
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
  FlexRender,
  columnVisibilityFeature,
  createColumnHelper,
  createPaginatedRowModel,
  rowPaginationFeature,
  tableFeatures,
  useTable,
  type ColumnDef,
  type PaginationState,
} from "@tanstack/react-table";

import {
  actualizarLote,
  crearLote,
  eliminarLote,
  type LoteState,
} from "@/actions/lotes.actions";
import type { ContextoLotes, LoteListado } from "@/lib/services/lotes.service";

/* -------------------------------------------------------------------------- */
/* TIPOS                                                                      */
/* -------------------------------------------------------------------------- */

type LoteRow = LoteListado;

type Contexto = ContextoLotes;

type Props = {
  lotes: LoteRow[];
  contexto: Contexto;
};

const initialState: LoteState = { success: false, message: "" };

const pad = (n: number) => String(n).padStart(2, "0");
const hoy = `${new Date().getFullYear()}-${pad(new Date().getMonth() + 1)}-${pad(new Date().getDate())}`;

const fmtFecha = (iso: string | null) => {
  if (!iso) return "—";
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return "—";
  return new Date(y, m - 1, d).toLocaleDateString("es-PE");
};

const toDateValue = (iso: string | null) => {
  const [y, m, d] = (iso ?? "").slice(0, 10).split("-").map(Number);
  return y && m && d ? `${y}-${pad(m)}-${pad(d)}` : hoy;
};

/* -------------------------------------------------------------------------- */
/* TANSTACK FEATURES                                                          */
/* -------------------------------------------------------------------------- */

const lotesFeatures = tableFeatures({
  columnVisibilityFeature,
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
});

const columnHelper = createColumnHelper<typeof lotesFeatures, LoteRow>();

/* -------------------------------------------------------------------------- */
/* SELECT CONTROLADO (muestra el texto, no el id)                             */
/* -------------------------------------------------------------------------- */

function ControlledSelect({
  name,
  value,
  onChange,
  options,
  placeholder,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}) {
  const selected = options.find(option => option.value === value)?.label;

  return (
    <>
      <input type="hidden" name={name} value={value === "NONE" ? "" : value} />

      <Select
        value={value || null}
        onValueChange={newValue => onChange(newValue ?? "")}>
        <SelectTrigger className="h-9 w-full">
          {selected ? (
            <span className="line-clamp-1 text-left">{selected}</span>
          ) : (
            <SelectValue placeholder={placeholder} />
          )}
        </SelectTrigger>

        <SelectContent>
          {options.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* FORMULARIO DE LOTE (crear / editar)                                        */
/* -------------------------------------------------------------------------- */

type LoteFormInitial = {
  id?: string;
  productoId: string;
  codigo: string;
  fechaIngreso: string;
  pesoUnitarioKg: string;
  almacenamientoId: string;
};

function LoteForm({
  formAction,
  pending,
  submitLabel,
  submitIcon,
  onCancel,
  productos,
  almacenamientos,
  initial,
  bloqueado = false,
}: {
  formAction: (fd: FormData) => void;
  pending: boolean;
  submitLabel: string;
  submitIcon: React.ReactNode;
  onCancel: () => void;
  productos: Contexto["productos"];
  almacenamientos: Contexto["almacenamientos"];
  initial: LoteFormInitial;
  bloqueado?: boolean;
}) {
  const [productoId, setProductoId] = useState(initial.productoId);
  const [almacenamientoId, setAlmacenamientoId] = useState(initial.almacenamientoId);

  const producto = productos.find(p => p.id === initial.productoId);
  const productoLabel = producto ? `${producto.descripcion} (${producto.codigo})` : "—";

  return (
    <form action={formAction} className="flex flex-col gap-5 px-6 py-5">
      {initial.id && <input type="hidden" name="id" value={initial.id} />}

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Producto *">
          {bloqueado ? (
            <>
              <input type="hidden" name="productoId" value={initial.productoId} />
              <div className="flex h-9 items-center rounded-md border bg-muted/40 px-3 text-sm">
                <span className="line-clamp-1">{productoLabel}</span>
              </div>
            </>
          ) : (
            <ControlledSelect
              name="productoId"
              value={productoId}
              onChange={setProductoId}
              placeholder="Seleccionar producto"
              options={productos.map(p => ({
                value: p.id,
                label: `${p.descripcion} (${p.codigo})`,
              }))}
            />
          )}
        </Field>

        <Field label="Lote *">
          {bloqueado ? (
            <>
              <input type="hidden" name="codigo" value={initial.codigo} />
              <div className="flex h-9 items-center rounded-md border bg-muted/40 px-3 font-mono font-semibold uppercase">
                {initial.codigo}
              </div>
            </>
          ) : (
            <Input
              name="codigo"
              className="h-9 uppercase"
              placeholder="Ej. TH2026-01"
              defaultValue={initial.codigo}
              required
            />
          )}
        </Field>
      </div>

      {bloqueado && (
        <p className="text-xs text-muted-foreground">
          Este lote tiene movimientos: el producto y el código no se pueden modificar.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Fecha *">
          <Input
            name="fechaIngreso"
            type="date"
            className="h-9"
            defaultValue={initial.fechaIngreso}
            required
          />
        </Field>

        <Field label="Peso (Kg)">
          <Input
            name="pesoUnitarioKg"
            type="number"
            className="h-9"
            defaultValue={initial.pesoUnitarioKg}
            min="0"
            step="0.01"
          />
        </Field>
      </div>

      <Field label="Ubicación">
        <ControlledSelect
          name="almacenamientoId"
          value={almacenamientoId}
          onChange={setAlmacenamientoId}
          placeholder="Seleccionar ubicación (opcional)"
          options={almacenamientos.map(a => ({
            value: a.id,
            label: a.nombre,
          }))}
        />
      </Field>

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={pending} className="gap-2">
          {submitIcon}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/* COMPONENTE PRINCIPAL                                                       */
/* -------------------------------------------------------------------------- */

export function LotesModule({ lotes, contexto }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  /* ------------------------------ formulario ------------------------------ */

  const [open, setOpen] = useState(false);
  const [state, formAction, actionPending] = useActionState(crearLote, initialState);

  /* ---------------------------- edición de lote ---------------------------- */

  const [editing, setEditing] = useState<LoteRow | null>(null);
  const [editState, editAction, editActionPending] = useActionState(actualizarLote, initialState);

  /* ------------------------------- listado -------------------------------- */

  const [query, setQuery] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 8,
  });

  /* ----------------------------- confirmación ------------------------------ */

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return lotes;
    return lotes.filter(
      lote =>
        lote.codigo.toLowerCase().includes(q) ||
        lote.producto.descripcion.toLowerCase().includes(q) ||
        lote.producto.codigo.toLowerCase().includes(q),
    );
  }, [lotes, query]);

  const columns = useMemo(
    () => buildColumns(setDeleteId, setEditing),
    [setDeleteId],
  );

  const table = useTable({
    features: lotesFeatures,
    data: rows,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getRowId: row => row.id,
  });

  /* --------------------------- respuesta crear ---------------------------- */

  useEffect(() => {
    if (!state.message) return;

    if (state.success) {
      toast.success(state.message);
      router.refresh();
      const timer = setTimeout(() => setOpen(false), 0);
      return () => clearTimeout(timer);
    }

    toast.error(state.message);
  }, [state, router]);

  /* --------------------------- respuesta editar --------------------------- */

  useEffect(() => {
    if (!editState.message) return;

    if (editState.success) {
      toast.success(editState.message);
      router.refresh();
      const timer = setTimeout(() => setEditing(null), 0);
      return () => clearTimeout(timer);
    }

    toast.error(editState.message);
  }, [editState, router]);

  /* ------------------------------ eliminar -------------------------------- */

  const confirmDelete = () => {
    if (!deleteId) return;
    const id = deleteId;
    setDeleteId(null);

    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", id);
      const result = await eliminarLote(fd);

      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  const stats = useMemo(
    () => ({
      total: lotes.length,
      conMovimientos: lotes.filter(l => l._count.movimientos > 0).length,
      pesoTotal: lotes.reduce((sum, l) => sum + Number(l.pesoUnitarioKg ?? 0), 0),
      baseActiva: contexto.productos.length,
    }),
    [lotes, contexto],
  );

  return (
    <div className="w-full space-y-6 p-4 sm:p-6">
      {/* ── HERO ── */}
      <div className="relative overflow-hidden rounded-xl border border-slate-700/60 bg-[#0f172a] p-4 text-white shadow-lg shadow-emerald-500/10">
        <div className="absolute -right-8 -top-2 h-32 w-32 rounded-full bg-emerald-500/5 blur-2xl" />
        <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-emerald-500/5 blur-xl" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 shadow-sm shadow-emerald-500/30">
              <LayersIcon className="h-4.5 w-4.5" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight">
                LOTES
              </h1>
              <p className="text-[14px] text-slate-400">
                Lotes de Base Activa · el stock se genera con movimientos de entrada.
              </p>
            </div>
          </div>
          <Button size="sm" className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-500" onClick={() => setOpen(true)}>
            <PlusIcon className="size-4" />
            Generar Lote
          </Button>
        </div>
      </div>

      {/* ── ESTADÍSTICAS ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={LayersIcon} title="Lotes registrados" value={String(stats.total)} />
        <Stat icon={BoxesIcon} title="Productos Base Activa" value={String(stats.baseActiva)} />
        <Stat icon={LinkIcon} title="Lotes con movimientos" value={String(stats.conMovimientos)} />
        <Stat icon={ScaleIcon} title="Peso registrado" value={`${stats.pesoTotal.toFixed(2)} Kg`} />
      </div>

      {/* ── TABLA ── */}
      <Card>
        <CardContent className="space-y-4">
          {/* filtros */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:max-w-80">
              <SearchIcon className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Buscar lote o producto..."
                value={query}
                onChange={({ target }) => setQuery(target.value)}
              />
            </div>
          </div>

          <Separator />

          {/* tabla */}
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="bg-emerald-600">
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id} className="border-emerald-500/30">
                    {headerGroup.headers.map(header => (
                      <TableHead key={header.id} className="text-[11px] font-semibold uppercase tracking-wide text-white">
                        {header.isPlaceholder ? null : <FlexRender header={header} />}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map(row => (
                    <TableRow key={row.id} className="h-9">
                      {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id} className="py-1.5">
                          <FlexRender cell={cell} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                      No se encontraron lotes.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* paginación */}
          <PaginacionTabla
            pageIndex={table.state.pagination.pageIndex}
            totalPaginas={Math.max(table.getPageCount(), 1)}
            pageSize={table.state.pagination.pageSize}
            total={rows.length}
            onPageSizeChange={n => {
              table.setPageSize(n);
              table.setPageIndex(0);
            }}
            onPrevious={() => table.previousPage()}
            onNext={() => table.nextPage()}
            singular="lote"
            plural="lotes"
          />
        </CardContent>
      </Card>

      {/* -------------------------------------------------------------- */}
      {/* MODAL GENERAR LOTE                                                */}
      {/* -------------------------------------------------------------- */}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl! p-0">
          <DialogHeader className="rounded-t-xl bg-foreground px-6 py-4 text-background">
            <DialogTitle className="text-lg">Generar Lote</DialogTitle>
            <p className="text-sm text-background/70">
              Registre el lote de Base Activa. El stock se origina con movimientos.
            </p>
          </DialogHeader>

          <LoteForm
            key="crear"
            formAction={formAction}
            pending={actionPending}
            submitLabel={actionPending ? "Generando..." : "Generar Lote"}
            submitIcon={<PackagePlusIcon />}
            onCancel={() => setOpen(false)}
            productos={contexto.productos}
            almacenamientos={contexto.almacenamientos}
            initial={{
              productoId: "",
              codigo: "",
              fechaIngreso: hoy,
              pesoUnitarioKg: "0",
              almacenamientoId: "",
            }}
          />
        </DialogContent>
      </Dialog>

      {/* -------------------------------------------------------------- */}
      {/* MODAL EDITAR LOTE                                                 */}
      {/* -------------------------------------------------------------- */}

      <Dialog open={editing !== null} onOpenChange={openValue => !openValue && setEditing(null)}>
        <DialogContent className="max-w-xl! p-0">
          <DialogHeader className="rounded-t-xl bg-foreground px-6 py-4 text-background">
            <DialogTitle className="text-lg">Editar Lote</DialogTitle>
            <p className="text-sm text-background/70">
              Actualice los datos del lote. Con movimientos, el producto y el lote quedan fijos.
            </p>
          </DialogHeader>

          {editing && (
            <LoteForm
              key={editing.id}
              formAction={editAction}
              pending={editActionPending}
              submitLabel={editActionPending ? "Guardando..." : "Guardar cambios"}
              submitIcon={<PencilIcon />}
              onCancel={() => setEditing(null)}
              productos={contexto.productos}
              almacenamientos={contexto.almacenamientos}
              bloqueado={editing._count.movimientos > 0}
              initial={{
                id: editing.id,
                productoId: editing.producto.id,
                codigo: editing.codigo,
                fechaIngreso: toDateValue(editing.fechaIngreso),
                pesoUnitarioKg: String(Number(editing.pesoUnitarioKg ?? 0)),
                almacenamientoId: editing.almacenamiento?.id ?? "",
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* -------------------------------------------------------------- */}
      {/* CONFIRMACIÓN DE ELIMINACIÓN                                        */}
      {/* -------------------------------------------------------------- */}

      <AlertDialog open={deleteId !== null} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar lote?</AlertDialogTitle>
            <AlertDialogDescription>
              Solo se elimina si el lote no tiene movimientos asociados. Esta acción no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={pending}
              className="gap-2 bg-destructive text-white hover:bg-destructive/90">
              <Trash2Icon />
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* COLUMNAS                                                                   */
/* -------------------------------------------------------------------------- */

function buildColumns(
  onDelete: (id: string) => void,
  onEdit: (lote: LoteRow) => void,
): ColumnDef<typeof lotesFeatures, LoteRow>[] {
  return columnHelper.columns([
    columnHelper.accessor("codigo", {
      header: "Lote",
      cell: ({ getValue }) => (
        <span className="font-mono font-semibold">{getValue()}</span>
      ),
    }),

    columnHelper.accessor("producto", {
      header: "Producto",
      cell: ({ getValue }) => {
        const p = getValue();
        return (
          <div>
            <div className="font-medium">{p.descripcion}</div>
            <div className="font-mono text-xs text-muted-foreground">{p.codigo}</div>
          </div>
        );
      },
    }),

    columnHelper.accessor("fechaIngreso", {
      header: "Fecha",
      cell: ({ getValue }) => fmtFecha(getValue()),
    }),

    columnHelper.accessor("pesoUnitarioKg", {
      header: () => <div className="text-right">Peso Unit.</div>,
      cell: ({ getValue }) => (
        <div className="text-right">
          {Number(getValue() ?? 0).toFixed(2)}{" "}
          <span className="text-xs text-muted-foreground">Kg</span>
        </div>
      ),
    }),

    columnHelper.accessor("almacenamiento", {
      header: "Ubicación",
      cell: ({ getValue }) => getValue()?.nombre ?? "—",
    }),

    columnHelper.accessor("_count", {
      header: "Mov.",
      cell: ({ getValue }) => {
        const count = getValue().movimientos;
        return <Badge variant={count > 0 ? "default" : "secondary"}>{count}</Badge>;
      },
    }),

    columnHelper.display({
      id: "acciones",
      header: () => <div className="text-right">Acciones</div>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => onEdit(row.original)}
            title="Editar lote">
            <PencilIcon className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            onClick={() => onDelete(row.original.id)}
            title="Eliminar lote">
            <Trash2Icon className="size-4" />
          </Button>
        </div>
      ),
    }),
  ]);
}

/* -------------------------------------------------------------------------- */
/* CAMPO                                                                      */
/* -------------------------------------------------------------------------- */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wide">{label}</Label>
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ESTADÍSTICA                                                                */
/* -------------------------------------------------------------------------- */

function Stat({
  icon: Icon,
  title,
  value,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-5">
        <div className="rounded-lg border p-2">
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}