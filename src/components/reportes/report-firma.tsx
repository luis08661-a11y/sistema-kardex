import type { ReportTemplateData } from "@/components/reportes/report-template";

export function ReportFirma({ empresa }: { empresa: ReportTemplateData["empresa"] }) {
  return (
    <div className="report-firma">
      <div className="firma-box">
        {empresa.firmaUrl ? (
          <img src={empresa.firmaUrl} alt="Firma" className="mx-auto h-16 object-contain" />
        ) : (
          <div className="firma-space" />
        )}
        <div className="mt-1 text-[10px] font-bold uppercase text-slate-700">
          {empresa.responsableReporte ?? "RESPONSABLE"}
        </div>
        <div className="text-[9px] uppercase text-slate-600">
          {empresa.cargoReporte ?? ""}
        </div>
        <div className="text-[9px] text-slate-600">{empresa.razonSocial}</div>
      </div>
    </div>
  );
}
