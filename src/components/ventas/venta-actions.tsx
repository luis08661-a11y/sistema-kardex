"use client";

import { Save, Printer, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

interface Props {
  saving: boolean;
  canSave: boolean;
  onGuardar: () => void;
  onImprimir: () => void;
  canImprimir: boolean;
}

export function VentaActions({
  saving,
  canSave,
  onGuardar,
  onImprimir,
  canImprimir,
}: Props) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Button
        type="button"
        onClick={onGuardar}
        disabled={saving || !canSave}
        className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
      >
        {saving ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Guardando...
          </>
        ) : (
          <>
            <Save className="size-4" />
            Guardar
          </>
        )}
      </Button>
      <Button
        type="button"
        onClick={onImprimir}
        disabled={!canImprimir}
        className="gap-2 bg-blue-600 text-white hover:bg-blue-700"
      >
        <Printer className="size-4" />
        Imprimir
      </Button>
    </div>
  );
}