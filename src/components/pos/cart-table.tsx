"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { calcularLinea, formatearNumero } from "@/lib/pos/calculations";
import type { CartItem } from "@/components/pos/pos-types";

interface Props {
  cart: CartItem[];
  onChangeCantidad: (productoId: string, cantidad: number) => void;
  onChangePrecio: (productoId: string, precio: number) => void;
  onRemove: (productoId: string) => void;
  onLimpiar: () => void;
}

const CANTIDAD_RE = /^\d+$/;
const PRECIO_RE = /^\d*\.?\d*$/;

function EditableCell({
  campo,
  item,
  texto,
  onTexto,
  onConfirmar,
  onFinalizar,
  className,
}: {
  campo: "cantidad" | "precio";
  item: CartItem;
  texto: string;
  onTexto: (texto: string) => void;
  onConfirmar: (productoId: string, valor: number) => void;
  onFinalizar: () => void;
  className: string;
}) {
  const esCantidad = campo === "cantidad";
  const esValido = (t: string) => {
    const n = Number(t);
    return esCantidad
      ? CANTIDAD_RE.test(t) && n >= 1
      : PRECIO_RE.test(t) && t !== "." && t !== "" && n >= 0;
  };
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = e.target.value;
    onTexto(t);
    if (esValido(t)) onConfirmar(item.productoId, Number(t));
  };

  return (
    <Input
      type="text"
      inputMode={esCantidad ? "numeric" : "decimal"}
      autoComplete="off"
      aria-label={`${esCantidad ? "Cantidad" : "Precio"} de ${item.descripcion}`}
      className={className}
      value={texto}
      onChange={onChange}
      onFocus={() => onTexto(String(item[esCantidad ? "cantidad" : "precio"]))}
      onBlur={() => onFinalizar()}
    />
  );
}

export function CartTable({
  cart,
  onChangeCantidad,
  onChangePrecio,
  onRemove,
  onLimpiar,
}: Props) {
  const [editando, setEditando] = useState<{
    campo: "cantidad" | "precio";
    productoId: string;
    texto: string;
  } | null>(null);

  const activo = (campo: "cantidad" | "precio", productoId: string) =>
    editando?.campo === campo && editando.productoId === productoId;

  const textoDe = (campo: "cantidad" | "precio", item: CartItem) => {
    if (activo(campo, item.productoId)) return editando!.texto;
    const v = campo === "cantidad" ? item.cantidad : item.precio;
    return Number.isFinite(v) ? String(v) : "";
  };

  const setTexto = (
    campo: "cantidad" | "precio",
    productoId: string,
    texto: string,
  ) =>
    setEditando(p =>
      p && p.campo === campo && p.productoId === productoId
        ? { ...p, texto }
        : p,
    );

  const finalizar = (campo: "cantidad" | "precio", productoId: string) =>
    setEditando(p =>
      p && p.campo === campo && p.productoId === productoId ? null : p,
    );

  if (cart.length === 0) {
    return (
      <div className="h-[340px] overflow-auto">
        <table className="w-full min-w-[620px] text-sm border-separate border-spacing-0">
          <thead>
            <tr className="text-left text-[10px] font-bold uppercase tracking-wider text-white">
              <th className="sticky top-0 z-10 bg-pos-tableheader w-0 px-2 py-2.5 text-center">
                #
              </th>
              <th className="sticky top-0 z-10 bg-pos-tableheader w-2 px-3 py-2.5">
                PRODUCTO
              </th>
              <th className="sticky top-0 z-10 bg-pos-tableheader w-24 px-3 py-2.5 text-center">
                U. MEDIDA
              </th>
              <th className="sticky top-0 z-10 bg-pos-tableheader w-20 px-3 py-2.5 text-right">
                PRECIO
              </th>
              <th className="sticky top-0 z-10 bg-pos-tableheader w-28 px-3 py-2.5 text-center">
                CANTIDAD
              </th>
              <th className="sticky top-0 z-10 bg-pos-tableheader w-24 px-3 py-2.5 text-right">
                SUBTOTAL
              </th>
              <th className="sticky top-0 z-10 bg-pos-tableheader w-20 px-3 py-2.5 text-right">
                IGV
              </th>
              <th className="sticky top-0 z-10 bg-pos-tableheader w-24 px-3 py-2.5 text-right">
                IMPORTE
              </th>
              <th className="sticky top-0 z-10 bg-pos-tableheader w-10 px-2 py-2.5" />
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                colSpan={9}
                className="h-60 px-3 py-2 text-center text-xs text-muted-foreground">
                <div className="flex h-72 flex-col items-center justify-center gap-3 bg-transparent text-center">
                  <div className="flex size-16 items-center justify-center rounded-full bg-muted">
                    <ShoppingCart className="h-7 w-7 text-muted-foreground/70" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-semibold text-foreground">
                      No hay productos agregados
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Busca un producto arriba o abre el catálogo para comenzar
                      a cotizar.
                    </p>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
  return (
    <div className="h-[340px] overflow-auto">
      <table className="w-full min-w-[620px] text-sm border-separateque border-spacing-0">
        <thead>
          <tr className="text-left text-[10px] font-bold uppercase tracking-wider text-white">
            <th className="sticky top-0 z-10 bg-pos-tableheader w-0 px-2 py-2.5 text-center">
              #
            </th>
            <th className="sticky top-0 z-10 bg-pos-tableheader w-2 px-3 py-2.5">
              PRODUCTO
            </th>
            <th className="sticky top-0 z-10 bg-pos-tableheader w-24 px-3 py-2.5 text-center">
              U. MEDIDA
            </th>
            <th className="sticky top-0 z-10 bg-pos-tableheader w-20 px-3 py-2.5 text-right">
              PRECIO
            </th>
            <th className="sticky top-0 z-10 bg-pos-tableheader w-28 px-3 py-2.5 text-center">
              CANTIDAD
            </th>
            <th className="sticky top-0 z-10 bg-pos-tableheader w-24 px-3 py-2.5 text-right">
              SUBTOTAL
            </th>
            <th className="sticky top-0 z-10 bg-pos-tableheader w-20 px-3 py-2.5 text-right">
              IGV
            </th>
            <th className="sticky top-0 z-10 bg-pos-tableheader w-24 px-3 py-2.5 text-right">
              IMPORTE
            </th>
            <th className="sticky top-0 z-10 bg-pos-tableheader w-10 px-2 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {cart.map((item, idx) => {
            const linea = calcularLinea(item.precio, item.cantidad);
            return (
              <tr
                key={item.productoId}
                className={`border-b border-pos-border/60 transition-colors hover:bg-pos-table-row-hover ${
                  idx % 2 === 0 ? "bg-pos-card" : "bg-pos-soft/40"
                }`}>
                <td className="px-2 py-2 text-center text-xs font-bold text-muted-foreground/70">
                  {idx + 1}
                </td>
                <td className="px-3 py-2">
                  <div className="font-semibold leading-tight">
                    {item.descripcion}
                  </div>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="inline-flex items-center rounded-md bg-pos-blue/10 px-2 py-0.5 text-[10px] font-bold uppercase text-pos-blue-light">
                    {item.unidadMedida}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-end">
                    <EditableCell
                      campo="precio"
                      item={item}
                      texto={textoDe("precio", item)}
                      onTexto={t => setTexto("precio", item.productoId, t)}
                      onConfirmar={onChangePrecio}
                      onFinalizar={() => finalizar("precio", item.productoId)}
                      className="h-7 w-20 rounded-md border-pos-input-border bg-pos-input text-right text-xs tabular-nums"
                    />
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-center gap-0.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      disabled={item.cantidad <= 1}
                      onClick={() =>
                        onChangeCantidad(item.productoId, item.cantidad - 1)
                      }
                      className="size-6">
                      <Minus className="size-3" />
                    </Button>
                    <EditableCell
                      campo="cantidad"
                      item={item}
                      texto={textoDe("cantidad", item)}
                      onTexto={t => setTexto("cantidad", item.productoId, t)}
                      onConfirmar={onChangeCantidad}
                      onFinalizar={() => finalizar("cantidad", item.productoId)}
                      className="h-7 w-14 rounded-md border-pos-input-border bg-pos-input text-center text-xs font-bold tabular-nums"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      onClick={() =>
                        onChangeCantidad(item.productoId, item.cantidad + 1)
                      }
                      className="size-6">
                      <Plus className="size-3" />
                    </Button>
                  </div>
                </td>
                <td className="px-3 py-2 text-right text-xs tabular-nums text-muted-foreground">
                  S/ {formatearNumero(linea.base)}
                </td>
                <td className="px-3 py-2 text-right text-xs tabular-nums text-pos-blue-light">
                  S/ {formatearNumero(linea.igv)}
                </td>
                <td className="px-3 py-2 text-right text-xs font-bold tabular-nums text-pos-blue-light">
                  S/ {formatearNumero(linea.importe)}
                </td>
                <td className="px-2 py-2 text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="size-6 text-destructive/60 hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => onRemove(item.productoId)}>
                    <Trash2 className="size-3" />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
