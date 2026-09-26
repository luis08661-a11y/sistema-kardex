"use client";

import { PdfPreviewDialog } from "@/components/reportes/pdf-preview-dialog";
import { VentaDetalleDialog } from "@/components/ventas/venta-detalle-dialog";
import { EnviarWhatsAppDialog } from "@/components/ventas/enviar-whatsapp-dialog";
import { exportarPdfVenta } from "@/components/ventas/venta-export";
import type { AccionesVenta } from "./use-acciones-venta";

type Props = {
  acciones: AccionesVenta;
  verPdf: boolean;
  pdfUrl: string | null;
  pdfNombre: string;
  cargandoPdf: boolean;
  onVerPdfChange: (open: boolean) => void;
  onDescargarReporte: () => void;
};

export function DialogosReporteVentas({
  acciones,
  verPdf,
  pdfUrl,
  pdfNombre,
  cargandoPdf,
  onVerPdfChange,
  onDescargarReporte,
}: Props) {
  const {
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
    cerrarPdfVentaDe,
  } = acciones;

  return (
    <>
      <PdfPreviewDialog
        open={verPdf}
        onOpenChange={onVerPdfChange}
        url={pdfUrl}
        filename={pdfNombre}
        cargando={cargandoPdf}
        onDescargar={onDescargarReporte}
      />

      <PdfPreviewDialog
        open={pdfVentaAbierto}
        onOpenChange={(o) => {
          if (!o) {
            cerrarPdfVentaDe();
          } else {
            setPdfVentaAbierto(o);
          }
        }}
        url={pdfVentaUrl}
        filename={pdfVenta ? `${pdfVenta.serie}-${String(pdfVenta.numero).padStart(6, "0")}.pdf` : ""}
        titulo="Vista previa del comprobante"
        onDescargar={() => {
          if (pdfVenta) void exportarPdfVenta(pdfVenta);
        }}
      />

      <VentaDetalleDialog
        venta={ventaEnDetalle}
        open={detalleAbierto}
        onOpenChange={setDetalleAbierto}
        cargando={cargandoDetalle}
      />

      {ventaParaWhatsapp && (
        <EnviarWhatsAppDialog
          venta={ventaParaWhatsapp}
          open={whatsappAbierto}
          onOpenChange={(o) => {
            setWhatsappAbierto(o);
            if (!o) setVentaParaWhatsapp(null);
          }}
        />
      )}
    </>
  );
}
