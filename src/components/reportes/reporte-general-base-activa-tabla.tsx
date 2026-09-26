import type { ReporteGeneralData } from "@/actions/reporte-general-base-activa.actions";
import { fechaCorta, fmt, fmtEntero } from "@/lib/reportes/formatters";

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

export function ReporteGeneralBaseActivaTabla({
  data,
}: {
  data: ReporteGeneralData;
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
            - Detalle del Inventario Valorizado - Base Activa
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
              <th colSpan={5} className={TH_GRUPO}>
                Detalle del Registro
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
                Saldo Final
              </th>
              <th colSpan={1} className={TH_GRUPO}>
                Motivo de Salida
                <br />
                <span className="text-[8px] font-normal">Formulación</span>
              </th>
              <th colSpan={3} className={TH_GRUPO_INFO}>
                Registro de Cantidad Final de Base Activa
              </th>
            </tr>
            <tr className="bg-emerald-50 dark:bg-emerald-950/40 text-[9px] font-semibold">
              <th className={TH}>Fecha</th>
              <th className={TH}>Código</th>
              <th className={TH}>Descripción</th>
              <th className={TH}>Observación</th>
              <th className={TH}>Responsable del registro</th>
              <th className={TH}>Tipo de Operación</th>
              <th className={TH_PLAIN}>UND</th>
              <th className={TH_PLAIN}>Peso Unitario</th>
              <th className={TH_PLAIN}>Peso Total</th>
              <th className={TH_PLAIN}>UND</th>
              <th className={TH_PLAIN}>Peso Unitario</th>
              <th className={TH_PLAIN}>Peso Total</th>
              <th className={TH_AZUL}>UND</th>
              <th className={TH_AZUL}>Peso Unitario</th>
              <th className={TH_AZUL}>Peso Total</th>
              <th className={TH_PLAIN}>Tipo</th>
              <th className={TH_INFO}>Resp. Formulación</th>
              <th className={TH_INFO}>Cant. Prod. Formulado</th>
              <th className={TH_INFO}>Almacenamiento</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item) => (
              <tr key={item.id} className="hover:bg-muted/30">
                <td className="border px-1.5 py-1 text-center whitespace-nowrap">
                  {fechaCorta(item.fecha)}
                </td>
                <td className="border px-1.5 py-1 text-center font-medium">
                  {item.codigoLote}
                </td>
                <td className="border px-1.5 py-1">{item.descripcion}</td>
                <td className="border px-1.5 py-1">{item.observacion ?? ""}</td>
                <td className="border px-1.5 py-1">{item.responsableRegistro ?? ""}</td>
                <td className="border px-1.5 py-1 text-center">{item.tipoOperacion}</td>
                <td className="border px-1.5 py-1 text-right">
                  {item.entradaUnd ? fmtEntero(item.entradaUnd) : ""}
                </td>
                <td className="border px-1.5 py-1 text-right">
                  {item.entradaPesoUnitarioKg ? fmt(item.entradaPesoUnitarioKg) : ""}
                </td>
                <td className="border px-1.5 py-1 text-right">
                  {item.entradaPesoTotalKg ? fmt(item.entradaPesoTotalKg) : ""}
                </td>
                <td className="border px-1.5 py-1 text-right">
                  {item.salidaUnd ? fmtEntero(item.salidaUnd) : ""}
                </td>
                <td className="border px-1.5 py-1 text-right">
                  {item.salidaPesoUnitarioKg ? fmt(item.salidaPesoUnitarioKg) : ""}
                </td>
                <td className="border px-1.5 py-1 text-right">
                  {item.salidaPesoTotalKg ? fmt(item.salidaPesoTotalKg) : ""}
                </td>
                <td className="border border-blue-300 dark:border-blue-700 bg-blue-50/30 dark:bg-blue-950/20 px-1.5 py-1 text-right">
                  {fmtEntero(item.saldoUnd)}
                </td>
                <td className="border border-blue-300 dark:border-blue-700 bg-blue-50/30 dark:bg-blue-950/20 px-1.5 py-1 text-right">
                  {fmt(item.saldoPesoUnitarioKg)}
                </td>
                <td className="border border-blue-300 dark:border-blue-700 bg-blue-50/30 dark:bg-blue-950/20 px-1.5 py-1 text-right font-medium">
                  {fmt(item.saldoPesoTotalKg)}
                </td>
                <td className="border px-1.5 py-1 text-center">
                  {item.formulacion ?? ""}
                </td>
                <td className="border border-emerald-200 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/20 px-1.5 py-1">
                  {item.responsableFormulacion ?? ""}
                </td>
                <td className="border border-emerald-200 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/20 px-1.5 py-1 text-right">
                  {item.cantidadProductoFormulado != null
                    ? fmt(item.cantidadProductoFormulado)
                    : ""}
                </td>
                <td className="border border-emerald-200 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/20 px-1.5 py-1">
                  {item.almacenamientoNombre ?? ""}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-emerald-50 dark:bg-emerald-950/40 font-semibold">
              <td
                colSpan={6}
                className="border px-1.5 py-1.5 text-center text-xs text-emerald-800 dark:text-emerald-300"
              >
                TOTALES
              </td>
              <td className="border px-1.5 py-1.5 text-right">
                {fmtEntero(data.totalEntradasUnd)}
              </td>
              <td className="border px-1.5 py-1.5 text-right">-</td>
              <td className="border px-1.5 py-1.5 text-right">
                {fmt(data.totalEntradasPeso)}
              </td>
              <td className="border px-1.5 py-1.5 text-right">
                {fmtEntero(data.totalSalidasUnd)}
              </td>
              <td className="border px-1.5 py-1.5 text-right">-</td>
              <td className="border px-1.5 py-1.5 text-right">
                {fmt(data.totalSalidasPeso)}
              </td>
              <td className="border border-blue-300 dark:border-blue-700 bg-blue-100 dark:bg-blue-950/60 px-1.5 py-1.5 text-right">
                -
              </td>
              <td className="border border-blue-300 dark:border-blue-700 bg-blue-100 dark:bg-blue-950/60 px-1.5 py-1.5 text-right">
                -
              </td>
              <td className="border border-blue-300 dark:border-blue-700 bg-blue-100 dark:bg-blue-950/60 px-1.5 py-1.5 text-right font-bold">
                {fmt(data.stockFinalPeso)}
              </td>
              <td className="border px-1.5 py-1.5" />
              <td className="border border-emerald-200 dark:border-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-1.5" />
              <td className="border border-emerald-200 dark:border-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-1.5" />
              <td className="border border-emerald-200 dark:border-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-1.5" />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* STOCK FINAL */}
      <div className="border-t p-4 text-center bg-card">
        <span className="text-sm font-bold text-primary">
          STOCK AL {fechaCorta(data.fechaHasta)}: {fmt(data.stockFinalPeso)} KG
        </span>
      </div>
    </section>
  );
}
