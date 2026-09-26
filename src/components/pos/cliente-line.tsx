"use client";

import { useRef } from "react";
import { toast } from "sonner";
import { UserPlus, Users, Eraser } from "lucide-react";

import { consultarDocumentoPos } from "@/actions/pos.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Etiqueta } from "@/components/pos/pos-ui";

interface Props {
  cliente: ClienteSeleccionado;
  onChange: (cliente: ClienteSeleccionado) => void;
  onLimpiar: () => void;
  onAbrirNuevo: () => void;
  onAbrirDirectorio: () => void;
}

export function ClienteLine({
  cliente,
  onChange,
  onLimpiar,
  onAbrirNuevo,
  onAbrirDirectorio,
}: Props) {
  const consultandoRef = useRef(false);

  const longitudDocumento =
    cliente.tipoDocumento === "RUC"
      ? 11
      : cliente.tipoDocumento === "DNI"
        ? 8
        : cliente.tipoDocumento === "CE"
          ? 12
          : 15;

  const consultarDocumento = async () => {
    const numero = cliente.numeroDocumento.trim();
    if (!numero) {
      toast.error("Ingrese un número de documento para consultar");
      return;
    }
    const tipo = cliente.tipoDocumento === "RUC" ? "RUC" : "DNI";
    if (tipo === "DNI" && !/^\d{8}$/.test(numero)) {
      toast.error("El DNI debe tener 8 dígitos");
      return;
    }
    if (tipo === "RUC" && !/^\d{11}$/.test(numero)) {
      toast.error("El RUC debe tener 11 dígitos");
      return;
    }
    consultandoRef.current = true;
    try {
      const res = await consultarDocumentoPos({ tipo, numero });
      if (res.cliente) {
        onChange({
          id: res.cliente.id,
          tipoDocumento: res.cliente.tipoDocumento,
          numeroDocumento: res.cliente.numeroDocumento,
          razonSocial: res.cliente.razonSocial,
          direccion: res.cliente.direccion,
          telefono: res.cliente.telefono,
          email: res.cliente.email,
        });
        toast.success("Cliente encontrado en el sistema.");
      } else if (res.success && res.persona) {
        onChange({
          ...cliente,
          razonSocial:
            res.persona.razonSocial ??
            res.persona.nombre ??
            cliente.razonSocial,
          direccion: res.persona.direccion ?? cliente.direccion,
        });
        toast.success("Datos obtenidos correctamente.");
      } else {
        toast.warning(
          "No se encontraron datos. Complete los datos manualmente y presione el botón de guardar.",
          { duration: 6000 },
        );
      }
    } finally {
      consultandoRef.current = false;
    }
  };

  return (
    <div className="grid grid-cols-1 items-end gap-2 sm:grid-cols-[8.5rem_10rem_minmax(0,1fr)_minmax(0,1fr)_auto]">
      <div className="flex min-w-0 flex-col gap-1">
        <Etiqueta>Tipo Documento</Etiqueta>
        <Select
          value={cliente.tipoDocumento}
          onValueChange={v =>
            onChange({
              ...cliente,
              tipoDocumento: (v ?? "DNI") as TipoDocumento,
            })
          }>
          <SelectTrigger className="w-full bg-input border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(TIPO_DOCUMENTO_LABEL) as TipoDocumento[]).map(t => (
              <SelectItem key={t} value={t}>
                {TIPO_DOCUMENTO_LABEL[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <Etiqueta>N° Documento</Etiqueta>
        <Input
          className="w-full bg-input border-border font-mono tracking-wider"
          placeholder="RUC / DNI"
          inputMode="numeric"
          maxLength={longitudDocumento}
          value={cliente.numeroDocumento}
          onChange={e =>
            onChange({
              ...cliente,
              numeroDocumento: e.target.value
                .replace(/\D/g, "")
                .slice(0, longitudDocumento),
            })
          }
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault();
              void consultarDocumento();
            }
          }}
        />
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <Etiqueta>Nombre / Razón Social</Etiqueta>
        <Input
          className="min-w-0 bg-input border-border"
          placeholder="Nombre / Razón Social"
          value={cliente.razonSocial}
          onChange={e => onChange({ ...cliente, razonSocial: e.target.value })}
        />
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <Etiqueta>Dirección</Etiqueta>
        <Input
          className="min-w-0 bg-input border-border"
          placeholder="Dirección Fiscal / Domicilio"
          value={cliente.direccion}
          onChange={e => onChange({ ...cliente, direccion: e.target.value })}
        />
      </div>
      <div className="flex items-end gap-1.5 pb-px">
        <Button
          type="button"
          variant="outline"
          size="icon"
          title="Registrar nuevo cliente"
          onClick={onAbrirNuevo}
          className="border-primary/30 hover:border-primary hover:text-primary">
          <UserPlus className="size-4" />
        </Button>
        
        <Button
          type="button"
          variant="outline"
          size="icon"
          title="Directorio de clientes"
          onClick={onAbrirDirectorio}
          className="border-primary/30 hover:border-primary hover:text-primary">
          <Users className="size-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          title="Limpiar datos del cliente"
          onClick={onLimpiar}
          className="border-rose-600 hover:border-rose-600 hover:text-rose-600">
          <Eraser className="size-4" />
        </Button>
      </div>
    </div>
  );
}
