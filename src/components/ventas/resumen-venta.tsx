"use client";

import { formatearMoneda } from "@/components/ventas/types";

interface Props {
  subtotal: number;
  igv: number;
  total: number;
}

export function ResumenVenta({ subtotal, igv, total }: Props) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="font-mono font-medium tabular-nums">
          {formatearMoneda(subtotal)}
        </span>
      </div>
      <div className="flex items-center justify-between border-t border-border/60 pt-2.5 text-sm">
        <span className="text-muted-foreground">Impuesto (IGV 18%)</span>
        <span className="font-mono font-medium tabular-nums">
          {formatearMoneda(igv)}
        </span>
      </div>
      <div className="flex items-center justify-between border-t border-border/60 pt-2.5">
        <span className="text-sm font-bold uppercase tracking-wide text-foreground">
          Total
        </span>
        <span className="font-mono text-xl font-bold tabular-nums text-blue-600">
          {formatearMoneda(total)}
        </span>
      </div>
    </div>
  );
}