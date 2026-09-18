"use client";

import { AlertTriangle, CheckCircle2, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titulo: string;
  mensaje: string;
  tipo?: "error" | "success";
  labelAccion?: string;
  onAccion?: () => void;
  onExportarPdf?: () => void;
}

export function AvisoDialog({
  open,
  onOpenChange,
  titulo,
  mensaje,
  tipo = "error",
  labelAccion,
  onAccion,
  onExportarPdf,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm!">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {tipo === "success" ? (
              <CheckCircle2 className="size-5 text-primary" />
            ) : (
              <AlertTriangle className="size-5 text-amber-500" />
            )}
            {titulo}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="whitespace-pre-line">{mensaje}</DialogDescription>
        <DialogFooter className="gap-2">
          {labelAccion && onAccion && (
            <Button onClick={onAccion}>{labelAccion}</Button>
          )}
          {onExportarPdf && (
            <Button variant="outline" onClick={onExportarPdf} className="gap-2">
              <FileText className="size-4" />
              Exportar PDF
            </Button>
          )}
          <Button variant={labelAccion && onAccion ? "outline" : "default"} onClick={() => onOpenChange(false)}>
            Aceptar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}