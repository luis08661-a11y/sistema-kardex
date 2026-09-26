import type { ReporteGeneralProductoTerminadoData } from "@/actions/reporte-general-producto-terminado.actions";
import { fechaCorta, fmt, fmtCan } from "@/lib/reportes/formatters";

const TH_GRUPO =
  "border border-emerald-700 bg-emerald-700 py-1.5 text-center text-[10px] font-bold uppercase text-white";
const TH_GRUPO_AZUL =
  "border border-blue-600 bg-blue-600 py-1.5 text-center text-[10px] font-bold uppercase text-white";
const TH_GRUPO_INFO =
  "border border-emerald-200 dark:border-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 py-1.5 text-center text-[10px] font-bold uppercase text-emerald-900 dark:text-emerald-300";
const TH = "border px-1.5 py-1 text-center bg-muted/50";
const TH_PLAIN = "border px-1.5 py-1 text-center";
const TH_AZUL =
  "border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-1 text-center";
const TH_INFO =
  "border border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-1 text-center";

function Dato({
  etiqueta,
  valor,
}: {
  etiqueta: string;
  valor: string | null | undefined;
}) {
  return (
    <div>
      <span className="font-semibold text-foreground">{etiqueta}</span>{" "}
      <span className="text-primary">{valor}</span>
    </div>
  );
}

export function ReporteGeneralProductoTerminadoTabla({
  data,
}: {
  data: ReporteGeneralProductoTerminadoData;
}) {
  const producto = data.productoSeleccionado;

  return (
    <section data-report-print="true" className="rounded-xl border bg-card shadow-sm">
      {/* ENCABEZADO OFICIAL */}
      <div className="border-b p-6">
        <h3 className="mb-4 text-center text-sm font-bold uppercase tracking-wide text-foreground">
          Registro de Inventario Permanente Valorizado
          <br />
          <span className="text-xs">
            - Detalle del Inventario Valorizado - Producto Terminado
          </span>
        </h3>

        <div className="flex items-start justify-between">
          <div className="space-y-1.5 text-xs">
            <Dato etiqueta="PERÍODO:" valor={data.periodo} />
            <Dato etiqueta="RUC:" valor={data.empresa.ruc} />
            <Dato etiqueta="DENOMINACIÓN O RAZÓN SOCIAL:" valor={data.empresa.razonSocial} />
            <Dato etiqueta="ESTABLECIMIENTO:" valor={data.establecimiento} />
            {producto && (
              <>
                <Dato etiqueta="CÓDIGO DE LA EXISTENCIA:" valor={producto.codigoExistencia} />
                <Dato etiqueta="TIPO (TABLA 5):" valor={producto.tipoExistencia} />
                <Dato etiqueta="DESCRIPCIÓN:" valor={producto.descripcion} />
                <Dato etiqueta="PRESENTACIÓN:" valor={producto.presentacion} />
                <Dato
                  etiqueta="CÓDIGO DE LA UNIDAD DE MEDIDA (TABLA 6):"
                  valor={producto.unidadMedida}
                />
                <Dato etiqueta="MÉTODO DE VALUACIÓN:" valor={producto.metodoValuacion} />
              </>
            )}
          </div>

          {data.empresa.logoUrl && (
            <div className="h-16 w-16 flex-shrink-0">
              <img
                src={data.empresa.logoUrl}
                alt="Logo"
                className="h-full w-full object-contain"
              />
            </div>
          )}
        </div>
      </div>

      {/* TABLA PRINCIPAL */}
      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead>
            <tr>
              <th colSpan={3} className={TH_GRUPO}>
                Documento de Traslado / Comprobante de Pago
              </th>
              <th className={TH_GRUPO}>
                Tipo de Operación
                <br />
                <span className="text-[8px] font-normal">(Tabla 12)</span>
              </th>
              <th colSpan={3} className={TH_GRUPO}>
                Entradas
              </th>
              <th colSpan={3} className={TH_GRUPO}>
                Salidas
              </th>
              <th colSpan={3} className={TH_GRUPO_AZUL}>
                Saldo Final (PEPS)
              </th>
              <th colSpan={1} className={TH_GRUPO}>
                Motivo de Salida
              </th>
              <th colSpan={6} className={TH_GRUPO_INFO}>
                Información del Registro
              </th>
            </tr>
            <tr className="bg-emerald-50 dark:bg-emerald-950/40 text-[9px] font-semibold">
              <th className={TH}>Fecha</th>
              <th className={TH}>Serie</th>
              <th className={TH}>Núm</th>
              <th className={TH}>Tipo de Operación</th>
              <th className={TH_PLAIN}>CAN</th>
              <th className={TH_PLAIN}>C. UNT</th>
              <th className={TH_PLAIN}>Costo Total</th>
              <th className={TH_PLAIN}>CAN</th>
              <th className={TH_PLAIN}>C. UNT</th>
              <th className={TH_PLAIN}>C. Total</th>
              <th className={TH_AZUL}>CAN</th>
              <th className={TH_AZUL}>C. UNT</th>
              <th className={TH_AZUL}>C. Total</th>
              <th className={TH_PLAIN}>Motivo</th>
              <th className={TH_INFO}>Fact/Bol/Recib</th>
              <th className={TH_INFO}>Guía</th>
              <th className={TH_INFO}>Empresa</th>
              <th className={TH_INFO}>Ing. Campo</th>
              <th className={TH_INFO}>Observación</th>
              <th className={TH_INFO}>Resp. Despacho</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item) => (
              <tr key={item.id} className="hover:bg-muted/30">
                <td className="border px-1.5 py-1 text-center whitespace-nowrap">
                  {fechaCorta(item.fecha)}
                </td>
                <td className="border px-1.5 py-1 text-center font-medium">
                  {item.serie}
                </td>
                <td className="border px-1.5 py-1 text-center">{item.numero}</td>
                <td className="border px-1.5 py-1 text-center">{item.tipoOperacion}</td>
                <td className="border px-1.5 py-1 text-right">
                  {item.entradaCan ? fmtCan(item.entradaCan) : ""}
                </td>
                <td className="border px-1.5 py-1 text-right">
                  {item.entradaCostoUnitario ? fmt(item.entradaCostoUnitario) : ""}
                </td>
                <td className="border px-1.5 py-1 text-right">
                  {item.entradaCostoTotal ? fmt(item.entradaCostoTotal) : ""}
                </td>
                <td className="border px-1.5 py-1 text-right">
                  {item.salidaCan ? fmtCan(item.salidaCan) : ""}
                </td>
                <td className="border px-1.5 py-1 text-right">
                  {item.salidaCostoUnitario ? fmt(item.salidaCostoUnitario) : ""}
                </td>
                <td className="border px-1.5 py-1 text-right">
                  {item.salidaCostoTotal ? fmt(item.salidaCostoTotal) : ""}
                </td>
                <td className="border border-blue-300 dark:border-blue-700 bg-blue-50/30 dark:bg-blue-950/20 px-1.5 py-1 text-right">
                  {fmtCan(item.saldoCan)}
                </td>
                <td className="border border-blue-300 dark:border-blue-700 bg-blue-50/30 dark:bg-blue-950/20 px-1.5 py-1 text-right">
                  {fmt(item.saldoCostoUnitario)}
                </td>
                <td className="border border-blue-300 dark:border-blue-700 bg-blue-50/30 dark:bg-blue-950/20 px-1.5 py-1 text-right font-medium">
                  {fmt(item.saldoCostoTotal)}
                </td>
                <td className="border px-1.5 py-1 text-center">{item.motivo}</td>
                <td className="border border-emerald-200 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/20 px-1.5 py-1 text-center">
                  {item.facturaGuia}
                </td>
                <td className="border border-emerald-200 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/20 px-1.5 py-1 text-center">
                  {item.documentoTraslado}
                </td>
                <td className="border border-emerald-200 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/20 px-1.5 py-1">
                  {item.empresaDestino}
                </td>
                <td className="border border-emerald-200 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/20 px-1.5 py-1">
                  {item.ingCampo}
                </td>
                <td className="border border-emerald-200 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/20 px-1.5 py-1">
                  {item.observacion}
                </td>
                <td className="border border-emerald-200 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/20 px-1.5 py-1">
                  {item.responsableDespacho}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-emerald-50 dark:bg-emerald-950/40 font-semibold">
              <td
                colSpan={4}
                className="border px-1.5 py-1.5 text-center text-xs text-emerald-800 dark:text-emerald-300"
              >
                TOTALES
              </td>
              <td className="border px-1.5 py-1.5 text-right">
                {fmtCan(data.totalEntradasCan)}
              </td>
              <td className="border px-1.5 py-1.5 text-right">-</td>
              <td className="border px-1.5 py-1.5 text-right">
                {fmt(data.totalEntradasCostoTotal)}
              </td>
              <td className="border px-1.5 py-1.5 text-right">
                {fmtCan(data.totalSalidasCan)}
              </td>
              <td className="border px-1.5 py-1.5 text-right">-</td>
              <td className="border px-1.5 py-1.5 text-right">
                {fmt(data.totalSalidasCostoTotal)}
              </td>
              <td className="border border-blue-300 dark:border-blue-700 bg-blue-100 dark:bg-blue-950/60 px-1.5 py-1.5 text-right font-bold">
                {fmtCan(data.stockFinalCan)}
              </td>
              <td className="border border-blue-300 dark:border-blue-700 bg-blue-100 dark:bg-blue-950/60 px-1.5 py-1.5 text-right">
                -
              </td>
              <td className="border border-blue-300 dark:border-blue-700 bg-blue-100 dark:bg-blue-950/60 px-1.5 py-1.5 text-right font-bold">
                {fmt(data.stockFinalCostoTotal)}
              </td>
              <td colSpan={7} />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* STOCK FINAL */}
      <div className="border-t p-4 text-center bg-card">
        <span className="text-sm font-bold text-primary">
          STOCK AL {fechaCorta(data.fechaHasta)}: {fmtCan(data.stockFinalCan)}
        </span>
      </div>
    </section>
  );
}
