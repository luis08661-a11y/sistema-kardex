import type { ElementType, ReactNode } from "react";

import { Label } from "@/components/ui/label";

export function CampoFormulario({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

export function ModuloCabecera({
  icon: Icon,
  titulo,
  descripcion,
  acciones,
}: {
  icon: ElementType;
  titulo: string;
  descripcion: string;
  acciones?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-700/60 bg-[#0f172a] p-4 text-white shadow-lg shadow-emerald-500/10">
      <div className="absolute -right-8 -top-2 h-32 w-32 rounded-full bg-emerald-500/5 blur-2xl" />
      <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-emerald-500/5 blur-xl" />
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 shadow-sm shadow-emerald-500/30">
            <Icon className="h-4.5 w-4.5" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">{titulo}</h1>
            <p className="text-[14px] text-slate-400">{descripcion}</p>
          </div>
        </div>
        {acciones}
      </div>
    </div>
  );
}
