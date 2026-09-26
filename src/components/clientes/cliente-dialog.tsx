"use client";

import { useState } from "react";
import { toast } from "sonner";
import { UserPlus, Pencil, Loader2 } from "lucide-react";

import { guardarCliente } from "@/actions/cliente.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CampoFormulario } from "@/components/shared/modulo-cabecera";
import { SelectTipoDocumento } from "@/components/shared/select-tipo-documento";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { TipoDocumento } from "@/components/ventas/types";
import type { ClienteDTO } from "@/lib/services/cliente.service";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente: ClienteDTO | null;
  onGuardado: (cliente: ClienteDTO) => void;
}

export function ClienteDialog({ open, onOpenChange, cliente, onGuardado }: Props) {
  const editando = cliente !== null;
  const [tipoDocumento, setTipoDocumento] = useState<TipoDocumento>(
    (cliente?.tipoDocumento as TipoDocumento) ?? "DNI",
  );
  const [numeroDocumento, setNumeroDocumento] = useState(cliente?.numeroDocumento ?? "");
  const [razonSocial, setRazonSocial] = useState(cliente?.razonSocial ?? "");
  const [direccion, setDireccion] = useState(cliente?.direccion ?? "");
  const [telefono, setTelefono] = useState(cliente?.telefono ?? "");
  const [email, setEmail] = useState(cliente?.email ?? "");
  const [activo, setActivo] = useState(cliente?.activo ?? true);
  const [guardando, setGuardando] = useState(false);

  const guardar = async () => {
    if (!razonSocial.trim()) {
      toast.error("La razón social o nombre es obligatorio");
      return;
    }
    if (!numeroDocumento.trim()) {
      toast.error("El número de documento es obligatorio");
      return;
    }
    setGuardando(true);
    try {
      const res = await guardarCliente({
        id: cliente?.id ?? "",
        tipoDocumento,
        numeroDocumento,
        razonSocial,
        direccion,
        telefono,
        email,
        activo,
      });
      if (res.success && res.data) {
        toast.success(res.message);
        onGuardado(res.data);
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
            {editando ? (
              <>
                <Pencil className="size-4" />
                Editar cliente
              </>
            ) : (
              <>
                <UserPlus className="size-4" />
                Registrar nuevo cliente
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {editando
              ? "Actualice los datos del cliente."
              : "Complete los datos del cliente para asociarlo a los comprobantes."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <SelectTipoDocumento value={tipoDocumento} onValueChange={setTipoDocumento} />
            <CampoFormulario label="Nº documento *">
              <Input
                value={numeroDocumento}
                onChange={(e) => setNumeroDocumento(e.target.value)}
                placeholder="Ej. 20123456789"
              />
            </CampoFormulario>
          </div>

          <CampoFormulario label="Razón social / Nombre *">
            <Input
              value={razonSocial}
              onChange={(e) => setRazonSocial(e.target.value)}
              placeholder="Nombre del cliente"
            />
          </CampoFormulario>

          <CampoFormulario label="Dirección">
            <Input
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Dirección (opcional)"
            />
          </CampoFormulario>

          <div className="grid grid-cols-2 gap-3">
            <CampoFormulario label="Teléfono">
              <Input
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Ej. 999 888 777"
              />
            </CampoFormulario>
            <CampoFormulario label="Email">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
              />
            </CampoFormulario>
          </div>

          {editando && (
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={activo} onCheckedChange={(v) => setActivo(!!v)} />
              Cliente activo (disponible para ventas)
            </label>
          )}
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
            ) : editando ? (
              "Guardar cambios"
            ) : (
              "Registrar cliente"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}