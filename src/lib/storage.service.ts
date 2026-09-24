import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads", "empresa");

const IMAGE_TYPES: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export function usarVercelBlob(): boolean {
  return (
    process.env.STORAGE_DRIVER === "vercel-blob" ||
    process.env.VERCEL === "1" ||
    Boolean(process.env.BLOB_READ_WRITE_TOKEN) ||
    Boolean(process.env.BLOB_STORE_ID)
  );
}

export async function guardarImagenEmpresa(
  archivo: File,
  empresaId: string,
  campo: "logo" | "firma",
): Promise<string> {
  const ext = IMAGE_TYPES[archivo.type];
  if (!ext) {
    throw new Error("El archivo debe ser una imagen (PNG, JPG, WEBP o GIF)");
  }
  if (archivo.size > 5 * 1024 * 1024) {
    throw new Error("La imagen no debe superar 5 MB");
  }
  const nombre = `${empresaId}-${campo}${ext}`;
  const buffer = Buffer.from(await archivo.arrayBuffer());
  if (usarVercelBlob()) {
    return guardarBlob(buffer, nombre, archivo.type);
  }
  await mkdir(UPLOADS_DIR, { recursive: true });
  await writeFile(path.join(UPLOADS_DIR, nombre), buffer);
  return `/uploads/empresa/${nombre}`;
}

export async function quitarUploadEmpresa(
  url: string | null | undefined,
): Promise<void> {
  if (!url) return;
  if (url.startsWith("/uploads/empresa/")) {
    await unlink(path.join(UPLOADS_DIR, path.basename(url))).catch(() => {});
    return;
  }
  if (usarVercelBlob()) {
    await quitarBlob(url).catch(() => {});
  }
}

async function guardarBlob(
  buffer: Buffer,
  nombre: string,
  contentType: string,
): Promise<string> {
  const { put } = await import("@vercel/blob");
  const { url } = await put(`empresa/${nombre}`, buffer, {
    access: "public",
    contentType,
    addRandomSuffix: false,
  });
  return url;
}

async function quitarBlob(url: string): Promise<void> {
  if (!url.includes(".public.blob.vercel-storage.com")) return;
  const { del } = await import("@vercel/blob");
  await del(url);
}