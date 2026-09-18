"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Mail, FileCheck2, ExternalLink } from "lucide-react";

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
import { enviarVentaPorCorreoAction } from "@/actions/venta-envio.actions";

interface Props {
  venta: VentaParaImprimir;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EnviarCorreoDialog({ venta, open, onOpenChange }: Props) {
  const [destino, setDestino] = useState(() => venta.cliente?.email ?? "");
  const [mensaje, setMensaje] = useState(() => armarMensajeVenta(venta));
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const comprobante = `${TIPO_COMPROBANTE_LABEL[venta.tipoComprobante as TipoComprobante]} ${venta.serie}-${String(venta.numero).padStart(6, "0")}`;

  const enviar = async () => {
    setEnviando(true);
    try {
      const res = await enviarVentaPorCorreoAction({
        ventaId: venta.id,
        destino,
        mensaje,
      });
      if (res.success) {
        setEnviado(true);
        toast.success("Comprobante enviado por correo");
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("No se pudo enviar el correo");
    } finally {
      setEnviando(false);
    }
  };

  const handleOpenChange = (o: boolean) => {
    if (!o && !enviando) {
      setEnviado(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="size-4" />
            Enviar {comprobante} por correo
          </DialogTitle>
          <DialogDescription>
            El comprobante en PDF se adjuntará automáticamente.
          </DialogDescription>
        </DialogHeader>

        {enviado ? (
          <div className="space-y-3 py-2">
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
              <FileCheck2 className="size-4 shrink-0" />
              Correo enviado a <span className="font-semibold">{destino}</span>
            </div>
            {venta.cliente?.email && destino !== venta.cliente.email && (
              <div className="text-xs text-muted-foreground">
                Se envió a una dirección distinta del correo registrado del cliente.
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="destino-correo">Destinatario</Label>
              <Input
                id="destino-correo"
                type="email"
                placeholder="cliente@correo.com"
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                disabled={enviando}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mensaje-correo">Mensaje</Label>
              <Textarea
                id="mensaje-correo"
                rows={6}
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                disabled={enviando}
              />
            </div>
            <div className="rounded-lg border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              El PDF se genera y adjunta al momento de enviar. Debe configurar las
              variables MAIL_* en el archivo .env para habilitar SMTP.
            </div>
          </div>
        )}

        <Separator />

        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          {enviado ? (
            <>
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                Cerrar
              </Button>
              <Button
                onClick={() => window.open(`/api/ventas/${venta.id}/pdf`, "_blank")}
                className="gap-2"
              >
                <ExternalLink className="size-4" />
                Ver PDF
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={enviando}>
                Cancelar
              </Button>
              <Button
                onClick={() => void enviar()}
                disabled={enviando || !destino.trim()}
                className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {enviando ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="size-4" />
                    Enviar correo
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