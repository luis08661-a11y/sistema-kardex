import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

type Tema = "claro" | "oscuro";

const ESTILOS: Record<Tema, {
  size: "icon-xs" | "icon-sm";
  variant: "outline" | "ghost";
  icono: string;
  boton: string;
  contador: string;
  rango: string;
}> = {
  claro: {
    size: "icon-xs",
    variant: "outline",
    icono: "",
    boton: "",
    contador: "px-1 text-[11px] font-semibold tabular-nums text-muted-foreground",
    rango: "text-[11px] text-muted-foreground tabular-nums",
  },
  oscuro: {
    size: "icon-sm",
    variant: "ghost",
    icono: "size-3.5",
    boton: "text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-40",
    contador: "px-1 text-[11px] font-semibold text-slate-300 tabular-nums",
    rango: "text-[11px] font-medium text-slate-400 tabular-nums",
  },
};

type Props = {
  pagina: number;
  totalPaginas: number;
  porPagina: number;
  total: number;
  onCambioPagina: (pagina: number) => void;
  tema?: Tema;
  sufijo?: string;
  contenedor?: string;
  etiquetaAnterior?: string;
  etiquetaSiguiente?: string;
};

export function PaginacionModal({
  pagina,
  totalPaginas,
  porPagina,
  total,
  onCambioPagina,
  tema = "claro",
  sufijo = "productos",
  contenedor = "flex items-center justify-between border-t pt-2",
  etiquetaAnterior = "Página anterior",
  etiquetaSiguiente = "Página siguiente",
}: Props) {
  if (total <= porPagina) return null;

  const e = ESTILOS[tema];
  const desde = pagina * porPagina + 1;
  const hasta = Math.min((pagina + 1) * porPagina, total);

  return (
    <div className={contenedor}>
      <span className={e.rango}>
        {desde}–{hasta} de {total} {sufijo}
      </span>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant={e.variant}
          size={e.size}
          className={e.boton || undefined}
          disabled={pagina === 0}
          onClick={() => onCambioPagina(Math.max(0, pagina - 1))}
          aria-label={etiquetaAnterior}
        >
          <ChevronLeft className={e.icono || undefined} />
        </Button>
        <span className={e.contador}>
          {pagina + 1} / {totalPaginas}
        </span>
        <Button
          type="button"
          variant={e.variant}
          size={e.size}
          className={e.boton || undefined}
          disabled={pagina + 1 >= totalPaginas}
          onClick={() => onCambioPagina(Math.min(totalPaginas - 1, pagina + 1))}
          aria-label={etiquetaSiguiente}
        >
          <ChevronRight className={e.icono || undefined} />
        </Button>
      </div>
    </div>
  );
}
