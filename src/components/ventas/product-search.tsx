"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ScanBarcode, PackageSearch, Loader2, Plus, List } from "lucide-react";

import { buscarProductos } from "@/actions/venta.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProductoResultado } from "@/components/ventas/types";

interface Props {
  onAgregar: (producto: ProductoResultado) => void;
  onAbrirCatalogo?: () => void;
}

export function ProductSearch({ onAgregar, onAbrirCatalogo }: Props) {
  const [q, setQ] = useState("");
  const [resultados, setResultados] = useState<ProductoResultado[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstRun = useRef(true);

  const ejecutar = useCallback(async (valor: string) => {
    if (!valor.trim()) {
      setResultados([]);
      setAbierto(false);
      return;
    }
    setBuscando(true);
    try {
      const res = await buscarProductos(valor);
      setResultados(res);
      setAbierto(true);
    } finally {
      setBuscando(false);
    }
  }, []);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    setBuscando(true);
    timer.current = setTimeout(() => void ejecutar(q), 350);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [q, ejecutar]);

  const agregar = (p: ProductoResultado) => {
    onAgregar(p);
    setQ("");
    setResultados([]);
    setAbierto(false);
  };

  return (
    <div className="flex gap-2">
      <div className="relative min-w-0 flex-1">
        <ScanBarcode className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-8 pr-9"
          placeholder="Buscar por código, nombre (ej: Bio Trak, Paracetamol)..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => {
            if (resultados.length) setAbierto(true);
          }}
        />
        {buscando && (
          <Loader2 className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}

        {abierto && (
          <div className="absolute left-0 top-full z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border bg-popover shadow-md ring-1 ring-foreground/10">
            {resultados.length === 0 && !buscando ? (
              <div className="flex flex-col items-center gap-2 px-4 py-8 text-center text-sm text-muted-foreground">
                <PackageSearch className="h-8 w-8" />
                No se encontraron productos con «{q}»
              </div>
            ) : (
              resultados.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => agregar(p)}
                  className="flex w-full items-center justify-between gap-3 border-b px-3 py-2.5 text-left transition-colors last:border-0 hover:bg-muted/50"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-primary">
                        {p.codigo}
                      </span>
                      {p.codigoExistencia && (
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {p.codigoExistencia}
                        </span>
                      )}
                      <BadgeTipo tipo={p.tipoInventario} />
                    </div>
                    <p className="truncate text-sm font-medium">{p.descripcion}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {p.unidadMedida?.codigo || p.unidadMedida?.nombre || "U.M."}
                      {p.presentacion ? ` · ${p.presentacion.nombre}` : ""}
                    </p>
                  </div>
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Plus className="size-4" />
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {onAbrirCatalogo && (
        <Button
          type="button"
          variant="outline"
          onClick={onAbrirCatalogo}
          className="shrink-0 gap-2 border-blue-600/60 text-blue-600 hover:border-blue-600 hover:bg-blue-50 hover:text-blue-700"
        >
          <List className="size-4" />
          Catálogo
        </Button>
      )}
    </div>
  );
}

function BadgeTipo({ tipo }: { tipo: string }) {
  return (
    <span
      className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
        tipo === "BASE_ACTIVA"
          ? "bg-emerald-500/10 text-emerald-600"
          : "bg-violet-500/10 text-violet-600"
      }`}
    >
      {tipo === "BASE_ACTIVA" ? "BASE" : "PT"}
    </span>
  );
}