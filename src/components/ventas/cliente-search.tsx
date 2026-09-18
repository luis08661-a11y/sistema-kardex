"use client";

import { useState } from "react";
import { Search, UserPlus, Loader2, UserX, ArrowRight } from "lucide-react";

import { buscarClientes } from "@/actions/cliente.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ClienteDTO } from "@/lib/services/cliente.service";
import {
  TIPO_DOCUMENTO_LABEL,
  type ClienteSeleccionado,
  type TipoDocumento,
} from "@/components/ventas/types";

interface Props {
  cliente: ClienteSeleccionado | null;
  onSeleccionar: (cliente: ClienteSeleccionado) => void;
  onLimpiar: () => void;
  onNuevo: (prefijo: { tipoDocumento: TipoDocumento; numeroDocumento: string }) => void;
}

export function ClienteSearch({ cliente, onSeleccionar, onLimpiar, onNuevo }: Props) {
  const [doc, setDoc] = useState("");
  const [resultados, setResultados] = useState<ClienteDTO[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [buscado, setBuscado] = useState(false);

  const consultar = async () => {
    const d = doc.trim();
    if (!d) return;
    setBuscando(true);
    setBuscado(false);
    setResultados([]);
    try {
      const res = await buscarClientes(d);
      setResultados(res);
      if (res.length === 1 && res[0].numeroDocumento === d) {
        onSeleccionarDesdeDto(res[0]);
      }
    } finally {
      setBuscando(false);
      setBuscado(true);
    }
  };

  const onSeleccionarDesdeDto = (c: ClienteDTO) => {
    onSeleccionar({
      id: c.id,
      tipoDocumento: c.tipoDocumento as TipoDocumento,
      numeroDocumento: c.numeroDocumento,
      razonSocial: c.razonSocial,
      direccion: c.direccion ?? "",
      telefono: c.telefono ?? "",
      email: c.email ?? "",
    });
    setResultados([]);
    setDoc("");
  };

  if (cliente) {
    return (
      <div className="space-y-3">
        <Campo label="RUC / DNI / Cédula">
          <Input
            readOnly
            value={`${TIPO_DOCUMENTO_LABEL[cliente.tipoDocumento]} · ${cliente.numeroDocumento}`}
            className="bg-muted/50 font-mono"
          />
        </Campo>
        <Campo label="Razón Social / Nombre">
          <Input readOnly value={cliente.razonSocial} className="bg-muted/50 font-medium" />
        </Campo>
        <Campo label="Dirección">
          <Input readOnly value={cliente.direccion || "—"} className="bg-muted/50" />
        </Campo>
        <Button type="button" variant="outline" size="xs" onClick={onLimpiar} className="gap-1.5">
          <ArrowRight className="size-3" />
          Cambiar cliente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Campo label="RUC / DNI / Cédula">
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-8 pr-9"
              placeholder="Ingrese Nº de documento..."
              value={doc}
              onChange={(e) => {
                setDoc(e.target.value);
                setBuscado(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void consultar();
                }
              }}
            />
            {buscando && (
              <Loader2 className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </div>
          <Button
            type="button"
            onClick={() => void consultar()}
            disabled={buscando}
            className="shrink-0 gap-1.5 bg-slate-900 text-white hover:bg-slate-800"
          >
            <Search className="size-3.5" />
            Consultar
          </Button>
        </div>
      </Campo>

      {buscado && !buscando && resultados.length === 0 && (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
          <div className="flex items-center gap-2 text-xs text-amber-700">
            <UserX className="size-4" />
            <span>
              No se encontró un cliente con «{doc}». Puede registrarlo.
            </span>
          </div>
          <Button
            type="button"
            size="xs"
            variant="outline"
            onClick={() => {
              const esRuc = /^\d{11}$/.test(doc);
              const esDni = /^\d{8}$/.test(doc);
              onNuevo({
                tipoDocumento: esRuc ? "RUC" : esDni ? "DNI" : "DNI",
                numeroDocumento: doc,
              });
              setBuscado(false);
            }}
          >
            <UserPlus className="size-3.5" />
            Nuevo cliente
          </Button>
        </div>
      )}

      {resultados.length > 0 && (
        <div className="max-h-48 overflow-y-auto rounded-lg border">
          {resultados.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onSeleccionarDesdeDto(c)}
              className="flex w-full items-center justify-between gap-2 border-b px-3 py-2 text-left transition-colors last:border-0 hover:bg-muted/50"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{c.razonSocial}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {TIPO_DOCUMENTO_LABEL[c.tipoDocumento as TipoDocumento]} ·{" "}
                  {c.numeroDocumento}
                </p>
              </div>
              <span className="text-xs font-medium text-blue-600">Seleccionar</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}