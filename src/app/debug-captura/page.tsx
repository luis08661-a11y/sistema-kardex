"use client";

import { useCallback, useState } from "react";
import { VentaPrint } from "@/components/ventas/venta-print";
import type { VentaParaImprimir } from "@/components/ventas/types";

const venta: VentaParaImprimir = {
  id: "test-1",
  tipoComprobante: "NOTA_DE_VENTA",
  serie: "NV01",
  numero: 3,
  fecha: new Date("2026-09-24T10:30:00"),
  empresa: {
    id: "emp-1",
    ruc: "20123456789",
    razonSocial: "DELUX PERÚ S.A.C.",
    web: "www.delux.pe",
    email: "ventas@delux.pe",
  },
  cliente: {
    id: "cli-1",
    razonSocial: "JUAN PÉREZ GÓMEZ",
    tipoDocumento: "DNI",
    numeroDocumento: "45678912",
    direccion: "Av. Los Eucaliptos 123, Ate",
    telefono: "987654321",
    email: "juan@example.com",
  },
  formaPago: "CONTADO",
  metodoPago: "YAPE",
  subtotal: 124,
  opGravada: 124,
  opExonerada: 0,
  opInafecta: 0,
  igv: 22.32,
  total: 146.32,
  estado: "CONFIRMADA",
  detalles: [
    { codigo: "PRD-0001", descripcion: "Producto de prueba número 1", cantidad: 2, precioUnitario: 15.5, subtotal: 31, importe: 31 },
    { codigo: "PRD-0002", descripcion: "Producto de prueba número 2", cantidad: 2, precioUnitario: 15.5, subtotal: 31, importe: 31 },
    { codigo: "PRD-0003", descripcion: "Producto de prueba número 3", cantidad: 2, precioUnitario: 15.5, subtotal: 31, importe: 31 },
    { codigo: "PRD-0004", descripcion: "Producto de prueba número 4", cantidad: 2, precioUnitario: 15.5, subtotal: 31, importe: 31 },
  ],
};

function medirTinta(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  const { width, height } = canvas;
  const data = ctx.getImageData(0, 0, width, height).data;
  let oscuros = 0;
  let total = 0;
  for (let i = 0; i < data.length; i += 4) {
    total++;
    if ((data[i] + data[i + 1] + data[i + 2]) / 3 < 200) oscuros++;
  }
  return { w: width, h: height, ink: ((oscuros / total) * 100).toFixed(3) };
}

export default function DebugCaptura() {
  const [resultado, setResultado] = useState<string>("pendiente");

  const verificar = useCallback(async () => {
    setResultado("generando...");
    try {
      const htmlToImage = await import("html-to-image");
      const info: Record<string, unknown> = {};

      const cargar = (dataUrl: string) =>
        new Promise<HTMLCanvasElement>((resolve) => {
          const img = new Image();
          img.onload = () => {
            const cv = document.createElement("canvas");
            cv.width = img.width;
            cv.height = img.height;
            cv.getContext("2d")!.drawImage(img, 0, 0);
            resolve(cv);
          };
          img.src = dataUrl;
        });

      // (a) estilos inline simples
      const a = document.createElement("div");
      a.innerHTML =
        '<div style="color:#111;font-size:24px;font-weight:bold">HOLA TEXTO</div><div style="border:2px solid #000;padding:8px;margin-top:8px;color:#333">CAJA</div>';
      a.style.cssText = "width:448px;background:#fff;padding:20px;box-sizing:border-box;position:fixed;left:0;top:0;z-index:-1;";
      document.body.appendChild(a);
      info.inline = medirTinta(await cargar(await htmlToImage.toPng(a, { pixelRatio: 2 })));
      document.body.removeChild(a);

      // (b) clases tailwind simples
      const b = document.createElement("div");
      b.className = "w-[448px] bg-white p-5 text-slate-900 border border-slate-300 rounded";
      b.innerHTML =
        "<div class='text-lg font-bold'>Tailwind v4</div><div class='text-slate-500 text-sm mt-2'>subtext</div>" +
        "<table class='w-full border-collapse mt-2'><tbody><tr class='border-b border-slate-200'><td>ITEM</td><td class='text-right'>10.00</td></tr></tbody></table>";
      document.body.appendChild(b);
      info.tailwind = medirTinta(await cargar(await htmlToImage.toPng(b, { pixelRatio: 2 })));
      document.body.removeChild(b);

      // (c) documento real VISIBLE (el de la vista previa)
      await new Promise((r) => setTimeout(r, 300));
      const visible = Array.from(
        document.querySelectorAll("[data-venta-documento]"),
      ).find((n) => (n as HTMLElement).offsetParent !== null) as HTMLElement | null;
      info.hayVisible = !!visible;
      if (visible) {
        info.visible = medirTinta(
          await cargar(await htmlToImage.toPng(visible, { pixelRatio: 2, backgroundColor: "#fff" })),
        );
      }

      // (d) clon del visible reappend (conveniente si html-to-image necesita el elemento en el dom)
      if (visible) {
        const clon = visible.cloneNode(true) as HTMLElement;
        clon.style.width = "448px";
        clon.style.margin = "0 auto";
        document.body.appendChild(clon);
        info.clonVisible = medirTinta(await cargar(await htmlToImage.toPng(clon, { pixelRatio: 2, backgroundColor: "#fff" })));
        document.body.removeChild(clon);
      }

      setResultado(JSON.stringify(info, null, 1));
    } catch (e) {
      setResultado("ERROR: " + String(e));
    }
  }, []);

  return (
    <div className="p-4">
      <button
        id="verificar"
        className="rounded bg-slate-900 px-4 py-2 text-white"
        onClick={() => void verificar()}
      >
        Verificar
      </button>
      <pre id="resultado" className="my-2 text-xs">
        {resultado}
      </pre>
      <VentaPrint venta={venta} open cargando={false} onOpenChange={() => undefined} />
    </div>
  );
}