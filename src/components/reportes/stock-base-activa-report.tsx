"use client";

export type StockBaseActivaReportData = {
  empresa: {
    ruc: string;
    razonSocial: string;
    logoUrl?: string | null;
    firmaUrl?: string | null;
    responsableReporte?: string | null;
    cargoReporte?: string | null;
  };
  establecimiento: string;
  establecimientoCodigo?: string;
  periodo: string;
  fechaInforme: Date;
  items: Array<{
    productoId: string;
    descripcion: string;
    codigo: string;
    codigoExistencia: string;
    tipoExistencia?: string;
    unidadMedida?: string;
    metodoValuacion?: string;
    lotes: Array<{
      lote: string;
      stockKg: number;
      ubicacion?: string | null;
      observacion?: string | null;
    }>;
    totalKg: number;
  }>;
};

const fmt = (n: number) =>
  n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function StockBaseActivaReport({ data }: { data: StockBaseActivaReportData }) {
  const totalGeneral = data.items.reduce((acc, g) => acc + g.totalKg, 0);
  const fecha = data.fechaInforme.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
  const logoRef = data.empresa.logoUrl;

  return (
    <div className="report-a4">
      <div className="report-page">
        <div className="report-marco">
          <div className="report-header">
            <div className="flex items-center justify-between px-4 py-2">
              <div className="flex items-center gap-3">
                <div className="report-logo">
                  {logoRef ? (
                    <img src={logoRef} alt="Logo" className="h-full w-full object-contain" />
                  ) : null}
                </div>
                <div>
                  <div className="report-title">CUADRO RESUMEN DE INVENTARIO</div>
                  <div className="report-subtitle">BASE ACTIVA</div>
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

          <table className="report-table">
            <thead className="report-table-head">
              <tr>
                <th>ESPECIE</th>
                <th>CÓDIGO</th>
                <th>CÓD. EXIST.</th>
                <th>LOTE</th>
                <th className="text-right">STOCK TOTAL (KG)</th>
                <th>UBICACIÓN</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((g) => (
                <FragmentGroup key={g.productoId} group={g} />
              ))}
              {data.items.length === 0 && (
                <tr><td colSpan={6} className="py-4 text-center text-slate-500">Sin registros para los filtros seleccionados.</td></tr>
              )}
            </tbody>
            <tfoot className="report-table-foot">
              <tr>
                <td colSpan={4} className="px-2 font-bold">TOTAL GENERAL</td>
                <td className="text-right font-bold">{fmt(totalGeneral)}</td>
                <td />
              </tr>
            </tfoot>
          </table>

          <div className="mt-2 flex items-center justify-between px-1">
            <div className="text-[10px] font-medium text-slate-700">Informe al {fecha}</div>
            <div className="text-[10px] font-medium text-slate-700">Método de valuación: PEPS · Unidad: Kg</div>
          </div>

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
        </div>
      </div>
    </div>
  );
}

function FragmentGroup({ group }: { group: StockBaseActivaReportData["items"][number] }) {
  const rowspan = group.lotes.length + 1;
  return (
    <>
      {group.lotes.map((l, idx) => (
        <tr key={`${group.productoId}-${l.lote}`} className={idx === 0 ? "row-producto" : "row-continuacion"}>
          {idx === 0 && (
            <>
              <td rowSpan={rowspan} className="cell-especie">{group.descripcion}</td>
              <td rowSpan={rowspan} className="text-center">{group.codigo}</td>
              <td rowSpan={rowspan} className="text-center">{group.codigoExistencia}</td>
            </>
          )}
          <td>{l.lote}</td>
          <td className="text-right">{fmt(l.stockKg)}</td>
          <td>{l.ubicacion ?? "—"}</td>
        </tr>
      ))}
      <tr className="row-total">
        <td colSpan={1} className="pl-8 font-semibold">Total {group.descripcion}</td>
        <td colSpan={3} className="text-right font-semibold">{group.codigo} / {group.codigoExistencia}</td>
        <td className="text-right font-semibold">{fmt(group.totalKg)}</td>
        <td />
      </tr>
    </>
  );
}