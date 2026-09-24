"use server";

import { revalidatePath } from "next/cache";
import {
  empresaSchema,
  periodoSchema,
  establecimientoSchema,
} from "@/lib/validators/config.schema";
import {
  crearEmpresaService,
  actualizarEmpresaService,
  cambiarEstadoEmpresaService,
  crearPeriodoService,
  actualizarPeriodoService,
  cambiarEstadoPeriodoService,
  crearEstablecimientoService,
  actualizarEstablecimientoService,
  cambiarEstadoEstablecimientoService,
  obtenerConfiguracionService,
} from "@/lib/services/config.service";
import { prisma } from "@/lib/db/prisma";
import {
  guardarImagenEmpresa,
  quitarUploadEmpresa,
} from "@/lib/storage.service";

export type ConfigState = { success: boolean; message: string };

const text = (formData: FormData, key: string) => String(formData.get(key) ?? "");
const id = (formData: FormData) => String(formData.get("id") ?? "");

function errorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
    return "Ya existe un registro con esos datos.";
  }
  return error instanceof Error ? error.message : fallback;
}

export async function obtenerConfiguracion() {
  return obtenerConfiguracionService();
}

export async function guardarEmpresa(_prev: ConfigState, formData: FormData): Promise<ConfigState> {
  const parsed = empresaSchema.safeParse({ ruc: text(formData, "ruc"), razonSocial: text(formData, "razonSocial") });
  if (!parsed.success) return { success: false, message: parsed.error.issues[0].message };
  try {
    const empresaId = id(formData);
    if (empresaId) await actualizarEmpresaService(empresaId, parsed.data);
    else await crearEmpresaService(parsed.data);
    revalidatePath("/dashboard/config");
    return { success: true, message: empresaId ? "Empresa actualizada" : "Empresa registrada" };
  } catch (error) { return { success: false, message: errorMessage(error, "No se pudo guardar la empresa") }; }
}

export async function cambiarEstadoEmpresa(formData: FormData): Promise<ConfigState> {
  const empresaId = id(formData);
  const activo = text(formData, "activo") === "true";
  if (!empresaId) return { success: false, message: "Empresa inválida" };
  try { await cambiarEstadoEmpresaService(empresaId, activo); revalidatePath("/dashboard/config"); return { success: true, message: "Estado actualizado" }; }
  catch (error) { return { success: false, message: errorMessage(error, "No se pudo actualizar el estado") }; }
}

export async function guardarPeriodo(_prev: ConfigState, formData: FormData): Promise<ConfigState> {
  const parsed = periodoSchema.safeParse({ empresaId: text(formData, "empresaId"), anio: text(formData, "anio") });
  if (!parsed.success) return { success: false, message: parsed.error.issues[0].message };
  try {
    const periodoId = id(formData);
    if (periodoId) await actualizarPeriodoService(periodoId, parsed.data);
    else await crearPeriodoService(parsed.data);
    revalidatePath("/dashboard/config");
    return { success: true, message: periodoId ? "Periodo actualizado" : "Periodo registrado" };
  } catch (error) { return { success: false, message: errorMessage(error, "No se pudo guardar el periodo") }; }
}

export async function cambiarEstadoPeriodo(formData: FormData): Promise<ConfigState> {
  const periodoId = id(formData);
  const activo = text(formData, "activo") === "true";
  if (!periodoId) return { success: false, message: "Periodo inválido" };
  try { await cambiarEstadoPeriodoService(periodoId, activo); revalidatePath("/dashboard/config"); return { success: true, message: "Estado actualizado" }; }
  catch (error) { return { success: false, message: errorMessage(error, "No se pudo actualizar el estado") }; }
}

export async function guardarEstablecimiento(_prev: ConfigState, formData: FormData): Promise<ConfigState> {
  const parsed = establecimientoSchema.safeParse({
    empresaId: text(formData, "empresaId"),
    codigo: text(formData, "codigo"),
    nombre: text(formData, "nombre"),
    direccion: text(formData, "direccion"),
  });
  if (!parsed.success) return { success: false, message: parsed.error.issues[0].message };
  try {
    const establecimientoId = id(formData);
    if (establecimientoId) await actualizarEstablecimientoService(establecimientoId, parsed.data);
    else await crearEstablecimientoService(parsed.data);
    revalidatePath("/dashboard/config");
    return { success: true, message: establecimientoId ? "Establecimiento actualizado" : "Establecimiento registrado" };
  } catch (error) { return { success: false, message: errorMessage(error, "No se pudo guardar el establecimiento") }; }
}

export async function cambiarEstadoEstablecimiento(formData: FormData): Promise<ConfigState> {
  const establecimientoId = id(formData);
  const activo = text(formData, "activo") === "true";
  if (!establecimientoId) return { success: false, message: "Establecimiento inválido" };
  try { await cambiarEstadoEstablecimientoService(establecimientoId, activo); revalidatePath("/dashboard/config"); return { success: true, message: "Estado actualizado" }; }
  catch (error) { return { success: false, message: errorMessage(error, "No se pudo actualizar el estado") }; }
}

function parseEmpresaArchivo(formData: FormData): { logo: File | null; firma: File | null } {
  const l = formData.get("logo"); const f = formData.get("firma");
  return { logo: l instanceof File && l.size > 0 ? l : null, firma: f instanceof File && f.size > 0 ? f : null };
}

export async function guardarEmpresaReporte(formData: FormData): Promise<ConfigState> {
  const empresaId = id(formData);
  if (!empresaId) return { success: false, message: "Empresa inválida" };
  const responsableReporte = text(formData, "responsableReporte");
  const cargoReporte = text(formData, "cargoReporte");
  const { logo, firma } = parseEmpresaArchivo(formData);
  try {
    const empresa = await prisma.empresa.findUnique({ where: { id: empresaId } });
    if (!empresa) return { success: false, message: "La empresa no existe" };
    let logoUrl = empresa.logoUrl;
    let firmaUrl = empresa.firmaUrl;
    if (logo) { await quitarUploadEmpresa(empresa.logoUrl); logoUrl = await guardarImagenEmpresa(logo, empresaId, "logo"); }
    if (firma) { await quitarUploadEmpresa(empresa.firmaUrl); firmaUrl = await guardarImagenEmpresa(firma, empresaId, "firma"); }
    await prisma.empresa.update({ where: { id: empresaId }, data: { logoUrl, firmaUrl, responsableReporte: responsableReporte || null, cargoReporte: cargoReporte || null } });
    revalidatePath("/dashboard/config");
    return { success: true, message: "Configuración de reportes guardada" };
  } catch (error) { return { success: false, message: errorMessage(error, "No se pudo guardar la configuración de reportes") }; }
}
