"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Boxes, Check, ChevronLeft, ChevronRight, Loader2, Plus, Search } from "lucide-react";

import { obtenerProductosCatalogo } from "@/actions/venta.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ProductoResultado } from "@/components/ventas/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAgregar: (producto: ProductoResultado) => void;
  agregados: string[];
}

function etiquetaCategoria(p: ProductoResultado) {
  return (
    p.categoria?.nombre ??
    (p.tipoInventario === "BASE_ACTIVA" ? "Base Activa" : "Producto Terminado")
  );
}

export function CatalogoProductosModal({ open, onOpenChange, onAgregar, agregados }: Props) {
  const [productos, setProductos] = useState<ProductoResultado[] | null>(null);
  const [cargando, setCargando] = useState(false);
  const [q, setQ] = useState("");
  const [agregado, setAgregado] = useState<string | null>(null);
  const [pagina, setPagina] = useState(0);
  const POR_PAGINA = 12;

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const res = await obtenerProductosCatalogo();
      setProductos(res);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => void cargar(), 0);
    return () => window.clearTimeout(id);
  }, [open, cargar]);

  const handleOpenChange = (o: boolean) => {
    if (!o) {
      setQ("");
      setAgregado(null);
    }
    setPagina(0);
    onOpenChange(o);
  };

  const agregadosSet = useMemo(() => new Set(agregados), [agregados]);

  const filtrados = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return productos ?? [];
    return (productos ?? []).filter(
      (p) =>
        p.codigo.toLowerCase().includes(term) ||
        p.descripcion.toLowerCase().includes(term) ||
        (p.codigoExistencia ?? "").toLowerCase().includes(term),
    );
  }, [productos, q]);

  const totalPaginas = useMemo(
    () => Math.max(1, Math.ceil(filtrados.length / POR_PAGINA)),
    [filtrados],
  );
  const paginaSegura = Math.min(pagina, totalPaginas - 1);
  const visibles = useMemo(
    () =>
      filtrados.slice(
        paginaSegura * POR_PAGINA,
        (paginaSegura + 1) * POR_PAGINA,
      ),
    [filtrados, paginaSegura],
  );

  const agregar = (p: ProductoResultado) => {
    onAgregar(p);
    setAgregado(p.id);
    window.setTimeout(() => setAgregado((id) => (id === p.id ? null : id)), 900);
  };

  const primeraCarga = cargando && productos === null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl!">
        <DialogTitle className="flex items-center gap-2.5 text-base font-semibold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Boxes className="size-4" />
          </span>
          Catálogo de Productos
        </DialogTitle>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Filtrar por código, código de barras o nombre..."
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPagina(0);
            }}
            autoFocus
          />
        </div>

        {primeraCarga ? (
          <div className="flex flex-col items-center gap-2 px-4 py-14 text-center text-sm text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            Cargando productos...
          </div>
        ) : filtrados.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-14 text-center text-sm text-muted-foreground">
            <Boxes className="h-8 w-8" />
            {q.trim() ? (
              <>No se encontraron productos con «{q}»</>
            ) : (
              <>No hay productos activos registrados</>
            )}
          </div>
        ) : (
          <div className="relative">
            {cargando && (
              <div className="absolute inset-0 z-10 flex items-start justify-center rounded-lg bg-background/60 pt-24">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            )}
            <ul className="grid max-h-[55vh] grid-cols-1 gap-2.5 overflow-y-auto pr-1 sm:grid-cols-2">
              {visibles.map((p) => {
                const yaAgregado = agregadosSet.has(p.id);
                const esAgregado = agregado === p.id;
                return (
                  <li
                    key={p.id}
                    className="flex flex-col gap-2 rounded-lg border p-3 transition-colors hover:border-blue-300 hover:bg-blue-50/40"
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      {etiquetaCategoria(p)}
                    </span>
                    <p className="line-clamp-2 min-h-10 text-sm font-medium">{p.descripcion}</p>
                    <div className="flex items-center justify-between gap-2">
                      <span className="min-w-0 truncate font-mono text-xs font-bold text-blue-600">
                        {p.codigo}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant={yaAgregado && !esAgregado ? "outline" : "default"}
                        disabled={yaAgregado && !esAgregado}
                        onClick={() => agregar(p)}
                        className={
                          yaAgregado && !esAgregado
                            ? "shrink-0 gap-1"
                            : "shrink-0 gap-1 bg-blue-600 text-white hover:bg-blue-700"
                        }
                      >
                        {esAgregado || (yaAgregado && esAgregado) ? (
                          <>
                            <Check className="size-3.5" />
                            Agregado
                          </>
                        ) : yaAgregado ? (
                          "En el detalle"
                        ) : (
                          <>
                            <Plus className="size-3.5" />
                            Agregar
                          </>
                        )}
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
            {filtrados.length > POR_PAGINA && (
              <div className="mt-3 flex items-center justify-between border-t pt-2">
                <span className="text-[11px] text-muted-foreground tabular-nums">
                  {paginaSegura * POR_PAGINA + 1}–
                  {Math.min(
                    (paginaSegura + 1) * POR_PAGINA,
                    filtrados.length,
                  )}{" "}
                  de {filtrados.length} productos
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-xs"
                    disabled={paginaSegura === 0}
                    onClick={() => setPagina(p => Math.max(0, p - 1))}
                    aria-label="Página anterior"
                  >
                    <ChevronLeft />
                  </Button>
                  <span className="px-1 text-[11px] font-semibold tabular-nums text-muted-foreground">
                    {paginaSegura + 1} / {totalPaginas}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-xs"
                    disabled={paginaSegura + 1 === totalPaginas}
                    onClick={() => setPagina(p => Math.min(totalPaginas - 1, p + 1))}
                    aria-label="Página siguiente"
                  >
                    <ChevronRight />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}