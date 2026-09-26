import type { ElementType } from "react";

import { CalendarDays } from "lucide-react";

import { Badge } from "@/components/ui/badge";

type Props = {
  icon: ElementType;
  titulo: string;
  descripcion: string;
  etiquetaCorte: string;
  fechaCorte: string | null;
};

export function ResumenCabecera({
  icon: Icon,
  titulo,
  descripcion,
  etiquetaCorte,
  fechaCorte,
}: Props) {
  return (
    <div className="no-print relative overflow-hidden rounded-xl border p-4 text-white shadow-lg shadow-emerald-500/20">
      <div className="absolute -right-8 -top-2 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/10 blur-xl" />
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight md:text-lg">
              {titulo}
            </h1>
            <p className="text-xs text-zinc-200">{descripcion}</p>
          </div>
        </div>
        {fechaCorte && (
          <Badge
            variant="outline"
            className="border-white/30 bg-white/10 text-white backdrop-blur-sm"
          >
            <CalendarDays className="size-3.5" />
            {etiquetaCorte} {fechaCorte}
          </Badge>
        )}
      </div>
    </div>
  );
}
