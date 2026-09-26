import { RotateCcw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  cargando: boolean;
  onConsultar: () => void;
  onLimpiar: () => void;
};

export function BotonesConsultarLimpiar({ cargando, onConsultar, onLimpiar }: Props) {
  return (
    <div className="flex items-end gap-2">
      <Button
        onClick={onConsultar}
        disabled={cargando}
        className="h-8 gap-1.5 bg-emerald-600 text-[11px] text-white hover:bg-emerald-700 shadow-md shadow-emerald-900/20 font-semibold"
      >
        {cargando ? (
          <span className="flex items-center gap-2">
            <Skeleton className="size-4 animate-spin rounded-full bg-white/40" />
            Consultando...
          </span>
        ) : (
          <Search className="h-3.5 w-3.5" />
        )}
        Consultar
      </Button>
      <Button
        onClick={onLimpiar}
        variant="outline"
        className="h-8 gap-1.5 text-[11px] text-muted-foreground hover:text-foreground"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Limpiar
      </Button>
    </div>
  );
}
