"use client";

import { useState } from "react";
import { toast } from "sonner";
import { UserPlus, Loader2, Search } from "lucide-react";

import { guardarClientePos, consultarDocumentoPos } from "@/actions/pos.actions";
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
import {
  TIPO_DOCUMENTO_LABEL,
  type ClienteSeleccionado,
  type TipoDocumento,
} from "@/components/pos/pos-types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClienteGuardado: (cliente: ClienteSeleccionado) => void;
}

export function NuevoClienteDialog({ open, onOpenChange, onClienteGuardado }: Props) {
  const [tipoDocumento, setTipoDocumento] = useState<TipoDocumento>("DNI");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [razonSocial, setRazonSocial] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [consultando, setConsultando] = useState(false);

  const consultar = async () => {
    if (!numeroDocumento.trim()) {
      toast.error("Ingrese el número de documento");
      return;
    }
    setConsultando(true);
    try {
      const res = await consultarDocumentoPos({
        tipo: tipoDocumento === "RUC" ? "RUC" : "DNI",
        numero: numeroDocumento.trim(),
      });
      if (res.cliente) {
        setRazonSocial(res.cliente.razonSocial);
        setDireccion(res.cliente.direccion);
        setTelefono(res.cliente.telefono);
        setEmail(res.cliente.email);
        toast.success("El cliente ya existe en el sistema.");
      } else if (res.success && res.persona) {
        setRazonSocial(res.persona.razonSocial ?? res.persona.nombre ?? "");
        setDireccion(res.persona.direccion ?? "");
        toast.success("Datos obtenidos de la entidad.");
      } else {
        toast.error("No se pudo consultar la entidad, complete los datos manualmente.");
      }
    } finally {
      setConsultando(false);
    }
  };

  const guardar = async () => {
    if (!razonSocial.trim()) {
      toast.error("La razón social o nombre es obligatorio");
      return;
    }
    setGuardando(true);
    try {
      const cliente = await guardarClientePos({
        tipoDocumento,
        numeroDocumento: numeroDocumento.trim(),
        razonSocial,
        direccion,
        telefono,
        email,
      });
      toast.success("Cliente registrado correctamente");
      onClienteGuardado({
        id: cliente.id,
        tipoDocumento: cliente.tipoDocumento as TipoDocumento,
        numeroDocumento: cliente.numeroDocumento,
        razonSocial: cliente.razonSocial,
        direccion: cliente.direccion,
        telefono: cliente.telefono,
        email: cliente.email,
      });
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar el cliente");
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
            Nuevo cliente
          </DialogTitle>
          <DialogDescription>
            Complete los datos del cliente o consúltelos automáticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
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
              <Label className="text-xs">Nº documento</Label>
              <div className="flex gap-1.5">
                <Input
                  value={numeroDocumento}
                  onChange={(e) => setNumeroDocumento(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void consultar();
                    }
                  }}
                  placeholder="Ej. 20123456789"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  title="Consultar"
                  disabled={consultando}
                  onClick={() => void consultar()}
                >
                  {consultando ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Search className="size-4" />
                  )}
                </Button>
              </div>
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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={guardando}>
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