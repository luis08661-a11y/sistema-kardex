"use client";

import { useCallback, useState } from "react";

import {
  consultarReporteVentas,
  type ReporteVentasData,
} from "@/actions/reporte-ventas.actions";

const isoHoy = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const hoy = isoHoy();

export type FiltrosReporteVentas = {
  fechaDesde: string;
  fechaHasta: string;
  tipoComprobante: string;
  estado: string;
  formaPago: string;
  numeroComprobante: string;
  documento: string;
};

const INICIAL: FiltrosReporteVentas = {
  fechaDesde: hoy,
  fechaHasta: hoy,
  tipoComprobante: "TODOS",
  estado: "TODOS",
  formaPago: "TODOS",
  numeroComprobante: "",
  documento: "",
};

const SIN_FILTROS: FiltrosReporteVentas = {
  fechaDesde: "",
  fechaHasta: "",
  tipoComprobante: "TODOS",
  estado: "TODOS",
  formaPago: "TODOS",
  numeroComprobante: "",
  documento: "",
};

const hayFiltrosActivos = (f: FiltrosReporteVentas) =>
  Boolean(
    f.fechaDesde ||
      f.fechaHasta ||
      f.tipoComprobante !== "TODOS" ||
      f.estado !== "TODOS" ||
      f.formaPago !== "TODOS" ||
      f.numeroComprobante.trim() ||
      f.documento.trim(),
  );

const construirParametros = (f: FiltrosReporteVentas) => ({
  fechaDesde: f.fechaDesde || undefined,
  fechaHasta: f.fechaHasta || undefined,
  tipoComprobante: f.tipoComprobante === "TODOS" ? undefined : f.tipoComprobante,
  estado: f.estado === "TODOS" ? undefined : f.estado,
  formaPago: f.formaPago === "TODOS" ? undefined : f.formaPago,
  numeroComprobante: f.numeroComprobante.trim() || undefined,
  documento: f.documento.trim() || undefined,
});

export function useConsultaReporteVentas() {
  const [filtros, setFiltros] = useState<FiltrosReporteVentas>(INICIAL);
  const [data, setData] = useState<ReporteVentasData | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const setCampo = useCallback(
    <K extends keyof FiltrosReporteVentas>(
      campo: K,
      valor: FiltrosReporteVentas[K],
    ) => {
      setFiltros((f) => ({ ...f, [campo]: valor }));
    },
    [],
  );

  const consultar = useCallback(async () => {
    setError("");
    if (filtros.fechaDesde && filtros.fechaHasta && filtros.fechaDesde > filtros.fechaHasta) {
      setError("La fecha desde no puede ser mayor que la fecha hasta.");
      return;
    }
    setCargando(true);
    try {
      setData(await consultarReporteVentas(construirParametros(filtros)));
    } catch (e) {
      setError(
        (e instanceof Error ? e.message : "Error al consultar el reporte.") ||
          "Error al consultar el reporte.",
      );
    } finally {
      setCargando(false);
    }
  }, [filtros]);

  const limpiar = useCallback(() => {
    setFiltros(SIN_FILTROS);
    setData(null);
    setError("");
  }, []);

  return {
    filtros,
    setCampo,
    data,
    cargando,
    error,
    hayFiltros: hayFiltrosActivos(filtros),
    consultar,
    limpiar,
  };
}
