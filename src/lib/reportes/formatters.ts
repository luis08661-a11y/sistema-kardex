export const fmt = (n: number) =>
  n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const fmtEntero = (n: number) =>
  n.toLocaleString("es-PE", { maximumFractionDigits: 0 });

export const fmtCan = (n: number) =>
  n.toLocaleString("es-PE", { minimumFractionDigits: 0, maximumFractionDigits: 6 });

export const fechaCorta = (d: string | Date) => {
  const dt = typeof d === "string" ? new Date(d) : d;
  if (isNaN(dt.getTime())) return "";
  return dt.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export function imprimir() {
  if (typeof document === "undefined") return;
  window.print();
}

export function imagenComoDataUrl(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(null);
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}
