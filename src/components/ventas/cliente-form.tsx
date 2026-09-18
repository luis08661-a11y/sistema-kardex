"use client";

import { useState } from "react";
import { toast } from "sonner";
import { UserPlus, Loader2 } from "lucide-react";

import { guardarCliente } from "@/actions/cliente.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TIPO_DOCUMENTO_LABEL, type TipoDocumento } from "@/components/ventas/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: { tipoDocumento: TipoDocumento; numeroDocumento: string } | null;
  onGuardado: (cliente: { id: string; tipoDocumento: string; numeroDocumento: string; razonSocial: string; direccion: string; telefono: string; email: string }) => void;
}

export function ClienteForm({ open, onOpenChange, initial, onGuardado }: Props) {
  const [tipoDocumento, setTipoDocumento] = useState<TipoDocumento>(
    initial?.tipoDocumento ?? "DNI",
  );
  const [numeroDocumento, setNumeroDocumento] = useState(initial?.numeroDocumento ?? "");
  const [razonSocial, setRazonSocial] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [guardando, setGuardando] = useState(false);

  const guardar = async () => {
    setGuardando(true);
    try {
      const res = await guardarCliente({
        tipoDocumento,
        numeroDocumento,
        razonSocial,
        direccion,
        telefono,
        email,
      });
      if (res.success && res.data) {
        toast.success(res.message);
        onGuardado({
          id: res.data.id,
          tipoDocumento: res.data.tipoDocumento,
          numeroDocumento: res.data.numeroDocumento,
          razonSocial: res.data.razonSocial,
          direccion: res.data.direccion ?? "",
          telefono: res.data.telefono ?? "",
          email: res.data.email ?? "",
        });
        onOpenChange(false);
      } else {
        toast.error(res.message);
      }
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-120!">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="size-4" />
            Registrar nuevo cliente
          </DialogTitle>
          <DialogDescription>
            Complete los datos del cliente para asociarlo al comprobante.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Tipo documento</Label>
              <Select
                value={tipoDocumento}
                onValueChange={(v) => setTipoDocumento((v ?? "DNI") as TipoDocumento)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(TIPO_DOCUMENTO_LABEL) as TipoDocumento[]).map((t) => (
                    <SelectItem key={t} value={t}>
                      {TIPO_DOCUMENTO_LABEL[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Nº documento *</Label>
              <Input
                value={numeroDocumento}
                onChange={(e) => setNumeroDocumento(e.target.value)}
                placeholder="Ej. 20123456789"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Razón social / Nombre *</Label>
            <Input
              value={razonSocial}
              onChange={(e) => setRazonSocial(e.target.value)}
              placeholder="Nombre del cliente"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Dirección</Label>
            <Input
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Dirección (opcional)"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Teléfono</Label>
              <Input
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Ej. 999 888 777"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={guardando}
          >
            Cancelar
          </Button>
          <Button onClick={() => void guardar()} disabled={guardando}>
            {guardando ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Registrar cliente"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}