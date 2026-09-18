import { prisma } from "@/lib/db/prisma";

export async function obtenerEmpresaActivaService() {
  const empresa =
    (await prisma.empresa.findFirst({
      where: { activo: true },
      orderBy: { createdAt: "asc" },
    })) ??
    (await prisma.empresa.findFirst({ orderBy: { createdAt: "asc" } }));

  if (!empresa) {
    throw new Error("No hay una empresa configurada. Registre una en Configuración.");
  }

  return empresa;
}