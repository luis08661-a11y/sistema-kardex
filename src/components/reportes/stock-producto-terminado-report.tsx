"use client";

import { ReportTemplate } from "./report-template";

export type StockProductoTerminadoReportData = {
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
  fechaCorte?: Date;
  items: Array<{
    productoId: string;
    presentacionId: string | null;
    descripcion: string;
    codigo: string;
    presentacion: string;
    unidad: string;
    stock: number;
    costoValorizado: number;
  }>;
};

const fmt = (n: number) =>
  n.toLocaleString("es-PE", { minimumFractionDigits: 0, maximumFractionDigits: 3 });

export default function StockProductoTerminadoReport({ data }: { data: StockProductoTerminadoReportData }) {
  return (
    <ReportTemplate
      data={data}
      titulo="CUADRO RESUMEN DE INVENTARIO"
      subtitulo="PRODUCTO TERMINADO"
      encabezado={
        <div className="flex items-center justify-between px-1 pb-1 text-[10px] text-slate-700">
          <span>Método de valuación: PEPS</span>
          <span>Código de establecimiento: {data.establecimientoCodigo || "—"}</span>
        </div>
      }
    >
      <div className="px-2 pt-1">
        <table className="report-table">
          <thead className="report-table-head">
            <tr>
              <th className="text-left">DESCRIPCIÓN</th>
              <th>CÓDIGO</th>
              <th className="text-left">PRESENTACIÓN</th>
              <th className="text-right">STOCK TOTAL</th>
              <th>OBSERVACIONES</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item) => (
              <tr key={`${item.productoId}::${item.presentacionId ?? ""}`}>
                <td className="cell-especie">{item.descripcion}</td>
                <td className="text-center font-mono">{item.codigo}</td>
                <td>{item.presentacion}</td>
                <td className="text-right font-semibold">{fmt(item.stock)}</td>
                <td className="text-center">{item.unidad}</td>
              </tr>
            ))}
            {data.items.length === 0 && (
              <tr>
                <td colSpan={5} className="py-4 text-center text-slate-500">
                  Sin registros para los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot className="report-table-foot">
            <tr>
              <td colSpan={3} className="text-right">
                STOCK TOTAL
              </td>
              <td className="text-right">
                {fmt(data.items.reduce((acc, i) => acc + i.stock, 0))}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>

        <div className="mt-2 text-[10px] font-medium text-slate-700">
          Producto listo para etiquetar y despachar.
        </div>
      </div>
    </ReportTemplate>
  );
}
