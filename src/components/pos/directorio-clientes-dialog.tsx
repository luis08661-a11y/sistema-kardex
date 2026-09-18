"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, Users, Loader2, X } from "lucide-react";

import { buscarClientesDirectorio } from "@/actions/pos.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  TIPO_DOCUMENTO_LABEL,
  type ClienteSeleccionado,
  type TipoDocumento,
} from "@/components/pos/pos-types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSeleccion: (cliente: ClienteSeleccionado) => void;
}

export function DirectorioClientesDialog({ open, onOpenChange, onSeleccion }: Props) {
  const [q, setQ] = useState("");
  const [clientes, setClientes] = useState<ClienteSeleccionado[]>([]);
  const [cargando, setCargando] = useState(false);

  const cargar = useCallback(async (filtro: string) => {
    setCargando(true);
    try {
      const res = await buscarClientesDirectorio({ q: filtro });
      setClientes(res);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => void cargar(q), 300);
    return () => window.clearTimeout(timer);
  }, [open, q, cargar]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl! overflow-hidden">
        <div className="-mx-4 -mt-4 mb-1 flex items-center justify-between gap-3 bg-[#111827] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Users className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-white">
                Directorio de clientes
              </DialogTitle>
              <DialogDescription className="text-xs text-white/60">
                Busque y seleccione un cliente registrado.
              </DialogDescription>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onOpenChange(false)}
            className="shrink-0 text-white hover:bg-white/10 hover:text-white"
            aria-label="Cerrar"
          >
            <X />
          </Button>
        </div>

        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Buscar por nombre, DNI/RUC o teléfono..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="mt-3 max-h-96 overflow-y-auto rounded-lg border">
          {cargando && clientes.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
            </div>
          ) : clientes.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
              No se encontraron clientes.
            </div>
          ) : (
            <ul className="divide-y">
              {clientes.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-muted"
                    onClick={() => onSeleccion(c)}
                  >
                    <div className="min-w-0">
                      <div className="truncate font-semibold">{c.razonSocial}</div>
                      <div className="text-xs text-muted-foreground">
                        {TIPO_DOCUMENTO_LABEL[c.tipoDocumento as TipoDocumento]} · {c.numeroDocumento}
                        {c.telefono ? ` · ${c.telefono}` : ""}
                      </div>
                    </div>
                    {c.direccion && (
                      <span className="hidden truncate text-xs text-muted-foreground sm:block sm:max-w-52">
                        {c.direccion}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}