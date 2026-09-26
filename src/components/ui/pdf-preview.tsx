"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, FileWarning } from "lucide-react";

interface PdfPreviewProps {
  url: string;
  className?: string;
}

type Estado = "cargando" | "listo" | "error";

export function PdfPreview({ url, className = "" }: PdfPreviewProps) {
  const listadoRef = useRef<HTMLDivElement>(null);
  const [estado, setEstado] = useState<Estado>("cargando");

  useEffect(() => {
    let activo = true;

    const renderizar = async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        if (!activo) return;
        if (!pdfjs.GlobalWorkerOptions.workerSrc) {
          pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        }
        const pdf = await pdfjs.getDocument({ url }).promise;
        if (!activo) return;

        const listado = listadoRef.current;
        if (!listado) return;
        listado.replaceChildren();
        const dpr = window.devicePixelRatio || 1;
        const ancho = Math.max(listado.clientWidth - 4, 320);
        if (!activo) return;

        const paginas = await Promise.all(
          Array.from({ length: pdf.numPages }, async (_, i) => {
            const page = await pdf.getPage(i + 1);
            const base = page.getViewport({ scale: 1 });
            const escala = ancho / base.width;
            const viewport = page.getViewport({ scale: escala });

            const canvas = document.createElement("canvas");
            canvas.width = Math.floor(viewport.width * dpr);
            canvas.height = Math.floor(viewport.height * dpr);
            canvas.style.width = `${viewport.width}px`;
            canvas.style.height = `${viewport.height}px`;
            canvas.className = "block w-full rounded border bg-white shadow-sm";
            await page.render({
              canvas,
              viewport,
              transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined,
            }).promise;
            return canvas;
          }),
        );

        if (!activo) return;
        for (const canvas of paginas) listado.appendChild(canvas);
        setEstado("listo");
      } catch (err) {
        console.error("Error renderizando PDF:", err);
        if (activo) setEstado("error");
      }
    };

    void renderizar();
    return () => {
      activo = false;
    };
  }, [url]);

  return (
    <div className={`flex h-full flex-col overflow-hidden ${className}`}>
      <div className="flex-1 overflow-auto">
        <div className="space-y-3 p-4">
          <div ref={listadoRef} className="space-y-3" />
          {estado === "cargando" && (
            <div className="flex h-full min-h-40 flex-col items-center justify-center gap-2 text-sm text-slate-400">
              <Loader2 className="size-5 animate-spin" />
              Generando vista previa...
            </div>
          )}
          {estado === "error" && (
            <div className="flex h-full min-h-40 flex-col items-center justify-center gap-2 text-sm text-rose-400">
              <FileWarning className="size-5" />
              No se pudo renderizar la vista previa en este dispositivo.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}