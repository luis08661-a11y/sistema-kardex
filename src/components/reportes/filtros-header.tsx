import { SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  totalRegistros: number | null;
  hayFiltros: boolean;
  onLimpiar: () => void;
};

export function FiltrosHeader({ totalRegistros, hayFiltros, onLimpiar }: Props) {
  return (
    <div className="mb-1 flex items-center gap-2">
      <SlidersHorizontal className="h-3.5 w-3.5 text-blue-500" />
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        Búsqueda y Filtros
      </span>
      <div className="ml-auto flex items-center gap-2">
        {totalRegistros !== null && (
          <span className="whitespace-nowrap text-[11px] font-medium text-muted-foreground">
            <span className="font-bold text-foreground">{totalRegistros}</span>{" "}
            {totalRegistros === 1 ? "registro" : "registros"}
          </span>
        )}
        {hayFiltros && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onLimpiar}
            className="h-6 gap-1 text-[10px] text-muted-foreground hover:text-destructive"
          >
            <X className="h-3 w-3" />
            Limpiar
          </Button>
        )}
      </div>
    </div>
  );
}
