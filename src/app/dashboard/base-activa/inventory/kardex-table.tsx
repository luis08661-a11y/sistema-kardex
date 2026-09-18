"use client";

import type { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Pencil,
  Trash2,
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
} from "lucide-react";
import {
  coreFeatures,
  createColumnHelper,
  type ColumnDef,
  FlexRender,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";

export interface KardexRow {
  id: string;
  fecha: string;
  codigo: string;
  descripcion: string;
  observacion: string;
  responsable_del_registro: string;
  tipo_operacion: string;
  operacion_codigo: string;

  entrada_und: number;
  entrada_peso_kg: number;
  entrada_peso_total: number;

  salida_und: number;
  salida_peso_unitario: number;
  salida_peso_total: number;

  saldo_und: number;
  saldo_peso_kg: number;
  saldo_peso_total: number;

  motivo_salida_formulacion: string | null;
  responsable_formulacion: string | null;
  cantidad_producto_formulado: number | null;
  almacenamiento: string | null;
}

export type SortKey =
  | "fecha"
  | "entrada_und"
  | "entrada_peso_total"
  | "salida_und"
  | "salida_peso_total"
  | "saldo_und"
  | "saldo_peso_total";

export interface SortState {
  key: SortKey;
  dir: "asc" | "desc";
}

interface KardexTotals {
  entradaUnd: number;
  entradaPesoKg: number;
  entradaPeso: number;
  salidaUnd: number;
  salidaPesoKg: number;
  salidaPeso: number;
  saldoUnd: number;
  saldoPesoKg: number;
  saldoPeso: number;
}

interface KardexTableProps {
  rows: KardexRow[];
  onEditar?: (row: KardexRow) => void;
  onEliminar?: (row: KardexRow) => void;
  sort?: SortState | null;
  onSort?: (key: SortKey) => void;
  totals?: KardexTotals;
}

const features = tableFeatures({ ...coreFeatures });

const helper = createColumnHelper<typeof features, KardexRow>();

const fmt = (n: unknown) => {
  const x = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(x) || x === 0) {
    return <span className="text-muted-foreground/50">—</span>;
  }
  return x.toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const fmtInt = (n: unknown) => {
  const x = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(x) || x === 0) {
    return <span className="text-muted-foreground/50">—</span>;
  }
  return x.toLocaleString("es-PE");
};

const textCell = (v: unknown) =>
  v ? (
    <span>{String(v)}</span>
  ) : (
    <span className="text-muted-foreground/50">—</span>
  );

function SortHead({
  label,
  activeDir,
  onClick,
  className,
}: {
  label: string;
  activeDir?: "asc" | "desc";
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-0.5 uppercase tracking-wide transition-colors hover:text-foreground",
        className
      )}>
      {label}
      {activeDir ? (
        activeDir === "asc" ? (
          <ArrowUp className="h-3 w-3" />
        ) : (
          <ArrowDown className="h-3 w-3" />
        )
      ) : (
        <ChevronsUpDown className="h-3 w-3 opacity-40" />
      )}
    </button>
  );
}

function sortable(
  sort: SortState | null | undefined,
  onSort: ((key: SortKey) => void) | undefined,
  key: SortKey,
  label: string,
  className: string
) {
  return (
    <SortHead
      label={label}
      activeDir={sort?.key === key ? sort.dir : undefined}
      onClick={() => onSort?.(key)}
      className={className}
    />
  );
}
const CELL_CLASS: Record<string, string> = {
  fecha: "whitespace-nowrap text-muted-foreground",
  codigo: "whitespace-nowrap font-semibold text-foreground",
  descripcion: "text-foreground",
  observacion: "max-w-[120px] truncate uppercase text-muted-foreground",
  responsable_del_registro: "max-w-[140px] truncate text-muted-foreground",
  tipo_operacion: "border-r border-border",
  entrada_und: "border-r border-border font-medium text-foreground",
  entrada_peso_kg: "border-r border-border text-muted-foreground",
  entrada_peso_total: "border-r border-border font-medium text-emerald-600 dark:text-emerald-400",
  salida_und: "border-r border-border font-medium text-foreground",
  salida_peso_unitario: "border-r border-border text-muted-foreground",
  salida_peso_total: "border-r border-border font-medium text-red-500",
  saldo_und: "border-r border-border font-medium text-foreground",
  saldo_peso_kg: "border-r border-border text-muted-foreground",
  saldo_peso_total: "border-r border-border font-semibold text-blue-500",
  motivo_salida_formulacion: "border-r border-border font-semibold text-foreground",
  responsable_formulacion: "max-w-[120px] truncate border-r border-border text-muted-foreground",
  cantidad_producto_formulado: "border-r border-border text-muted-foreground",
  almacenamiento: "max-w-[80px] truncate border-r border-border uppercase text-muted-foreground",
  accion: "",
};

function grp(
  id: string,
  header: () => ReactNode,
  ...cols: unknown[]
) {
  return helper.group({
    id,
    header,
    columns: cols as ColumnDef<typeof features, KardexRow>[],
  });
}

function buildColumns(
  sort: SortState | null | undefined,
  onSort: ((key: SortKey) => void) | undefined,
  onEditar?: (row: KardexRow) => void,
  onEliminar?: (row: KardexRow) => void
) {
  return [
    grp("detalle", () => (
      <span className="text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
        Detalle del Registro
      </span>
    ),
      helper.accessor("fecha", {
        id: "fecha",
        header: () => sortable(sort, onSort, "fecha", "Fecha", "text-primary-foreground"),
      }),
      helper.accessor("codigo", {
        header: () => <span className="text-[10px] font-bold uppercase tracking-wider text-primary-foreground">Código</span>,
        cell: (info) => (
          <Badge variant="outline" className="bg-muted font-mono text-[10px]">
            {info.getValue()}
          </Badge>
        ),
      }),
      helper.accessor("descripcion", {
        header: () => <span className="text-[10px] font-bold uppercase tracking-wider text-primary-foreground">Descripción</span>,
      }),
      helper.accessor("observacion", {
        header: () => <span className="text-[10px] font-bold uppercase tracking-wider text-primary-foreground">Observación</span>,
        cell: (info) => textCell(info.getValue()),
      }),
      helper.accessor("responsable_del_registro", {
        header: () => <span className="text-[10px] font-bold uppercase tracking-wider text-primary-foreground">Responsable</span>,
      })
    ),
    grp("operacion", () => (
      <span className="text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
        Operación
      </span>
    ),
      helper.accessor("tipo_operacion", {
        header: () => <span className="text-[10px] font-bold uppercase tracking-wider text-primary-foreground">Tipo</span>,
        cell: (info) => {
          const isSalida = info.row.original.salida_und > 0;
          return (
            <Badge
              variant="outline"
              className={cn(
                "whitespace-nowrap text-[9px] font-semibold",
                isSalida
                  ? "border-red-200 bg-red-100/60 text-red-700 dark:border-red-900 dark:bg-red-900/30 dark:text-red-300"
                  : "border-emerald-200 bg-emerald-100/60 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-300"
              )}>
              {info.getValue()}
            </Badge>
          );
        },
      })
    ),
    grp("entradas", () => (
      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
        Entradas
      </span>
    ),
      helper.accessor("entrada_und", {
        header: () => sortable(sort, onSort, "entrada_und", "Und", "text-emerald-200"),
        cell: (info) => {
          const v = info.getValue();
          return v > 0 ? (
            <span className="inline-flex items-center gap-1">
              <ArrowDownCircle className="h-3 w-3 text-emerald-500" />
              {fmtInt(v)}
            </span>
          ) : (
            fmtInt(v)
          );
        },
      }),
      helper.accessor("entrada_peso_kg", {
        header: () => <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">Peso Kg</span>,
        cell: (info) => fmt(info.getValue()),
      }),
      helper.accessor("entrada_peso_total", {
        header: () => sortable(sort, onSort, "entrada_peso_total", "Total", "text-emerald-200"),
        cell: (info) => fmt(info.getValue()),
      })
    ),
    grp("salidas", () => (
      <span className="text-[10px] font-bold uppercase tracking-wider text-red-200">
        Salidas
      </span>
    ),
      helper.accessor("salida_und", {
        header: () => sortable(sort, onSort, "salida_und", "Und", "text-red-200"),
        cell: (info) => {
          const v = info.getValue();
          return v > 0 ? (
            <span className="inline-flex items-center gap-1">
              <ArrowUpCircle className="h-3 w-3 text-red-500" />
              {fmtInt(v)}
            </span>
          ) : (
            fmtInt(v)
          );
        },
      }),
      helper.accessor("salida_peso_unitario", {
        header: () => <span className="text-[10px] font-bold uppercase tracking-wider text-red-200">Peso Kg</span>,
        cell: (info) => fmt(info.getValue()),
      }),
      helper.accessor("salida_peso_total", {
        header: () => sortable(sort, onSort, "salida_peso_total", "Total", "text-red-200"),
        cell: (info) => fmt(info.getValue()),
      })
    ),
    grp("saldo", () => (
      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-200">
        Saldo Final
      </span>
    ),
      helper.accessor("saldo_und", {
        header: () => sortable(sort, onSort, "saldo_und", "Und", "text-sky-200"),
        cell: (info) => fmtInt(info.getValue()),
      }),
      helper.accessor("saldo_peso_kg", {
        header: () => <span className="text-[10px] font-bold uppercase tracking-wider text-sky-200">Peso Kg</span>,
        cell: (info) => fmt(info.getValue()),
      }),
      helper.accessor("saldo_peso_total", {
        header: () => sortable(sort, onSort, "saldo_peso_total", "Total", "text-sky-200"),
        cell: (info) => fmt(info.getValue()),
      })
    ),
    grp("motivo", () => (
      <span className="text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
        Motivo Salida
      </span>
    ),
      helper.accessor("motivo_salida_formulacion", {
        header: () => <span className="text-[10px] font-bold uppercase tracking-wider text-primary-foreground">Tipo</span>,
      })
    ),
    grp("registro_final", () => (
      <span className="text-[10px] font-bold uppercase tracking-wider text-violet-200">
        Registro Final
      </span>
    ),
      helper.accessor("responsable_formulacion", {
        header: () => <span className="text-[10px] font-bold uppercase tracking-wider text-violet-200">Resp.</span>,
        cell: (info) => textCell(info.getValue()),
      }),
      helper.accessor("cantidad_producto_formulado", {
        header: () => <span className="text-[10px] font-bold uppercase tracking-wider text-violet-200">Cant.</span>,
        cell: (info) => fmtInt(info.getValue()),
      }),
      helper.accessor("almacenamiento", {
        header: () => <span className="text-[10px] font-bold uppercase tracking-wider text-violet-200">Almacén</span>,
        cell: (info) => textCell(info.getValue()),
      })
    ),
    helper.accessor("id", {
      id: "accion",
      header: () => null,
      cell: (info) => {
        const row = info.row.original;
        return (
          <div className="flex items-center justify-center gap-1">
            <button
              type="button"
              title="Editar"
              onClick={() => onEditar?.(row)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary">
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              title="Eliminar"
              onClick={() => onEliminar?.(row)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      },
    }),
  ] as ColumnDef<typeof features, KardexRow>[];
}
export default function KardexTable({
  rows,
  onEditar,
  onEliminar,
  sort,
  onSort,
  totals,
}: KardexTableProps) {
  const columns = buildColumns(sort, onSort, onEditar, onEliminar);
  const table = useTable(
    { features, columns, data: rows, getRowId: (row) => row.id },
    (state) => state
  );

  const totalLeafCols = table.getAllLeafColumns().length;

  return (
    <div className="w-full overflow-hidden rounded-lg border">
      <div className="w-full overflow-x-auto">
        <Table className="min-w-[1180px] border-collapse text-[11px] leading-tight">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className={
                  headerGroup.id === "0" || headerGroup.depth === 0
                    ? "bg-primary/90 hover:bg-primary/90"
                    : "bg-muted hover:bg-muted"
                }>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={cn(
                      "border-r border-primary/30 text-center",
                      headerGroup.depth === 0 ? "py-1" : "py-1.5 font-semibold",
                      header.column.id === "accion" && "border-r-0"
                    )}>
                    {header.isPlaceholder ? null : (
                      <FlexRender header={header} />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => {
                const isSalida = row.original.salida_und > 0;
                return (
                  <TableRow
                    key={row.id}
                    className={cn(
                      "border-b border-border text-center transition-colors hover:bg-muted/70",
                      isSalida
                        ? "bg-red-50/40 dark:bg-red-950/10"
                        : "bg-emerald-50/30 dark:bg-emerald-950/5"
                    )}>
                    {row.getAllCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn("py-1.5", CELL_CLASS[cell.column.id] ?? "text-center")}>
                        <FlexRender cell={cell} />
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-12 text-center text-sm text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-2xl">📦</span>
                    No se encontraron registros de inventario.
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
{totals && rows.length > 0 && (
            <TableFooter>
              <TableRow className="border-t border-border text-center">
                <TableCell
                  colSpan={6}
                  className="py-2 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Totales
                </TableCell>
                <TableCell className="py-2 font-bold text-emerald-600 dark:text-emerald-400">
                  {fmtInt(totals.entradaUnd)}
                </TableCell>
                <TableCell className="py-2 font-bold text-emerald-600 dark:text-emerald-400">
                  {fmt(totals.entradaPesoKg)}
                </TableCell>
                <TableCell className="py-2 font-bold text-emerald-600 dark:text-emerald-400">
                  {fmt(totals.entradaPeso)}
                </TableCell>
                <TableCell className="py-2 font-bold text-red-500">
                  {fmtInt(totals.salidaUnd)}
                </TableCell>
                <TableCell className="py-2 font-bold text-red-500">
                  {fmt(totals.salidaPesoKg)}
                </TableCell>
                <TableCell className="py-2 font-bold text-red-500">
                  {fmt(totals.salidaPeso)}
                </TableCell>
                <TableCell className="py-2 font-bold text-sky-600 dark:text-sky-400">
                  {fmtInt(totals.saldoUnd)}
                </TableCell>
                <TableCell className="py-2 font-bold text-sky-600 dark:text-sky-400">
                  {fmt(totals.saldoPesoKg)}
                </TableCell>
                <TableCell className="py-2 font-bold text-blue-500">
                  {fmt(totals.saldoPeso)}
                </TableCell>
                <TableCell
                  colSpan={Math.max(0, totalLeafCols - 15)}
                  className="py-2"
                />
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>
    </div>
  );
}