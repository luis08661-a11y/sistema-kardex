"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Search, X, PackageSearch } from "lucide-react";

import { obtenerCatalogoPos } from "@/actions/pos.actions";
import type { ProductoPosDTO, CatalogoPaginadoDTO } from "@/lib/services/pos.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatearMonedaSoles, formatearNumeroEntero } from "@/lib/pos/calculations";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAgregar: (producto: ProductoPosDTO) => void;
  categorias: { id: string; nombre: string }[];
  initialSearch?: string;
}

export function CatalogoVisualDialog({ open, onOpenChange, onAgregar, categorias, initialSearch }: Props) {
  const [categoriaId, setCategoriaId] = useState("");
  const [q, setQ] = useState(() => initialSearch ?? "");
  const [page, setPage] = useState(1);
  const [resultado, setResultado] = useState<CatalogoPaginadoDTO>({
    data: [],
    total: 0,
    page: 1,
    pageSize: 12,
    totalPaginas: 0,
  });
  const [cargando, setCargando] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const autoIngresoRef = useRef(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const res = await obtenerCatalogoPos({
        categoriaId: categoriaId || "TODOS",
        q,
        page,
        pageSize: 12,
      });
      setResultado(res);
    } finally {
      setCargando(false);
    }
  }, [categoriaId, q, page]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => void cargar(), q ? 300 : 0);
    return () => window.clearTimeout(timer);
  }, [open, cargar, q]);

  const agregar = (p: ProductoPosDTO) => {
    onAgregar(p);
    toast.success(`${p.descripcion} añadido`);
  };

  useEffect(() => {
    if (!open) {
      autoIngresoRef.current = false;
      return;
    }
    if (!autoIngresoRef.current && resultado.data.length > 0) {
      autoIngresoRef.current = true;
      const primero = gridRef.current?.querySelector<HTMLButtonElement>(
        "[data-pos-item]",
      );
      primero?.focus();
    }
  }, [open, resultado.data.length]);

  const manejarTeclado = (e: KeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(
      gridRef.current?.querySelectorAll<HTMLButtonElement>("[data-pos-item]") ??
        [],
    );
    if (items.length === 0) return;
    const idx = items.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === "Enter") {
      if (idx >= 0) {
        e.preventDefault();
        agregar(resultado.data[idx]);
      }
      return;
    }
    if (idx === -1) return;
    const cur = items[idx];
    const curRect = cur.getBoundingClientRect();
    let siguiente: HTMLButtonElement | undefined;
    switch (e.key) {
      case "ArrowRight":
        siguiente = items[idx + 1];
        break;
      case "ArrowLeft":
        siguiente = items[idx - 1];
        break;
      case "ArrowDown":
        siguiente = items.find((el) => {
          const r = el.getBoundingClientRect();
          return (
            r.top > curRect.top + curRect.height / 2 &&
            Math.abs(r.left - curRect.left) < curRect.width / 2
          );
        });
        break;
      case "ArrowUp": {
        const sobre = items.filter((el) => {
          const r = el.getBoundingClientRect();
          return (
            r.top < curRect.top - curRect.height / 2 &&
            Math.abs(r.left - curRect.left) < curRect.width / 2
          );
        });
        siguiente = sobre[sobre.length - 1];
        break;
      }
      default:
        return;
    }
    if (siguiente) {
      e.preventDefault();
      siguiente.focus();
      siguiente.scrollIntoView({ block: "nearest" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl! overflow-hidden">
        <div className="-mx-4 -mt-4 mb-1 flex items-center justify-between gap-3 bg-[#111827] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
              <PackageSearch className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-white">
                Catálogo de productos
              </DialogTitle>
              <DialogDescription className="text-xs text-white/60">
                Haga clic en un producto para añadirlo a la venta.
              </DialogDescription>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onOpenChange(false)}
            className="shrink-0 text-white hover:bg-white/10 hover:text-white"
            aria-label="Cerrar"
          >
            <X />
          </Button>
        </div>

        <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-center">
          <div className="flex gap-1 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => {
                setCategoriaId("");
                setPage(1);
              }}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                categoriaId === ""
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              TODOS
            </button>
            {categorias.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setCategoriaId(c.nombre);
                  setPage(1);
                }}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                  categoriaId === c.nombre
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                {c.nombre}
              </button>
            ))}
          </div>
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Buscar por código o descripción..."
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        <div
          ref={gridRef}
          onKeyDown={manejarTeclado}
          className="relative mt-3 max-h-[420px] overflow-y-auto rounded-lg border bg-background"
        >
          {cargando && resultado.data.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-muted-foreground">
              <Loader2 className="size-6 animate-spin" />
            </div>
          ) : resultado.data.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
              No se encontraron productos.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 p-2 sm:grid-cols-3 lg:grid-cols-4">
              {resultado.data.map((p) => (
                <button
                  key={p.id}
                  data-pos-item
                  type="button"
                  onClick={() => agregar(p)}
                  className="group flex flex-col rounded-lg border border-border bg-card p-2.5 text-left transition hover:border-primary"
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="font-mono text-[10px] text-muted-foreground">{p.codigo}</span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
                        p.stock > 0
                          ? "bg-primary text-primary-foreground"
                          : "bg-rose-500/10 text-rose-500"
                      }`}
                    >
                     Stock {formatearNumeroEntero(p.stock)}
                    </span>
                  </div>
                  <div className="mt-1 line-clamp-2 min-h-8 text-xs font-semibold leading-tight">
                    {p.descripcion}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {p.unidadMedidaCodigo ||
                      p.unidadMedida ||
                      "UND"}
                    {p.presentacion ? ` · ${p.presentacion}` : ""}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-primary">
                      {formatearMonedaSoles(p.precioVenta)}
                    </span>
                    <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground transition group-hover:scale-110">
                      <Plus className="size-3.5" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}