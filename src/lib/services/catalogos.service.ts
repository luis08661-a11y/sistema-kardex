import { prisma } from "@/lib/db/prisma";
import type {
  AlmacenamientoInput,
  CatalogoCodigoNombreInput,
  CatalogoNombreInput,
  UnidadMedidaInput,
} from "@/lib/validators/catalogos.schema";

export async function obtenerCatalogosService() {
  const [unidades, tiposExistencia, categorias, marcas, afectaciones, operaciones, establecimientos, almacenamientos, presentaciones] =
    await Promise.all([
      prisma.unidadMedida.findMany({ orderBy: { nombre: "asc" } }),
      prisma.tipoExistencia.findMany({ orderBy: { codigo: "asc" } }),
      prisma.categoria.findMany({ orderBy: { nombre: "asc" } }),
      prisma.marca.findMany({ orderBy: { nombre: "asc" } }),
      prisma.tipoAfectacion.findMany({ orderBy: { codigo: "asc" } }),
      prisma.tipoOperacion.findMany({ orderBy: { codigo: "asc" } }),
      prisma.establecimiento.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } }),
      prisma.almacenamiento.findMany({
        include: { establecimiento: { select: { id: true, nombre: true } } },
        orderBy: [{ establecimiento: { nombre: "asc" } }, { nombre: "asc" }],
      }),
      prisma.presentacionCatalogo.findMany({ orderBy: { nombre: "asc" } }),
    ]);

  return { unidades, tiposExistencia, categorias, marcas, afectaciones, operaciones, establecimientos, almacenamientos, presentaciones };
}

export async function crearUnidadService(input: UnidadMedidaInput) {
  return prisma.unidadMedida.create({
    data: { codigo: input.codigo || null, nombre: input.nombre.toUpperCase() },
  });
}

export async function crearPresentacionService(input: UnidadMedidaInput) {
  return prisma.presentacionCatalogo.create({
    data: { codigo: input.codigo || null, nombre: input.nombre.toUpperCase() },
  });
}

export async function actualizarCatalogoService(tipo: string, id: string, input: { codigo?: string; nombre: string }) {
  const codigo = input.codigo?.trim() || "";
  const nombre = input.nombre.trim().toUpperCase();
  switch (tipo) {
    case "unidad": return prisma.unidadMedida.update({ where: { id }, data: { codigo: codigo || null, nombre } });
    case "presentacion": return prisma.presentacionCatalogo.update({ where: { id }, data: { codigo: codigo || null, nombre } });
    case "existencia": return prisma.tipoExistencia.update({ where: { id }, data: { codigo: codigo.toUpperCase(), nombre } });
    case "categoria": return prisma.categoria.update({ where: { id }, data: { nombre } });
    case "marca": return prisma.marca.update({ where: { id }, data: { nombre } });
    case "afectacion": return prisma.tipoAfectacion.update({ where: { id }, data: { codigo: codigo.toUpperCase(), nombre } });
    case "operacion": return prisma.tipoOperacion.update({ where: { id }, data: { codigo: codigo.toUpperCase(), nombre } });
    case "almacenamiento": return prisma.almacenamiento.update({ where: { id }, data: { codigo: codigo.toUpperCase(), nombre } });
    default: throw new Error("Catálogo no válido");
  }
}

export async function eliminarCatalogoService(tipo: string, id: string) {
  switch (tipo) {
    case "unidad": return prisma.unidadMedida.delete({ where: { id } });
    case "presentacion": return prisma.presentacionCatalogo.delete({ where: { id } });
    case "existencia": return prisma.tipoExistencia.delete({ where: { id } });
    case "categoria": return prisma.categoria.delete({ where: { id } });
    case "marca": return prisma.marca.delete({ where: { id } });
    case "afectacion": return prisma.tipoAfectacion.delete({ where: { id } });
    case "operacion": return prisma.tipoOperacion.delete({ where: { id } });
    case "almacenamiento": return prisma.almacenamiento.delete({ where: { id } });
    default: throw new Error("Catálogo no válido");
  }
}

export async function crearTipoExistenciaService(input: CatalogoCodigoNombreInput) {
  return prisma.tipoExistencia.create({ data: { codigo: input.codigo.toUpperCase(), nombre: input.nombre.toUpperCase() } });
}

export async function crearCategoriaService(input: CatalogoNombreInput) {
  return prisma.categoria.create({ data: { nombre: input.nombre.toUpperCase() } });
}

export async function crearMarcaService(input: CatalogoNombreInput) {
  return prisma.marca.create({ data: { nombre: input.nombre.toUpperCase() } });
}

export async function crearAfectacionService(input: CatalogoCodigoNombreInput) {
  return prisma.tipoAfectacion.create({ data: { codigo: input.codigo.toUpperCase(), nombre: input.nombre.toUpperCase() } });
}

export async function crearOperacionService(input: CatalogoCodigoNombreInput) {
  return prisma.tipoOperacion.create({ data: { codigo: input.codigo.toUpperCase(), nombre: input.nombre.toUpperCase() } });
}

export async function crearAlmacenamientoService(input: AlmacenamientoInput) {
  const establecimiento = await prisma.establecimiento.findFirst({
    where: { id: input.establecimientoId, activo: true },
  });
  if (!establecimiento) throw new Error("El establecimiento no existe o está inactivo");

  return prisma.almacenamiento.create({
    data: {
      codigo: input.codigo.toUpperCase(),
      nombre: input.nombre.toUpperCase(),
      establecimientoId: input.establecimientoId,
    },
  });
}

export async function cambiarEstadoCatalogoService(tipo: string, id: string, activo: boolean) {
  switch (tipo) {
    case "unidad": return prisma.unidadMedida.update({ where: { id }, data: { activo } });
    case "existencia": return prisma.tipoExistencia.update({ where: { id }, data: { activo } });
    case "categoria": return prisma.categoria.update({ where: { id }, data: { activo } });
    case "marca": return prisma.marca.update({ where: { id }, data: { activo } });
    case "afectacion": return prisma.tipoAfectacion.update({ where: { id }, data: { activo } });
    case "operacion": return prisma.tipoOperacion.update({ where: { id }, data: { activo } });
    case "almacenamiento": return prisma.almacenamiento.update({ where: { id }, data: { activo } });
    default: throw new Error("Catálogo no válido");
  }
}
