"use client";

import { Hash, Loader2, Search, SlidersHorizontal, UserRound, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TIPO_OPCIONES = [
  { valor: "TODOS", label: "Todos los comprobantes" },
  { valor: "NOTA_DE_VENTA", label: "NOTA DE VENTA" },
  { valor: "FACTURA", label: "FACTURA" },
  { valor: "BOLETA", label: "BOLETA" },
  { valor: "COTIZACION", label: "COTIZACIÓN" },
];

const ESTADO_OPCIONES = [
  { valor: "TODOS", label: "Todos los estados" },
  { valor: "EMITIDA", label: "Emitida" },
  { valor: "ANULADA", label: "Anulada" },
];

const FORMA_PAGO_OPCIONES = [
  { valor: "TODOS", label: "Todas las formas de pago" },
  { valor: "CONTADO", label: "Contado" },
  { valor: "CREDITO", label: "Crédito" },
];

type Props = {
  fechaDesde: string;
  fechaHasta: string;
  tipoComprobante: string;
  estado: string;
  formaPago: string;
  numeroComprobante: string;
  documento: string;
  cantidadVentas: number | null;
  hayFiltros: boolean;
  cargando: boolean;
  error: string;
  onFechaDesdeChange: (v: string) => void;
  onFechaHastaChange: (v: string) => void;
  onTipoComprobanteChange: (v: string) => void;
  onEstadoChange: (v: string) => void;
  onFormaPagoChange: (v: string) => void;
  onNumeroComprobanteChange: (v: string) => void;
  onDocumentoChange: (v: string) => void;
  onConsultar: () => void;
  onLimpiar: () => void;
};

export function FiltrosReporteVentas({
  fechaDesde,
  fechaHasta,
  tipoComprobante,
  estado,
  formaPago,
  numeroComprobante,
  documento,
  cantidadVentas,
  hayFiltros,
  cargando,
  error,
  onFechaDesdeChange,
  onFechaHastaChange,
  onTipoComprobanteChange,
  onEstadoChange,
  onFormaPagoChange,
  onNumeroComprobanteChange,
  onDocumentoChange,
  onConsultar,
  onLimpiar,
}: Props) {
  return (
    <div className="rounded-xl border border-slate-700/60 bg-[#0f172a] p-4 shadow-sm">
      <div className="flex flex-col gap-3">
        <div className="mb-1 flex items-center gap-2">
          <SlidersHorizontal className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Búsqueda y Filtros
          </span>
          <div className="ml-auto flex items-center gap-2">
            {cantidadVentas !== null && (
              <span className="whitespace-nowrap text-[11px] font-medium text-slate-400">
                <span className="font-bold text-slate-200">{cantidadVentas}</span>{" "}
                {cantidadVentas === 1 ? "venta" : "ventas"}
              </span>
            )}
            {hayFiltros && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onLimpiar}
                className="h-6 gap-1 text-[10px] text-slate-400 hover:text-rose-400"
              >
                <X className="h-3 w-3" />
                Limpiar
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="w-36 space-y-1.5 sm:w-40">
            <Label className="text-[10px] font-semibold text-slate-400">
              Fecha desde
            </Label>
            <Input
              type="date"
              value={fechaDesde}
              onChange={(e) => onFechaDesdeChange(e.target.value)}
              className="h-9 border-slate-700 bg-slate-800/60 text-[11px] text-slate-200"
            />
          </div>
          <div className="w-36 space-y-1.5 sm:w-40">
            <Label className="text-[10px] font-semibold text-slate-400">
              Fecha hasta
            </Label>
            <Input
              type="date"
              value={fechaHasta}
              onChange={(e) => onFechaHastaChange(e.target.value)}
              className="h-9 border-slate-700 bg-slate-800/60 text-[11px] text-slate-200"
            />
          </div>
          <div className="w-40 space-y-1.5 sm:w-44">
            <Label className="text-[10px] font-semibold text-slate-400">
              Tipo de comprobante
            </Label>
            <Select
              value={tipoComprobante}
              onValueChange={(v) => onTipoComprobanteChange(v ?? "TODOS")}
            >
              <SelectTrigger className="h-9 w-full border-slate-700 bg-slate-800/60 text-[11px] text-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIPO_OPCIONES.map((op) => (
                  <SelectItem key={op.valor} value={op.valor}>
                    {op.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-36 space-y-1.5">
            <Label className="text-[10px] font-semibold text-slate-400">
              Estado
            </Label>
            <Select value={estado} onValueChange={(v) => onEstadoChange(v ?? "TODOS")}>
              <SelectTrigger className="h-9 w-full border-slate-700 bg-slate-800/60 text-[11px] text-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ESTADO_OPCIONES.map((op) => (
                  <SelectItem key={op.valor} value={op.valor}>
                    {op.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-40 space-y-1.5 sm:w-44">
            <Label className="text-[10px] font-semibold text-slate-400">
              Forma de pago
            </Label>
            <Select
              value={formaPago}
              onValueChange={(v) => onFormaPagoChange(v ?? "TODOS")}
            >
              <SelectTrigger className="h-9 w-full border-slate-700 bg-slate-800/60 text-[11px] text-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FORMA_PAGO_OPCIONES.map((op) => (
                  <SelectItem key={op.valor} value={op.valor}>
                    {op.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-44 flex-1 space-y-1.5">
            <Label className="text-[10px] font-semibold text-slate-400">
              Número de comprobante
            </Label>
            <div className="relative">
              <Hash className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-500" />
              <Input
                value={numeroComprobante}
                onChange={(e) => onNumeroComprobanteChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onConsultar();
                }}
                placeholder="F001-000001 o 123"
                className="h-9 border-slate-700 bg-slate-800/60 pl-8 font-mono text-[11px] text-slate-200 placeholder:text-slate-600"
              />
            </div>
          </div>
          <div className="min-w-44 flex-1 space-y-1.5">
            <Label className="text-[10px] font-semibold text-slate-400">
              DNI / RUC
            </Label>
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-500" />
              <Input
                value={documento}
                onChange={(e) => onDocumentoChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onConsultar();
                }}
                placeholder="Ingrese DNI o RUC"
                className="h-9 border-slate-700 bg-slate-800/60 pl-8 font-mono text-[11px] text-slate-200 placeholder:text-slate-600"
              />
            </div>
          </div>
          <Button
            onClick={onConsultar}
            disabled={cargando}
            className="h-9 flex-none gap-1.5 bg-emerald-600 text-[11px] text-white hover:bg-emerald-700 shadow-md shadow-emerald-900/20 font-semibold px-4"
          >
            {cargando ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Search className="h-3.5 w-3.5" />
            )}
            {cargando ? "Consultando..." : "Consultar"}
          </Button>
        </div>

        {error && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
