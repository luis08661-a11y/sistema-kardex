"use client";

import type { ReactNode } from "react";

export type ReportTemplateData = {
  empresa: {
    ruc: string;
    razonSocial: string;
    logoUrl?: string | null;
    firmaUrl?: string | null;
    responsableReporte?: string | null;
    cargoReporte?: string | null;
  };
  establecimiento: string;
  periodo: string;
  fechaInforme: Date;
};

export function ReportTemplate({
  data,
  titulo,
  subtitulo,
  encabezado,
  children,
}: {
  data: ReportTemplateData;
  titulo: string;
  subtitulo?: string;
  encabezado?: ReactNode;
  children: ReactNode;
}) {
  const fecha = data.fechaInforme.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
  return (
    <div className="report-a4">
      <div className="report-page">
        <div className="report-marco">
          <div className="report-header">
            <div className="flex items-center justify-between px-4 py-2">
              <div className="flex items-center gap-3">
                <div className="report-logo">
                  {data.empresa.logoUrl ? (
                    <img src={data.empresa.logoUrl} alt="Logo" className="h-full w-full object-contain" />
                  ) : null}
                </div>
                <div>
                  <div className="report-title">{titulo}</div>
                  {subtitulo ? <div className="report-subtitle">{subtitulo}</div> : null}
                </div>
              </div>
              <div className="text-right text-[9px] leading-tight text-slate-700">
                <div className="font-bold text-emerald-900">{data.empresa.razonSocial}</div>
                <div>RUC: {data.empresa.ruc}</div>
                <div>ESTABLECIMIENTO: {data.establecimiento}</div>
                <div>PERÍODO: {data.periodo}</div>
              </div>
            </div>
          </div>

          {encabezado ? <div className="px-2 pt-2">{encabezado}</div> : null}
          {children}

          <div className="report-firma">
            <div className="firma-box">
              {data.empresa.firmaUrl ? (
                <img src={data.empresa.firmaUrl} alt="Firma" className="mx-auto h-16 object-contain" />
              ) : (
                <div className="firma-space" />
              )}
              <div className="mt-1 text-[10px] font-bold uppercase text-slate-700">
                {data.empresa.responsableReporte ?? "RESPONSABLE"}
              </div>
              <div className="text-[9px] uppercase text-slate-600">
                {data.empresa.cargoReporte ?? ""}
              </div>
              <div className="text-[9px] text-slate-600">{data.empresa.razonSocial}</div>
            </div>
          </div>

          <div className="px-2 pb-2 text-[10px] font-medium text-slate-700">Informe al {fecha}</div>
        </div>
      </div>
    </div>
  );
}