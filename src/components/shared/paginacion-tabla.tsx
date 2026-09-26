import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Tema = "claro" | "oscuro";

const ESTILOS: Record<
  Tema,
  {
    barra: string;
    texto: string;
    valor: string;
    selector: string;
    etiqueta: string;
    badge: string;
    boton: string;
  }
> = {
  claro: {
    barra: "border-t border-border/70 bg-muted/30",
    texto: "text-sm text-muted-foreground",
    valor: "text-foreground",
    selector: "w-20",
    etiqueta: "text-xs text-muted-foreground/80",
    badge: "border-border bg-muted/60 text-foreground/80",
    boton: "",
  },
  oscuro: {
    barra: "border-t border-slate-700/60",
    texto: "text-[11px] text-slate-400",
    valor: "text-slate-200",
    selector: "h-7 w-16 border-slate-700 bg-slate-800/60 text-[11px] text-slate-200",
    etiqueta: "text-[10px] text-slate-400",
    badge: "border-slate-700 bg-slate-800/60 text-slate-300",
    boton: "border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white",
  },
};

type Props = {
  pageIndex: number;
  totalPaginas: number;
  pageSize: number;
  total: number;
  onPageSizeChange: (pageSize: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  pageSizes?: number[];
  singular?: string;
  plural?: string;
  cargando?: boolean;
  tema?: Tema;
  className?: string;
};

export function PaginacionTabla({
  pageIndex,
  totalPaginas,
  pageSize,
  total,
  onPageSizeChange,
  onPrevious,
  onNext,
  pageSizes = [5, 10, 20, 50],
  singular = "registro",
  plural = "registros",
  cargando = false,
  tema = "claro",
  className,
}: Props) {
  const e = ESTILOS[tema];
  const desde = total === 0 ? 0 : pageIndex * pageSize + 1;
  const hasta = Math.min((pageIndex + 1) * pageSize, total);
  const etiqueta = total === 1 ? singular : plural;
  const opciones = pageSizes.includes(pageSize)
    ? pageSizes
    : [...pageSizes, pageSize].sort((a, b) => a - b);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between",
        e.barra,
        className,
      )}
    >
      <div className={cn("flex flex-wrap items-center gap-3", e.texto)}>
        <span className="tabular-nums">
          Mostrando{" "}
          <span className={cn("font-semibold", e.valor)}>
            {desde.toLocaleString("es-PE")}
          </span>
          –
          <span className={cn("font-semibold", e.valor)}>
            {hasta.toLocaleString("es-PE")}
          </span>{" "}
          de{" "}
          <span className={cn("font-semibold tabular-nums", e.valor)}>
            {total.toLocaleString("es-PE")}
          </span>{" "}
          {etiqueta}
        </span>
        <Select
          value={String(pageSize)}
          onValueChange={v => onPageSizeChange(Number(v))}
        >
          <SelectTrigger size="sm" className={e.selector}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {opciones.map(n => (
              <SelectItem key={n} value={String(n)}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className={e.etiqueta}>por página</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "mr-1 rounded-md border px-2.5 py-1.5 text-xs font-semibold tabular-nums",
            e.badge,
          )}
        >
          Pág. {pageIndex + 1} / {totalPaginas}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={e.boton || undefined}
          disabled={pageIndex === 0 || cargando}
          onClick={onPrevious}
        >
          Anterior
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={e.boton || undefined}
          disabled={pageIndex + 1 >= totalPaginas || cargando}
          onClick={onNext}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}
