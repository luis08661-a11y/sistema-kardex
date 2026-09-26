"use client"

import { useMemo } from "react"

import type { ProductoConLotes } from "./kardex-types"

type LoteFila = {
  id: string
  codigo: string
  fechaIngreso: Date | null
  almacenamiento: string | null
  movimientos: number
  productoCodigo: string
  productoDescripcion: string
}

export function useLotesAplanados(productos: ProductoConLotes[]): LoteFila[] {
  return useMemo(
    () =>
      productos.flatMap((p) =>
        p.lotesBase.map((l) => ({
          id: l.id,
          codigo: l.codigo,
          fechaIngreso: l.fechaIngreso,
          almacenamiento: l.almacenamiento?.nombre ?? null,
          movimientos: l._count.movimientos,
          productoCodigo: p.codigo,
          productoDescripcion: p.descripcion,
        }))
      ),
    [productos]
  )
}
