import { FileSpreadsheet } from "lucide-react";

import { AccionesReporte } from "@/components/reportes/acciones-reporte";

type Props = {
  titulo: string;
  registros: number;
  resumen: string;
  onExcel: () => void;
  onPdf: () => void;
  onImprimir: () => void;
};

export function TarjetaAccionesReporte({
  titulo,
  registros,
  resumen,
  onExcel,
  onPdf,
  onImprimir,
}: Props) {
  return (
    <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
          <FileSpreadsheet className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold tracking-wide">{titulo}</h2>
          <p className="text-[11px] text-muted-foreground">
            {registros} {registros === 1 ? "registro" : "registros"} · {resumen}
          </p>
        </div>
      </div>
      <AccionesReporte onExcel={onExcel} onPdf={onPdf} onImprimir={onImprimir} />
    </div>
  );
}
