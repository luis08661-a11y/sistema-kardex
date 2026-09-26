"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Loader2,
  MessageCircle,
  ExternalLink,
  FileDown,
  CheckCircle2,
  Phone,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

import type { VentaParaImprimir, TipoComprobante } from "@/components/ventas/types";
import { TIPO_COMPROBANTE_LABEL } from "@/components/ventas/types";
import { armarMensajeVenta } from "@/components/ventas/venta-export";
import {
  enviarVentaWhatsAppAction,
  marcarEnviadoWhatsAppAction,
} from "@/actions/venta-envio.actions";

interface Props {
  venta: VentaParaImprimir;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Resultado {
  envioId?: string;
  enlaceWhatsApp?: string;
  pdfDescargaUrl?: string;
}

export function EnviarWhatsAppDialog({ venta, open, onOpenChange }: Props) {
  const [telefono, setTelefono] = useState(() => venta.cliente?.telefono ?? "");
  const [mensaje, setMensaje] = useState(() => armarMensajeVenta(venta));
  const [preparando, setPreparando] = useState(false);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [marcado, setMarcado] = useState(false);

  const comprobante = `${TIPO_COMPROBANTE_LABEL[venta.tipoComprobante as TipoComprobante]} ${venta.serie}-${String(venta.numero).padStart(6, "0")}`;

  const preparar = async () => {
    setPreparando(true);
    setResultado(null);
    try {
      const telefonoLimpio = telefono.replace(/\D/g, "");
      const res = await enviarVentaWhatsAppAction({
        ventaId: venta.id,
        telefono: telefonoLimpio || telefono,
        mensaje,
      });
      if (!res.success || !res.data) {
        toast.error(res.message);
        return;
      }
      setResultado(res.data);
      if (res.data.enlaceWhatsApp) {
        window.open(res.data.enlaceWhatsApp, "_blank", "noopener,noreferrer");
      }
      toast.success(res.message);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "No se pudo preparar el envío por WhatsApp";
      toast.error(msg);
    } finally {
      setPreparando(false);
    }
  };

  const marcarEnviado = async () => {
    if (!resultado?.envioId) return;
    const res = await marcarEnviadoWhatsAppAction({ envioId: resultado.envioId });
    if (res.success) {
      setMarcado(true);
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  const handleOpenChange = (o: boolean) => {
    if (!o && !preparando) {
      setResultado(null);
      setMarcado(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="size-4" />
            Enviar {comprobante} por WhatsApp
          </DialogTitle>
          <DialogDescription>
            Genera el PDF y abre WhatsApp con el mensaje listo para enviar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="telefono-whatsapp">Número (WhatsApp)</Label>
            <Input
              id="telefono-whatsapp"
              type="tel"
              placeholder="9XXXXXXXX"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              disabled={preparando || !!resultado}
            />
            <p className="text-[11px] text-muted-foreground">
              Si el número no incluye el código de país, se asume Perú (+51).
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mensaje-whatsapp">Mensaje</Label>
            <Textarea
              id="mensaje-whatsapp"
              rows={6}
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              disabled={preparando || !!resultado}
            />
          </div>

          {resultado ? (
            <div className="space-y-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
              <div className="flex items-center gap-2">
                {marcado ? (
                  <>
                    <CheckCircle2 className="size-4" />
                    Envío marcado como realizado
                  </>
                ) : (
                  <>
                    <ExternalLink className="size-4" />
                    WhatsApp abierto en una pestaña nueva
                  </>
                )}
              </div>
              <p className="text-xs text-emerald-700/80 dark:text-emerald-300/70">
                Adjunta el PDF descargado en la conversación para completar el envío.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              Modo local: el navegador no puede adjuntar archivos a WhatsApp Web
              automáticamente. Se abrirá WhatsApp con el mensaje y podrás descargar el
              PDF para adjuntarlo.
            </div>
          )}
        </div>

        <Separator />

        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          {resultado ? (
            <>
              <Button variant="outline" onClick={marcarEnviado} disabled={marcado}>
                <CheckCircle2 className="size-4" />
                {marcado ? "Enviado" : "Marcar como enviado"}
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (resultado.pdfDescargaUrl) {
                      const a = document.createElement("a");
                      a.href = resultado.pdfDescargaUrl;
                      a.setAttribute("download", "");
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                    }
                  }}
                >
                  <FileDown className="size-4" />
                  Descargar PDF
                </Button>
                <Button onClick={() => handleOpenChange(false)}>
                  Cerrar
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={preparando}>
                Cancelar
              </Button>
              <Button
                onClick={() => void preparar()}
                disabled={preparando || !telefono.replace(/\D/g, "").trim()}
                className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {preparando ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Preparando...
                  </>
                ) : (
                  <>
                    <Phone className="size-4" />
                    Abrir WhatsApp
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}