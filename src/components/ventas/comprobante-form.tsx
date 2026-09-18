"use client";

import { FileText, CalendarDays, Hash } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TIPO_COMPROBANTE_LABEL,
  type TipoComprobante,
} from "@/components/ventas/types";

interface Props {
  tipoComprobante: TipoComprobante;
  onChangeTipo: (tipo: TipoComprobante) => void;
  serie: string;
  numeroPreview: number | null;
  fecha: string;
  onChangeFecha: (fecha: string) => void;
}

const OPCIONES: TipoComprobante[] = ["COTIZACION", "FACTURA", "BOLETA"];

const inputClase =
  "border-white/15 bg-white/10 text-white placeholder:text-white/40 focus-visible:border-white/40 focus-visible:ring-white/20";

export function ComprobanteForm({
  tipoComprobante,
  onChangeTipo,
  serie,
  numeroPreview,
  fecha,
  onChangeFecha,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <Label className="text-[10px] font-semibold uppercase tracking-wider text-white/50">
            Tipo
          </Label>
          <Select
            value={tipoComprobante}
            onValueChange={(v) => onChangeTipo((v ?? "COTIZACION") as TipoComprobante)}
          >
            <SelectTrigger
              className="w-36 border-white/15 bg-white/10 text-white data-placeholder:text-white/40 [&_svg]:text-white/60"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OPCIONES.map((t) => (
                <SelectItem key={t} value={t}>
                  {TIPO_COMPROBANTE_LABEL[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="text-right">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/50">
            Comprobante
          </p>
          <p className="mt-1 font-mono text-sm font-bold tracking-wide text-white tabular-nums">
            {serie}-
            {numeroPreview != null
              ? String(numeroPreview).padStart(6, "0")
              : "000000"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1.5">
          <Label className="text-[10px] font-semibold uppercase tracking-wider text-white/50">
            Serie
          </Label>
          <div className="relative">
            <FileText className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
            <Input readOnly value={serie} className={`${inputClase} pl-7 font-mono text-xs uppercase`} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[10px] font-semibold uppercase tracking-wider text-white/50">
            Número
          </Label>
          <div className="relative">
            <Hash className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
            <Input
              readOnly
              value={numeroPreview != null ? String(numeroPreview).padStart(6, "0") : "Automático"}
              className={`${inputClase} pl-7 font-mono text-xs tabular-nums`}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[10px] font-semibold uppercase tracking-wider text-white/50">
            Fecha
          </Label>
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
            <Input
              type="date"
              className={`${inputClase} pl-7 text-xs [color-scheme:dark]`}
              value={fecha}
              onChange={(e) => onChangeFecha(e.target.value)}
            />
          </div>
        </div>
      </div>

      <p className="text-[11px] leading-snug text-white/40">
        La serie y el número son asignados automáticamente por el sistema para
        evitar duplicados.
      </p>
    </div>
  );
}