"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

import {
  exportarReporteVentasExcel,
  generarReporteVentasPdf,
  nombreReporteVentasPdf,
} from "@/lib/reportes/reporte-ventas.export";
import type {
  ReporteVentasContexto,
  ReporteVentasData,
} from "@/actions/reporte-ventas.actions";

export function useExportesReporteVentas({
  data,
  contexto,
  fechaHasta,
}: {
  data: ReporteVentasData | null;
  contexto: ReporteVentasContexto;
  fechaHasta: string;
}) {
  const [verPdf, setVerPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfNombre, setPdfNombre] = useState("");
  const [cargandoPdf, setCargandoPdf] = useState(false);

  const exportarExcel = useCallback(() => {
    if (!data) return;
    exportarReporteVentasExcel(data, contexto, fechaHasta);
  }, [contexto, data, fechaHasta]);

  const exportarPdf = useCallback(async () => {
    if (!data) return;
    try {
      const doc = await generarReporteVentasPdf(data, contexto);
      doc.save(nombreReporteVentasPdf(fechaHasta));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo exportar el PDF.");
    }
  }, [contexto, data, fechaHasta]);

  const previsualizarPdf = useCallback(async () => {
    if (!data) return;
    setCargandoPdf(true);
    try {
      const doc = await generarReporteVentasPdf(data, contexto);
      const url = URL.createObjectURL(doc.output("blob"));
      setPdfUrl(url);
      setPdfNombre(nombreReporteVentasPdf(fechaHasta));
      setVerPdf(true);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "No se pudo generar la vista previa.",
      );
    } finally {
      setCargandoPdf(false);
    }
  }, [contexto, data, fechaHasta]);

  const cerrarVistaPrevia = useCallback(() => {
    setVerPdf(false);
    setPdfUrl((url) => {
      if (url) URL.revokeObjectURL(url);
      return null;
    });
  }, []);

  return {
    verPdf,
    setVerPdf,
    pdfUrl,
    pdfNombre,
    cargandoPdf,
    exportarExcel,
    exportarPdf,
    previsualizarPdf,
    cerrarVistaPrevia,
  };
}
