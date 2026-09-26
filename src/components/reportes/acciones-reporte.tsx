import { FileSpreadsheet, FileText, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  onExcel: () => void;
  onPdf: () => void;
  onImprimir: () => void;
};

export function AccionesReporte({ onExcel, onPdf, onImprimir }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        onClick={onExcel}
        className="h-8 gap-1.5 bg-emerald-600 text-[11px] text-white hover:bg-emerald-700 shadow-md shadow-emerald-900/20 font-semibold"
      >
        <FileSpreadsheet className="h-3.5 w-3.5" />
        Excel
      </Button>
      <Button
        onClick={onPdf}
        className="h-8 gap-1.5 bg-red-600 text-[11px] text-white hover:bg-red-700 shadow-md shadow-red-900/20 font-semibold"
      >
        <FileText className="h-3.5 w-3.5" />
        PDF
      </Button>
      <Button
        onClick={onImprimir}
        variant="outline"
        className="h-8 gap-1.5 text-[11px] text-muted-foreground hover:text-foreground"
      >
        <Printer className="h-3.5 w-3.5" />
        Imprimir
      </Button>
    </div>
  );
}
