"use client";

import { FileDown, Loader2, Printer, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PdfPreview } from "@/components/ui/pdf-preview";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string | null;
  filename: string;
  onDescargar: () => void;
  cargando?: boolean;
  titulo?: string;
}

export function PdfPreviewDialog({
  open,
  onOpenChange,
  url,
  onDescargar,
  cargando,
  titulo = "Vista previa del reporte",
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-5xl! overflow-hidden border-slate-800 bg-[#0b1220] p-0 text-slate-200"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 px-4 py-3">
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold text-white">
            <span className="flex size-7 items-center justify-center rounded-lg bg-red-500/15 text-red-400">
              <FileDown className="size-3.5" />
            </span>
            {titulo}
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!url}
              className="gap-1.5 border-slate-700 bg-slate-900 text-[11px] text-slate-200 hover:bg-slate-800 hover:text-white"
              onClick={() => {
                if (!url) return;
                const w = window.open(url, "_blank");
                if (w) window.setTimeout(() => w.print(), 500);
              }}
            >
              <Printer className="size-3.5" />
              Imprimir
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={cargando || !url}
              className="gap-1.5 bg-rose-500 text-white hover:bg-rose-600"
              onClick={onDescargar}
            >
              <FileDown className="size-3.5" />
              Descargar PDF A4
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Cerrar"
              onClick={() => onOpenChange(false)}
              className="text-slate-300 hover:bg-white/10 hover:text-white"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        <div className="h-[76vh] p-4">
          {cargando || !url ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-800 text-sm text-slate-400">
              <Loader2 className="size-5 animate-spin text-red-400" />
              Generando vista previa...
            </div>
          ) : (
            <PdfPreview key={url} url={url} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}