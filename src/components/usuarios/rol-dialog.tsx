"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Pencil, ShieldPlus } from "lucide-react";

import { crearRolAction, actualizarRolAction } from "@/actions/usuarios.actions";
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

type Rol = {
  id: string;
  name: string;
  description: string | null;
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rol?: Rol | null;
}

function RolDialogInner({ open, onOpenChange, rol }: Props) {
  const editando = rol !== null && rol !== undefined;
  const [guardando, setGuardando] = useState(false);

  const [state, formAction, isPending] = useActionState(
    editando
      ? (prev: { success: boolean; message: string }, formData: FormData) =>
          actualizarRolAction(rol!.id, prev, formData)
      : crearRolAction,
    { success: false, message: "" },
  );

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      onOpenChange(false);
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, onOpenChange]);

  useEffect(() => {
    setGuardando(isPending);
  }, [isPending]);

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          {editando ? <Pencil className="size-4" /> : <ShieldPlus className="size-4" />}
          {editando ? "Editar rol" : "Nuevo rol"}
        </DialogTitle>
        <DialogDescription>
          {editando ? "Modifique los datos del rol." : "Complete los datos para crear un rol."}
        </DialogDescription>
      </DialogHeader>

      <form action={formAction} className="grid gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Nombre del rol *</Label>
          <Input name="name" defaultValue={rol?.name} required minLength={2} maxLength={50} placeholder="Ej. ADMINISTRADOR" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Descripción</Label>
          <Input name="description" defaultValue={rol?.description ?? ""} maxLength={200} placeholder="Descripción opcional" />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={guardando}>
            Cancelar
          </Button>
          <Button type="submit" disabled={guardando}>
            {guardando ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Guardando...
              </>
            ) : editando ? (
              "Guardar cambios"
            ) : (
              "Crear rol"
            )}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

export function RolDialog({ open, onOpenChange, rol }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && <RolDialogInner open={open} onOpenChange={onOpenChange} rol={rol} />}
    </Dialog>
  );
}
