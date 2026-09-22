import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  FORMA_PAGO_LABEL,
  METODO_PAGO_LABEL,
  TIPO_COMPROBANTE_LABEL,
  TIPO_DOCUMENTO_LABEL,
  formatearFechaLocal,
  type FormaPago,
  type MetodoPago,
  type TipoComprobante,
  type TipoDocumento,
  type VentaParaImprimir,
} from "@/components/ventas/types";

const fmt = (n: number) =>
  n.toLocaleString("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const numeroVenta = (venta: VentaParaImprimir) =>
  `${venta.serie}-${String(venta.numero).padStart(6, "0")}`;

export function nombrePdfVenta(venta: VentaParaImprimir): string {
  return `${venta.tipoComprobante.toUpperCase()}-${venta.serie}-${String(venta.numero)}`;
}

export function armarMensajeVenta(venta: VentaParaImprimir): string {
  const lineas: string[] = [];
  lineas.push(`*${venta.empresa?.razonSocial ?? "EMPRESA"}*`);
  if (venta.empresa?.ruc) lineas.push(`RUC: ${venta.empresa.ruc}`);
  lineas.push(
    `*${TIPO_COMPROBANTE_LABEL[venta.tipoComprobante as TipoComprobante]} ${numeroVenta(venta)}*`,
  );
  lineas.push(`Fecha: ${formatearFechaLocal(venta.fecha)}`);
  lineas.push("");
  lineas.push(
    venta.cliente
      ? `Cliente: ${venta.cliente.razonSocial}`
      : "Cliente: Consumidor final",
  );
  if (venta.cliente?.numeroDocumento) {
    lineas.push(
      `${TIPO_DOCUMENTO_LABEL[venta.cliente.tipoDocumento as TipoDocumento]}: ${venta.cliente.numeroDocumento}`,
    );
  }
  lineas.push("--------------------------------");
  for (const d of venta.detalles) {
    lineas.push(
      `${d.cantidad} x ${d.descripcion} (${d.codigo}): ${fmt(d.importe)}`,
    );
  }
  lineas.push("--------------------------------");
  lineas.push(`Subtotal: ${fmt(venta.subtotal)}`);
  lineas.push(`IGV (18%): ${fmt(venta.igv)}`);
  lineas.push(`*TOTAL: ${fmt(venta.total)}*`);
  lineas.push(
    `${FORMA_PAGO_LABEL[venta.formaPago as FormaPago]} · ${METODO_PAGO_LABEL[venta.metodoPago as MetodoPago]}`,
  );
  return lineas.join("\n");
}

function limpiarTelefono(telefono: string): string {
  const soloDigitos = telefono.replace(/\D/g, "");
  return /^9\d{8}$/.test(soloDigitos) ? `51${soloDigitos}` : soloDigitos;
}

export function enviarVentaWhatsApp(
  venta: VentaParaImprimir,
  telefono: string | null,
) {
  const numero = telefono ? limpiarTelefono(telefono) : "";
  if (!numero) return;
  const url = `https://wa.me/${numero}?text=${encodeURIComponent(armarMensajeVenta(venta))}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export function enviarVentaCorreo(
  venta: VentaParaImprimir,
  email: string | null,
) {
  if (!email) return;
  const asunto = `${TIPO_COMPROBANTE_LABEL[venta.tipoComprobante as TipoComprobante]} ${numeroVenta(venta)}`;
  const url = `mailto:${email}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(armarMensajeVenta(venta))}`;
  window.location.href = url;
}

// Requiere en el archivo real los imports que ya tenías:
// import { jsPDF } from "jspdf";
// import autoTable from "jspdf-autotable";
// import { VentaParaImprimir, TipoDocumento, FormaPago, MetodoPago } from "...";
// import { TIPO_DOCUMENTO_LABEL, FORMA_PAGO_LABEL, METODO_PAGO_LABEL } from "...";
// import { formatearFechaLocal, fmt } from "...";
//
// NOTA sobre "fmt": en la imagen de referencia los montos llevan separador de
// miles (S/ 1,525.42). Si tu "fmt" actual no lo agrega, usa algo así:
//   export function fmt(n: number) {
//     return `S/ ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
//   }
// NOTA sobre "formatearFechaLocal": la imagen usa DD/MM/AAAA con ceros a la
// izquierda (01/09/2026). Verifica que tu helper devuelva ese formato.

type ImagenCargada = { data: string; w: number; h: number };
const logosCertificacionCache = new Map<string, Promise<ImagenCargada>>();
const firmaCache = new Map<string, Promise<ImagenCargada>>();
const logoEmpresaCache = new Map<string, Promise<ImagenCargada>>();

async function cargarImagenDataUrl(
  ruta: string,
  cache: Map<string, Promise<ImagenCargada>>,
): Promise<ImagenCargada> {
  const cacheado = cache.get(ruta);
  if (cacheado) return cacheado;

  const promesa = (async () => {
    let dataUrl: string;

    if (typeof window === "undefined") {
      // Server: read from public/ filesystem or fetch absolute URLs
      if (ruta.startsWith("http://") || ruta.startsWith("https://")) {
        const res = await fetch(ruta);
        const blob = await res.blob();
        const buf = Buffer.from(await blob.arrayBuffer());
        const ext = ruta.split(".").pop()?.toLowerCase() ?? "png";
        const mime = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : `image/${ext}`;
        dataUrl = `data:${mime};base64,${buf.toString("base64")}`;
      } else {
        const { readFileSync, existsSync } = await import("fs");
        const { join } = await import("path");
        const filePath = join(process.cwd(), "public", ruta);
        if (!existsSync(filePath)) {
          throw new Error(`No se encontró la imagen ${filePath}`);
        }
        const buf = readFileSync(filePath);
        const ext = ruta.split(".").pop()?.toLowerCase() ?? "png";
        const mime = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : `image/${ext}`;
        dataUrl = `data:${mime};base64,${buf.toString("base64")}`;
      }
    } else {
      // Client: fetch relative path
      const res = await fetch(ruta);
      const blob = await res.blob();
      dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });
    }

    let dims: { w: number; h: number };
    if (typeof window !== "undefined") {
      dims = await new Promise<{ w: number; h: number }>(
        (resolve, reject) => {
          const img = new Image();
          img.onload = () =>
            resolve({ w: img.naturalWidth, h: img.naturalHeight });
          img.onerror = () =>
            reject(new Error(`No se pudo cargar la imagen ${ruta}`));
          img.src = dataUrl;
        },
      );
    } else {
      // Server: parse PNG/JPEG header to get dimensions
      const buf = Buffer.from(dataUrl.split(",")[1], "base64");
      if (buf[0] === 0x89 && buf[1] === 0x50) {
        // PNG
        dims = { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
      } else if (buf[0] === 0xff && buf[1] === 0xd8) {
        // JPEG — use default aspect ratio
        dims = { w: 100, h: 50 };
      } else {
        dims = { w: 100, h: 50 };
      }
    }

    return { data: dataUrl, ...dims };
  })();

  cache.set(ruta, promesa);
  return promesa;
}

async function cargarLogoCertificacion(ruta: string): Promise<ImagenCargada> {
  return cargarImagenDataUrl(ruta, logosCertificacionCache);
}

async function cargarFirmaUrl(ruta: string): Promise<ImagenCargada> {
  return cargarImagenDataUrl(ruta, firmaCache);
}

async function cargarLogoEmpresa(ruta: string): Promise<ImagenCargada> {
  return cargarImagenDataUrl(ruta, logoEmpresaCache);
}

export async function crearDocumentoVenta(
  venta: VentaParaImprimir,
): Promise<jsPDF> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 14;
  const esAnulada = venta.estado === "ANULADA";

  const verdeMarca: [number, number, number] = [16, 124, 74];
  const grisTexto: [number, number, number] = [40, 40, 40];
  const azulLink: [number, number, number] = [30, 64, 175];

  // ---------- Utilidades de dibujo ----------
  const drawQrPattern = (x: number, y: number, size: number) => {
    const block = size / 21;
    const pattern = [
      [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0],
      [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0],
      [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0],
      [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0],
      [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 0],
      [0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0],
      [0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0],
      [0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0],
      [0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
      [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0],
      [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0],
      [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0],
      [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0],
    ];
    pattern.forEach((row, yIndex) => {
      row.forEach((value, xIndex) => {
        if (!value) return;
        doc.setFillColor(...verdeMarca);
        doc.rect(x + xIndex * block, y + yIndex * block, block, block, "F");
      });
    });
    doc.setDrawColor(...verdeMarca);
    doc.setLineWidth(0.3);
    doc.rect(x, y, size, size, "S");
  };

  // Logo: círculo verde con una "hoja" blanca (óvalo rotado) encima
  const drawLeafLogo = (cx: number, cy: number, r: number) => {
    doc.setFillColor(...verdeMarca);
    doc.circle(cx, cy, r, "F");

    const angle = (-40 * Math.PI) / 180;
    const rx = r * 0.78;
    const ry = r * 0.4;
    const steps = 24;
    const points: [number, number][] = [];
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * Math.PI * 2;
      const ex = rx * Math.cos(t);
      const ey = ry * Math.sin(t);
      const rxp = ex * Math.cos(angle) - ey * Math.sin(angle);
      const ryp = ex * Math.sin(angle) + ey * Math.cos(angle);
      points.push([cx + rxp, cy + ryp]);
    }
    doc.setFillColor(255, 255, 255);
    const deltas: [number, number][] = [];
    for (let i = 1; i < points.length; i++) {
      deltas.push([
        points[i][0] - points[i - 1][0],
        points[i][1] - points[i - 1][1],
      ]);
    }
    doc.lines(deltas, points[0][0], points[0][1], [1, 1], "F", true);

    doc.setDrawColor(...verdeMarca);
    doc.setLineWidth(0.25);
    const nx1 = cx + rx * 0.85 * Math.cos(angle);
    const ny1 = cy + rx * 0.85 * Math.sin(angle);
    const nx2 = cx - rx * 0.85 * Math.cos(angle);
    const ny2 = cy - rx * 0.85 * Math.sin(angle);
    doc.line(nx1, ny1, nx2, ny2);
  };

  // Escribe "LABEL: valor" midiendo el ancho de la etiqueta en negrita
  // ANTES de cambiar a fuente normal (evita que el texto se pise).
  const campo = (
    label: string,
    valor: string,
    y: number,
    x: number = margin,
  ) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, x, y);
    const w = doc.getTextWidth(label);
    doc.setFont("helvetica", "normal");
    doc.text(` ${valor}`, x + w + 1, y);
  };

  const underline = (
    text: string,
    x: number,
    y: number,
    opts: { align?: "left" | "center" | "right" } = {},
  ) => {
    const w = doc.getTextWidth(text);
    const align = opts.align || "left";
    let lineX = x;
    if (align === "center") lineX = x - w / 2;
    if (align === "right") lineX = x - w;
    doc.setLineWidth(0.2);
    doc.line(lineX, y + 0.8, lineX + w, y + 0.8);
  };

  // Campos en la misma fila: dibuja campo y devuelve la x del siguiente
  const campoFila = (
    label: string,
    valor: string,
    y: number,
    x: number,
    maxX: number,
  ): number => {
    doc.setFont("helvetica", "bold");
    doc.text(label, x, y);
    const w = doc.getTextWidth(label);
    doc.setFont("helvetica", "normal");
    let texto = ` ${valor}`;
    const anchoLibre = maxX - (x + w);
    if (doc.getTextWidth(texto) > anchoLibre) {
      while (doc.getTextWidth(texto + "…") > anchoLibre && texto.length > 1) {
        texto = texto.slice(0, -1);
      }
      texto += "…";
    }
    doc.text(texto, x + w, y);
    return x + w + doc.getTextWidth(texto) + 10;
  };

  // Campo anclado a la derecha de la fila: termina en xDer
  const campoAncladoDerecha = (
    label: string,
    valor: string,
    y: number,
    xDer: number,
  ) => {
    doc.setFont("helvetica", "bold");
    const labelW = doc.getTextWidth(label);
    doc.setFont("helvetica", "normal");
    let texto = ` ${valor}`;
    const anchoLibre = xDer - (labelW + 2);
    if (doc.getTextWidth(texto) > anchoLibre) {
      while (doc.getTextWidth(texto + "…") > anchoLibre && texto.length > 1) {
        texto = texto.slice(0, -1);
      }
      texto += "…";
    }
    const inicio = xDer - labelW - doc.getTextWidth(texto);
    doc.setFont("helvetica", "bold");
    doc.text(label, Math.max(margin, inicio), y);
    doc.setFont("helvetica", "normal");
    doc.text(texto, Math.max(margin, inicio) + labelW, y);
  };

  // Fondo blanco
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageW, pageH, "F");

  // ---------- Encabezado izquierdo: Logo + empresa ----------
  const logoUrl = venta.empresa?.logoUrl;
  if (logoUrl) {
    try {
      const logo = await cargarLogoEmpresa(logoUrl);
      const escala = Math.min(500 / logo.w, 18 / logo.h);
      const logoW = logo.w * escala;
      const logoH = logo.h * escala;
      const logoY = 16.5 - logoH / 2;
      doc.addImage(logo.data, "PNG", 10, logoY, logoW, logoH);
    } catch {
      drawLeafLogo(margin + 5, 16.5, 5.2);
    }
  } else {
    drawLeafLogo(margin + 5, 16.5, 5.2);
  }

/*   doc.setTextColor(...verdeMarca);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(
    venta.empresa?.razonSocial?.toUpperCase() ?? "BIOALTERNATIVA",
    margin + 13,
    15,
  );

  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(70, 70, 70);
  doc.text('"La Agricultura del Futuro, HOY"', margin + 13, 20); */

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.3);
  doc.setTextColor(...grisTexto);
  doc.text(`R.U.C. N° ${venta.empresa?.ruc ?? "20477222766"}`, margin, 27);

  doc.setFontSize(6.6);
  campo(
    "DOMICILIO FISCAL:",
    "Av. Juan Pablo II N°172 Las Lomas de Huanchaco - Trujillo- La Libertad",
    32,
  );
  campo(
    "CONTACTOS:",
    "Logística +51 941 311 129 // Contabilidad +51 928 468 072.",
    37,
  );

  // ---------- Encabezado derecho: recuadro verde con comprobante/serie/n° + fecha ----------
  const cajaX = pageW - 55;
  const cajaW = 41;
  const cajaY = 10;
  const cajaH = 13;
  doc.setDrawColor(...verdeMarca);
  doc.setLineWidth(0.4);
  doc.roundedRect(cajaX, cajaY, cajaW, cajaH, 1.5, 1.5, "S");

  doc.setTextColor(...verdeMarca);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("COTIZACIÓN", cajaX + cajaW / 2, cajaY + 4.6, { align: "center" });

  doc.setFontSize(7);
  doc.setTextColor(...grisTexto);
  doc.setFont("helvetica", "bold");
  doc.text("SERIE:", cajaX + 5, cajaY + 10);
  const serW = doc.getTextWidth("SERIE:");
  doc.setFont("helvetica", "normal");
  doc.text(`${venta.serie || "02-2026"}`, cajaX + 5 + serW + 1, cajaY + 10);

  const serieFin =
    cajaX + 5 + serW + 1 + doc.getTextWidth(`${venta.serie || "02-2026"}`);
  doc.setFont("helvetica", "bold");
  doc.text("N°:", serieFin + 6, cajaY + 10);
  const nw = doc.getTextWidth("N°:");
  doc.setFont("helvetica", "normal");
  doc.text(`${venta.numero}`, serieFin + 6 + nw + 1, cajaY + 10);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text(
    `FECHA: ${formatearFechaLocal(venta.fecha)}`,
    cajaX + cajaW / 2,
    cajaY + cajaH + 4,
    { align: "center" },
  );

  doc.setTextColor(...azulLink);
  campo("WEB:", "www.bioalternativaeyf.com", 32, margin + 140);
  campo("MAIL:", "bioalternativasac@gmail.com", 37, margin + 140);

  doc.setDrawColor(...verdeMarca);
  doc.setLineWidth(0.6);
  doc.line(margin, 41, pageW - margin, 41);

  // ---------- Certificaciones ----------
  doc.setTextColor(...grisTexto);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("CONTAMOS CON CERTIFICACIÓN DE:", margin, 47);

  const senasaX = pageW / 2 - 30;
  const [senasa, union] = await Promise.all([
    cargarLogoCertificacion("/images/senasa.png"),
    cargarLogoCertificacion("/images/union.png"),
  ]);

  const escalaSenasa = Math.min(24 / senasa.w, 14 / senasa.h);
  const senasaW = senasa.w * escalaSenasa;
  const senasaH = senasa.h * escalaSenasa;
  doc.addImage(
    senasa.data,
    "PNG",
    senasaX - senasaW / 2,
    55 - senasaH / 2,
    senasaW,
    senasaH,
  );

  const unionBoxW = 36;
  const unionBoxH = 8;
  const unionCx = pageW / 2 + 23;
  const escalaUnion = Math.min(unionBoxW / union.w, unionBoxH / union.h);
  const unionW = union.w * escalaUnion;
  const unionH = union.h * escalaUnion;
  doc.addImage(
    union.data,
    "PNG",
    unionCx - unionW / 2,
    55 - unionH / 2,
    unionW,
    unionH,
  );

  doc.setDrawColor(...verdeMarca);
  doc.setLineWidth(0.6);
  doc.line(margin, 63, pageW - margin, 63);

  // ---------- Datos del cliente ----------
  doc.setTextColor(...grisTexto);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("DATOS DEL CLIENTE:", margin, 69);

  doc.setFontSize(7.1);
  const clienteNombre = venta.cliente?.razonSocial ?? "CONSUMIDOR FINAL";
  const documento = venta.cliente ? `${venta.cliente.numeroDocumento}` : "—";
  const direccion = venta.cliente?.direccion || "—";

  let xCliente = margin;
  xCliente = campoFila(
    "RAZÓN SOCIAL:",
    clienteNombre,
    74.5,
    xCliente,
    pageW - margin,
  );
  campoFila("N° DE RUC Y/O DNI:", documento, 74.5, xCliente, pageW - margin);

  // CONTACTO y CORREO quedan fijados en una columna derecha constante
  const xDerechaFija = pageW - 60;
  campoAncladoDerecha(
    "CONTACTO:",
    venta.cliente?.telefono || "",
    74.5,
    xDerechaFija,
  );

  campoFila("DIRECCIÓN:", direccion, 80.5, margin, pageW - margin);
  campoAncladoDerecha(
    "CORREO:",
    venta.cliente?.email || "",
    80.5,
    xDerechaFija,
  );

  doc.setDrawColor(...verdeMarca);
  doc.line(margin, 85, pageW - margin, 85);

  // ---------- Frase introductoria ----------
  doc.setTextColor(...verdeMarca);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.3);
  const intro = `En respuesta a su solicitud, ${
    venta.empresa?.razonSocial ?? "BIOALTERNATIVA EAF S.A.C."
  } se complace en ofrecerle la siguiente cotización, respaldada por nuestros estándares de calidad y certificaciones oficiales.`;
  doc.text(intro, margin, 90, { maxWidth: pageW - margin * 2 });

  // ---------- Tabla ----------
  const bodyRows = venta.detalles.map(item => [
    item.codigo,
    item.descripcion,
    item.presentacion || "Unidad",
    String(item.cantidad),
    item.unidad || "KG",
    fmt(item.precioUnitario),
    fmt(item.importe),
  ]);

  autoTable(doc, {
    startY: 97,
    margin: { left: margin, right: margin },
    head: [
      [
        "CÓDIGO",
        "DESCRIPCIÓN PRODUCTO",
        "PRESENTACIÓN",
        "CANTIDAD SOLICITADA",
        "UNIDAD DE MEDIDA",
        "PRECIO UNITARIO",
        "SUB TOTAL (S/)",
      ],
    ],
    body: bodyRows,
    theme: "grid",
    styles: {
      fontSize: 6.3,
      cellPadding: 1.4,
      textColor: [30, 41, 59],
      lineColor: [22, 101, 52],
      lineWidth: 0.07,
      valign: "middle",
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: verdeMarca,
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
      valign: "middle",
      fontSize: 5.7,
      lineWidth: 0.07,
    },
    bodyStyles: {
      halign: "center",
      lineWidth: 0.07,
    },
    tableLineWidth: 0.07,
    columnStyles: {
      0: { cellWidth: 12 },
      1: { cellWidth: 70, halign: "left" },
      2: { cellWidth: 28 },
      3: { cellWidth: 17 },
      4: { cellWidth: 18, halign: "center" },
      5: { cellWidth: 18, halign: "right" },
      6: { cellWidth: 20, halign: "right" },
    },
  });

  let finalY = (doc as unknown as { lastAutoTable: { finalY: number } })
    .lastAutoTable.finalY;

  if (venta.detalles.length > 12) {
    doc.addPage();
    finalY = 18;
    doc.setDrawColor(...verdeMarca);
    doc.setLineWidth(0.5);
    doc.line(margin, 12, pageW - margin, 12);
  }

  // ---------- Totales ----------
  const totalsW = 62;
  const totalsX = pageW - margin - totalsW;
  const labelX = totalsX + 4;
  const valueX = pageW - margin - 2;
  doc.setFontSize(7.2);
  doc.setDrawColor(22, 101, 52);
  doc.setLineWidth(0.15);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...grisTexto);
  doc.text("SUB TOTAL S/", labelX, finalY + 5);
  doc.setFont("helvetica", "normal");
  doc.text(fmt(venta.subtotal), valueX, finalY + 5, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.text("IGV 18%", labelX, finalY + 10.5);
  doc.setFont("helvetica", "normal");
  doc.text(fmt(venta.igv), valueX, finalY + 10.5, { align: "right" });

  doc.setFillColor(...verdeMarca);
  doc.rect(totalsX, finalY + 13, totalsW, 7, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL S/", labelX, finalY + 17.7);
  doc.text(fmt(venta.total), valueX, finalY + 17.7, { align: "right" });

  const infoY = finalY + 27;

  // ---------- Forma de pago / entrega ----------
  doc.setTextColor(...grisTexto);
  doc.setFontSize(7.3);
  campo(
    "FORMA DE PAGO:",
    FORMA_PAGO_LABEL[venta.formaPago as FormaPago] ??
      String(venta.formaPago) ??
      "CONTADO",
    infoY,
  );
  campo("ATENCIÓN DEL PRODUCTO:", "INMEDIATO", infoY + 5.5);
  campo("LUGAR DE ENTREGA DE PRODUCTO:", "Puesto en Agencia", infoY + 11);

  doc.setFont("helvetica", "bold");
  doc.text("MEDIOS DE PAGO DISPONIBLE:", margin, infoY + 19);
  underline("MEDIOS DE PAGO DISPONIBLE:", margin, infoY + 19);
  const mediosLabelW = doc.getTextWidth("MEDIOS DE PAGO DISPONIBLE:");
  doc.setFont("helvetica", "arial", "normal");
  doc.text(
    " cuentas corrientes en Soles.",
    margin + mediosLabelW + 1,
    infoY + 19,
  );

  campo(
    "ENTIDAD BANCARIA:",
    venta.empresa?.banco ?? "Banco de Crédito del Perú",
    infoY + 25,
  );
  campo(
    "TITULAR:",
    venta.empresa?.razonSocial ?? "BIOALTERNATIVA",
    infoY + 30.5,
  );
  campo("N° CUENTA:", venta.empresa?.cuenta ?? "570-2293280-0-18", infoY + 36);
  campo(
    "N° CCI:",
    venta.empresa?.cci ?? "002-570-002293280018-02",
    infoY + 41.5,
  );

  doc.setFont("helvetica", "normal");
  doc.text("Atentamente.", margin, infoY + 49);

  // Línea vertical divisoria
  /*  doc.setDrawColor(120, 120, 120);
  doc.setLineWidth(0.2);
  doc.line(pageW / 2 + 8, infoY + 20, pageW / 2 + 8, pageH - 14); */

  // ---------- Firma (imagen desde la BD o trazo simulado) ----------
  const dibujarFirmaSimulada = () => {
    doc.setDrawColor(35, 60, 150);
    doc.setLineWidth(0.45);
    doc.lines(
      [
        [3, -6],
        [3, 5.5],
        [2.5, -8],
        [2, 3],
        [1.5, -6.5],
        [2, 8.5],
        [3, -7],
        [2.5, 6],
        [3.5, -4],
        [4, 1.5],
      ],
      margin + 4,
      infoY + 64,
      [1, 1],
      "S",
    );
  };

  const firmaUrl = venta.empresa?.firmaUrl;
  if (!firmaUrl) {
    dibujarFirmaSimulada();
  } else {
    try {
      const firma = await cargarFirmaUrl(firmaUrl);
      const escala = Math.min(100 / firma.w, 25 / firma.h);
      const fw = firma.w * escala;
      const fh = firma.h * escala;

      let data = firma.data;
      if (typeof document !== "undefined") {
        const lienzo = document.createElement("canvas");
        lienzo.width = 500;
        lienzo.height = Math.max(1, Math.round((firma.h / firma.w) * 500));
        const contexto = lienzo.getContext("2d");
        if (!contexto) throw new Error("Canvas no disponible");
        const imagen = new Image();
        await new Promise<void>((resolve, reject) => {
          imagen.onload = () => {
            contexto.drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
            resolve();
          };
          imagen.onerror = () =>
            reject(new Error("No se pudo decodificar la firma"));
          imagen.src = firma.data;
        });
        data = lienzo.toDataURL("image/png");
      }
      const firmaX = pageW / 2 - fw / 2;
      const firmaY = infoY + 50;
      doc.addImage(data, "PNG", firmaX, firmaY, fw, fh);
    } catch (error) {
      console.error("No se pudo dibujar la firma:", error);
      dibujarFirmaSimulada();
    }
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.6);
  doc.setTextColor(...grisTexto);
  const footerText = "CONTABILIDAD - BIOALTERNATIVA E&F S.A.C.";
  doc.text(footerText, pageW / 2, infoY + 80, { align: "center" });

  // ---------- QR ----------
  /*  const qrSize = 26;
  const qrX = pageW - margin - qrSize;
  const qrY = infoY + 24;
  doc.setTextColor(...azulLink);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(6.8);
  const caption = '"Escanee aquí nuestro catálogo"';
  doc.text(caption, qrX + qrSize / 2, qrY - 3, { align: "center" });
  underline(caption, qrX + qrSize / 2, qrY - 3, { align: "center" });
  drawQrPattern(qrX, qrY, qrSize); */

  // ---------- Marca de agua ANULADA ----------
  if (esAnulada) {
    doc.setTextColor(185, 28, 28);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(40);
    doc.text("ANULADA", pageW / 2, pageH / 2, { align: "center", angle: -15 });
  }

  return doc;
}

export async function exportarPdfVenta(
  venta: VentaParaImprimir,
  opciones?: { preview?: boolean },
): Promise<string | undefined> {
  const { preview = false } = opciones ?? {};
  const doc = await crearDocumentoVenta(venta);

  if (preview) {
    const url = doc.output("bloburl");
    return String(url);
  }

  doc.save(`${nombrePdfVenta(venta)}.pdf`);
}
