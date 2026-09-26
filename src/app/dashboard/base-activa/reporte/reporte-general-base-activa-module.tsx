"use client";

import { useCallback, useMemo, useState } from "react";
import { Loader2, PackageSearch } from "lucide-react";
import { ReporteGeneralHeader } from "@/components/reportes/reporte-general-header";
import { FiltrosReporteGeneral } from "@/components/reportes/filtros-reporte-general";
import { TarjetaAccionesReporte } from "@/components/reportes/tarjeta-acciones-reporte";
import { ReporteGeneralBaseActivaTabla } from "@/components/reportes/reporte-general-base-activa-tabla";
import {
  exportarReporteGeneralBaseActivaExcel,
  exportarReporteGeneralBaseActivaPdf,
} from "@/lib/reportes/reporte-general-base-activa.export";
import { fechaCorta, fmt, imprimir } from "@/lib/reportes/formatters";
import {
  consultarReporteGeneral,
  type ReporteGeneralContexto,
  type ReporteGeneralData,
} from "@/actions/reporte-general-base-activa.actions";

const isoHoy = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const fechaDesdeInicial = () => {
  const d = new Date();
  d.setDate(1);
  return isoHoy(d);
};

export function ReporteGeneralBaseActivaModule({
  contexto,
}: {
  contexto: ReporteGeneralContexto;
}) {
  const [productoId, setProductoId] = useState("");
  const [loteId, setLoteId] = useState("");
  const [fechaDesde, setFechaDesde] = useState(fechaDesdeInicial);
  const [fechaHasta, setFechaHasta] = useState(() => isoHoy(new Date()));
  const [data, setData] = useState<ReporteGeneralData | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const productoLotes = useMemo(
    () => contexto.lotes.filter((l) => !productoId || l.productoId === productoId),
    [contexto.lotes, productoId],
  );

  const hayFiltros = Boolean(productoId || loteId);

  const consultar = useCallback(async () => {
    setError("");
    if (fechaDesde && fechaHasta && fechaDesde > fechaHasta) {
      setError("La fecha desde no puede ser mayor que la fecha hasta.");
      return;
    }
    setCargando(true);
    try {
      const res = await consultarReporteGeneral({
        productoId: productoId || undefined,
        loteId: loteId || undefined,
        fechaDesde: fechaDesde || undefined,
        fechaHasta: fechaHasta || undefined,
      });
      setData(res);
    } catch (e) {
      setError((e instanceof Error ? e.message : "Error al consultar.") || "Error al consultar.");
    } finally {
      setCargando(false);
    }
  }, [fechaDesde, fechaHasta, loteId, productoId]);

  const limpiar = useCallback(() => {
    setProductoId("");
    setLoteId("");
    setFechaDesde(fechaDesdeInicial());
    setFechaHasta(isoHoy(new Date()));
    setData(null);
    setError("");
  }, []);

  const onExportarExcel = useCallback(() => {
    if (data) exportarReporteGeneralBaseActivaExcel(data);
  }, [data]);

  const onExportarPdf = useCallback(async () => {
    if (data) await exportarReporteGeneralBaseActivaPdf(data);
  }, [data]);

  const hayDatos = Boolean(data && !cargando && data.items.length > 0);

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 px-4 py-3 md:py-4 lg:px-6">
          <div className="space-y-6">
            <ReporteGeneralHeader
              titulo="REPORTE GENERAL BASE ACTIVA"
              subtitulo="BASE ACTIVA (MATERIA PRIMA)"
              descripcion="Registro de Inventario Permanente Valorizado."
              fecha={hayDatos ? fechaCorta(data!.fechaHasta) : null}
            />

            <FiltrosReporteGeneral
              productos={contexto.productos}
              lotes={productoLotes}
              productoId={productoId}
              loteId={loteId}
              fechaDesde={fechaDesde}
              fechaHasta={fechaHasta}
              totalRegistros={data && !cargando ? data.items.length : null}
              hayFiltros={hayFiltros}
              error={error}
              cargando={cargando}
              onProductoChange={(v) => {
                setProductoId(v);
                setLoteId("");
              }}
              onLoteChange={setLoteId}
              onFechaDesdeChange={setFechaDesde}
              onFechaHastaChange={setFechaHasta}
              onConsultar={consultar}
              onLimpiar={limpiar}
            />

            {cargando && (
              <div className="no-print flex items-center justify-center gap-2 rounded-xl border bg-card p-6 text-sm text-muted-foreground shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Consultando...
              </div>
            )}

            {data && !cargando && data.items.length === 0 && (
              <div className="no-print flex flex-col items-center justify-center gap-3 rounded-xl border bg-card p-12 text-center shadow-sm">
                <PackageSearch className="size-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  Sin registros para los filtros seleccionados.
                </p>
              </div>
            )}

            {hayDatos && (
              <>
                <TarjetaAccionesReporte
                  titulo="Reporte General Base Activa"
                  registros={data!.items.length}
                  resumen={`Stock final ${fmt(data!.stockFinalPeso)} KG`}
                  onExcel={onExportarExcel}
                  onPdf={onExportarPdf}
                  onImprimir={imprimir}
                />

                <ReporteGeneralBaseActivaTabla data={data!} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
