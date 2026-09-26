import { Loader2, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";
import { FiltrosHeader } from "@/components/reportes/filtros-header";

type ProductoFiltro = { id: string; codigo: string; descripcion: string };
type LoteFiltro = { id: string; productoId: string; codigo: string };

type Props = {
  productos: ProductoFiltro[];
  lotes?: LoteFiltro[];
  productoId: string;
  loteId?: string;
  fechaDesde: string;
  fechaHasta: string;
  totalRegistros: number | null;
  hayFiltros: boolean;
  error?: string;
  cargando: boolean;
  onProductoChange: (value: string) => void;
  onLoteChange?: (value: string) => void;
  onFechaDesdeChange: (value: string) => void;
  onFechaHastaChange: (value: string) => void;
  onConsultar: () => void;
  onLimpiar: () => void;
};

export function FiltrosReporteGeneral({
  productos,
  lotes = [],
  productoId,
  loteId = "",
  fechaDesde,
  fechaHasta,
  totalRegistros,
  hayFiltros,
  error,
  cargando,
  onProductoChange,
  onLoteChange,
  onFechaDesdeChange,
  onFechaHastaChange,
  onConsultar,
  onLimpiar,
}: Props) {
  const conLotes = Boolean(onLoteChange);

  return (
    <div className="no-print rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-3">
        <FiltrosHeader
          totalRegistros={totalRegistros}
          hayFiltros={hayFiltros}
          onLimpiar={onLimpiar}
        />

        <div
          className={
            conLotes
              ? "grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-5"
              : "grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4"
          }
        >
          <div className="space-y-0.5">
            <Label className="text-[10px] font-semibold text-muted-foreground">
              Producto
            </Label>
            <Combobox
              value={productoId}
              items={productos.map((p) => p.id)}
              onValueChange={(v) => onProductoChange(v ?? "")}
              itemToStringLabel={(val) => {
                if (!val) return "";
                const p = productos.find((x) => x.id === val);
                return p ? `${p.codigo} — ${p.descripcion}` : "";
              }}
            >
              <ComboboxInput
                placeholder="Todos los productos..."
                className="h-8 text-[11px]"
              />
              <ComboboxContent>
                <ComboboxList>
                  {productos.map((p) => (
                    <ComboboxItem key={p.id} value={p.id}>
                      {p.codigo} — {p.descripcion}
                    </ComboboxItem>
                  ))}
                </ComboboxList>
                <ComboboxEmpty>No se encontró el producto.</ComboboxEmpty>
              </ComboboxContent>
            </Combobox>
          </div>

          {conLotes && (
            <div className="space-y-0.5">
              <Label className="text-[10px] font-semibold text-muted-foreground">
                Lote
              </Label>
              <Combobox
                value={loteId}
                items={lotes.map((l) => l.id)}
                onValueChange={(v) => onLoteChange?.(v ?? "")}
                itemToStringLabel={(val) => {
                  if (!val) return "";
                  const l = lotes.find((x) => x.id === val);
                  return l ? l.codigo : "";
                }}
              >
                <ComboboxInput
                  placeholder="Todos los lotes..."
                  className="h-8 text-[11px]"
                />
                <ComboboxContent>
                  <ComboboxList>
                    {lotes.map((l) => (
                      <ComboboxItem key={l.id} value={l.id}>
                        {l.codigo}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                  <ComboboxEmpty>No se encontró el lote.</ComboboxEmpty>
                </ComboboxContent>
              </Combobox>
            </div>
          )}

          <div className="space-y-0.5">
            <Label className="text-[10px] font-semibold text-muted-foreground">
              Fecha Desde
            </Label>
            <Input
              type="date"
              value={fechaDesde}
              onChange={(e) => onFechaDesdeChange(e.target.value)}
              className="h-8 text-[11px]"
            />
          </div>

          <div className="space-y-0.5">
            <Label className="text-[10px] font-semibold text-muted-foreground">
              Fecha Hasta
            </Label>
            <Input
              type="date"
              value={fechaHasta}
              onChange={(e) => onFechaHastaChange(e.target.value)}
              className="h-8 text-[11px]"
            />
          </div>

          <div className="flex items-end">
            <Button
              onClick={onConsultar}
              disabled={cargando}
              className="h-8 w-full gap-1.5 bg-emerald-600 text-[11px] text-white hover:bg-emerald-700 shadow-md shadow-emerald-900/20 font-semibold"
            >
              {cargando ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Search className="h-3.5 w-3.5" />
              )}
              {cargando ? "Consultando..." : "Consultar"}
            </Button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
