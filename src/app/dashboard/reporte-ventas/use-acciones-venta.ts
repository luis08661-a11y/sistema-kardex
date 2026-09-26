"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

import {
  enviarVentaCorreo,
  exportarPdfVenta,
} from "@/components/ventas/venta-export";
import { ventaDTOParaImprimir, type VentaParaImprimir } from "@/components/ventas/types";
import { obtenerVenta } from "@/actions/venta.actions";
import type { ReporteVentasFila } from "@/actions/reporte-ventas.actions";

export function useAccionesVenta() {
  const [ventaEnDetalle, setVentaEnDetalle] = useState<VentaParaImprimir | null>(null);
  const [detalleAbierto, setDetalleAbierto] = useState(false);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [accionando, setAccionando] = useState<string | null>(null);
  const [pdfVentaAbierto, setPdfVentaAbierto] = useState(false);
  const [pdfVentaUrl, setPdfVentaUrl] = useState<string | null>(null);
  const [pdfVenta, setPdfVenta] = useState<VentaParaImprimir | null>(null);
  const [whatsappAbierto, setWhatsappAbierto] = useState(false);
  const [ventaParaWhatsapp, setVentaParaWhatsapp] = useState<VentaParaImprimir | null>(null);

  const obtenerImprimible = useCallback(async (fila: ReporteVentasFila) => {
    const dto = await obtenerVenta(fila.ventaId);
    if (!dto) throw new Error("No se encontró la venta.");
    return ventaDTOParaImprimir(dto);
  }, []);

  const verDetalle = useCallback(async (fila: ReporteVentasFila) => {
    setAccionando(fila.ventaId);
    setCargandoDetalle(true);
    setDetalleAbierto(true);
    try {
      setVentaEnDetalle(await obtenerImprimible(fila));
    } catch (e) {
      setDetalleAbierto(false);
      toast.error(e instanceof Error ? e.message : "No se pudo cargar el comprobante");
    } finally {
      setCargandoDetalle(false);
      setAccionando(null);
    }
  }, [obtenerImprimible]);

  const previsualizarPdfVentaDe = useCallback(async (fila: ReporteVentasFila) => {
    setAccionando(fila.ventaId);
    try {
      const venta = await obtenerImprimible(fila);
      const url = await exportarPdfVenta(venta, { preview: true });
      if (url) setPdfVentaUrl(url);
      setPdfVenta(venta);
      setPdfVentaAbierto(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo generar la vista previa");
    } finally {
      setAccionando(null);
    }
  }, [obtenerImprimible]);

  const cerrarPdfVentaDe = useCallback(() => {
    setPdfVentaAbierto(false);
    if (pdfVentaUrl) {
      URL.revokeObjectURL(pdfVentaUrl);
      setPdfVentaUrl(null);
    }
  }, [pdfVentaUrl]);

  const enviarWhatsApp = useCallback(async (fila: ReporteVentasFila) => {
    setAccionando(fila.ventaId);
    try {
      const venta = await obtenerImprimible(fila);
      setVentaParaWhatsapp(venta);
      setWhatsappAbierto(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo cargar la venta");
    } finally {
      setAccionando(null);
    }
  }, [obtenerImprimible]);

  const enviarCorreo = useCallback(async (fila: ReporteVentasFila) => {
    if (!fila.email) {
      toast.error("El cliente de esta venta no tiene correo registrado");
      return;
    }
    setAccionando(fila.ventaId);
    try {
      enviarVentaCorreo(await obtenerImprimible(fila), fila.email);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo armar el correo");
    } finally {
      setAccionando(null);
    }
  }, [obtenerImprimible]);

  return {
    accionando,
    ventaEnDetalle,
    detalleAbierto,
    setDetalleAbierto,
    cargandoDetalle,
    pdfVentaAbierto,
    setPdfVentaAbierto,
    pdfVentaUrl,
    pdfVenta,
    whatsappAbierto,
    setWhatsappAbierto,
    ventaParaWhatsapp,
    setVentaParaWhatsapp,
    verDetalle,
    previsualizarPdfVentaDe,
    cerrarPdfVentaDe,
    enviarWhatsApp,
    enviarCorreo,
  };
}

export type AccionesVenta = ReturnType<typeof useAccionesVenta>;
