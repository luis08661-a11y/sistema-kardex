"use client";

import { useMemo, useState } from "react";
import {
  ScrollText, Search, Download, CalendarDays, User, Activity, Filter,
} from "lucide-react";
import {
  columnVisibilityFeature, createColumnHelper, createPaginatedRowModel,
  FlexRender, rowPaginationFeature, tableFeatures, useTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
} from "lucide-react";

type AuditoriaRow = {
  id: string;
  accion: string;
  entidad: string;
  entidadId: string | null;
  detalle: unknown;
  createdAt: Date;
  usuario: { username: string; name: string } | null;
};

type Props = {
  auditoria: AuditoriaRow[];
};

const features = tableFeatures({
  rowPaginationFeature,
  columnVisibilityFeature,
  paginatedRowModel: createPaginatedRowModel(),
});

export function AuditoriaModule({ auditoria }: Props) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroAccion, setFiltroAccion] = useState("TODAS");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(17);

  const acciones = useMemo(() => {
    const set = new Set(auditoria.map((a) => a.accion));
    return ["TODAS", ...Array.from(set).sort()];
  }, [auditoria]);

  const filtrados = useMemo(() => {
    let r = auditoria;
    if (filtroAccion !== "TODAS") r = r.filter((a) => a.accion === filtroAccion);
    if (busqueda) {
      const q = busqueda.toLowerCase();
      r = r.filter(
        (a) =>
          a.accion.toLowerCase().includes(q) ||
          a.entidad.toLowerCase().includes(q) ||
          (a.usuario?.username ?? "").toLowerCase().includes(q) ||
          (a.usuario?.name ?? "").toLowerCase().includes(q),
      );
    }
    return r;
  }, [auditoria, filtroAccion, busqueda]);

  const columnHelper = useMemo(() => createColumnHelper<typeof features, AuditoriaRow>(), []);
  const columns = useMemo(() => columnHelper.columns([
    columnHelper.accessor("createdAt", {
      header: "Fecha",
      cell: (info) => (
        <span className="text-[11px] whitespace-nowrap">
          {new Date(info.getValue()).toLocaleString("es-PE", {
            day: "2-digit", month: "2-digit", year: "numeric",
            hour: "2-digit", minute: "2-digit",
          })}
        </span>
      ),
    }),
    columnHelper.accessor("usuario", {
      header: "Usuario",
      cell: (info) => {
        const u = info.getValue();
        return (
          <div className="flex items-center gap-1.5">
            <div className="flex size-5 items-center justify-center rounded-full bg-muted text-[9px] font-medium">
              {(u?.username ?? "S").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] leading-tight truncate">{u?.username ?? "Sistema"}</p>
              {u?.name && <p className="text-[9px] text-muted-foreground leading-tight truncate">{u.name}</p>}
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor("accion", {
      header: "Acción",
      cell: (info) => (
        <Badge
          variant="secondary"
          className={`text-[9px] font-medium px-1.5 py-0 ${
            info.getValue() === "CREAR"
              ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
              : info.getValue() === "ELIMINAR"
                ? "bg-rose-500/10 text-rose-300 border-rose-500/30"
                : info.getValue() === "ACTUALIZAR" || info.getValue() === "ACTIVAR"
                  ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                  : info.getValue() === "DESACTIVAR"
                    ? "bg-orange-500/10 text-orange-300 border-orange-500/30"
                    : ""
          }`}
        >
          {info.getValue()}
        </Badge>
      ),
    }),
    columnHelper.accessor("entidad", {
      header: "Entidad",
      cell: (info) => (
        <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0">
          {info.getValue()}
        </Badge>
      ),
    }),
    columnHelper.accessor("entidadId", {
      header: "ID",
      cell: (info) => (
        <span className="text-[10px] text-muted-foreground font-mono truncate block max-w-[100px]">
          {info.getValue() ?? "—"}
        </span>
      ),
    }),
    columnHelper.accessor("detalle", {
      header: "Detalle",
      cell: (info) => {
        const d = info.getValue();
        if (!d) return <span className="text-[10px] text-muted-foreground">—</span>;
        const text = typeof d === "object" ? JSON.stringify(d) : String(d);
        return (
          <span className="text-[10px] text-muted-foreground truncate block max-w-[180px]" title={text}>
            {text}
          </span>
        );
      },
    }),
  ]), [columnHelper]);

  const table = useTable({
    features,
    columns,
    data: filtrados,
    state: { pagination: { pageIndex, pageSize } },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") { const p = updater({ pageIndex, pageSize }); setPageIndex(p.pageIndex); setPageSize(p.pageSize); }
      else { setPageIndex(updater.pageIndex); setPageSize(updater.pageSize); }
    },
    pageCount: Math.ceil(filtrados.length / pageSize),
    getRowId: (row) => row.id,
  });

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden p-4 sm:p-6">
      {/* HERO */}
      <div className="relative mb-4 overflow-hidden rounded-xl border border-slate-700/60 bg-[#0f172a] p-4 text-white shadow-lg shadow-emerald-500/10 shrink-0">
        <div className="absolute -right-8 -top-2 h-32 w-32 rounded-full bg-emerald-500/5 blur-2xl" />
        <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-emerald-500/5 blur-xl" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 shadow-sm shadow-emerald-500/30">
              <ScrollText className="h-4.5 w-4.5" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight">Auditoría del Sistema</h1>
              <p className="text-[14px] text-slate-400">Registro de acciones y seguimiento de actividad</p>
            </div>
          </div>
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <Activity className="size-3.5 text-emerald-400" />
              <span className="text-slate-400">Registros:</span>
              <span className="font-semibold">{filtrados.length}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5 text-emerald-400" />
              <span className="text-slate-400">Total:</span>
              <span className="font-semibold">{auditoria.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* TABLA */}
      <Card className="flex-1 flex flex-col overflow-hidden min-h-0">
        <CardContent className="flex-1 flex flex-col overflow-hidden min-h-0 space-y-4">
          {/* Filtros */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center shrink-0">
            <div className="relative flex-1 sm:max-w-80">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por usuario, acción o entidad..."
                value={busqueda}
                onChange={(e) => { setBusqueda(e.target.value); setPageIndex(0); }}
                className="pl-8"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="size-4 text-muted-foreground" />
              <Select value={filtroAccion} onValueChange={(v) => { if (v) { setFiltroAccion(v); setPageIndex(0); } }}>
                <SelectTrigger size="sm" className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {acciones.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a === "TODAS" ? "Todas las acciones" : a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator className="shrink-0" />

          {/* Tabla */}
          <div className="flex-1 min-h-0 overflow-auto rounded-lg border">
            <Table>
              <TableHeader className="bg-emerald-600 sticky top-0 z-0">
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id} className="border-emerald-500/30">
                    {hg.headers.map((h) => (
                      <TableHead key={h.id} className="h-8 text-[10px] font-semibold uppercase tracking-wide text-white py-1">
                        {h.isPlaceholder ? null : <FlexRender header={h} />}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <ScrollText className="size-8 opacity-30" />
                        <p>No hay registros de auditoría</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="hover:bg-muted/30">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-0.5">
                        <FlexRender cell={cell} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Paginación */}
          <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between shrink-0">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>Página {pageIndex + 1} de {Math.max(1, Math.ceil(filtrados.length / pageSize))}</span>
              <span>{filtrados.length} registro(s)</span>
              <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPageIndex(0); }}>
                <SelectTrigger size="sm" className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50, 100].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-1.5">
              <Button variant="outline" size="icon" className="size-8" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}><ChevronsLeft className="size-4" /></Button>
              <Button variant="outline" size="icon" className="size-8" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}><ChevronLeft className="size-4" /></Button>
              <Button variant="outline" size="icon" className="size-8" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}><ChevronRight className="size-4" /></Button>
              <Button variant="outline" size="icon" className="size-8" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}><ChevronsRight className="size-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
