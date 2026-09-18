import { getSession } from "@/lib/auth/session";
import { generarPdfVentaService } from "@/lib/services/pdf.service";
import { ENVIO_ERROR_CODES } from "@/lib/validators/envio-comprobante.validator";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  contexto: RouteContext<"/api/ventas/[id]/pdf">,
) {
  let ventaId: string;
  try {
    const { id } = await contexto.params;
    ventaId = id;
  } catch {
    return new Response("Venta inválida", { status: 400 });
  }

  const session = await getSession();
  if (!session) {
    return new Response("No autorizado", { status: 401 });
  }

  try {
    const pdf = await generarPdfVentaService(ventaId);

    const url = new URL(_request.url);
    const descargar = url.searchParams.get("descargar") === "1";

    return new Response(new Uint8Array(pdf.buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${descargar ? "attachment" : "inline"}; filename="${pdf.nombre}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "No se pudo generar el PDF";
    return new Response(mensaje, {
      status: mensaje === ENVIO_ERROR_CODES.VENTA_NO_ENCONTRADA ? 404 : 500,
    });
  }
}