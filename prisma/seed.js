/* const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const bcrypt = require("bcryptjs");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("Iniciando seed...");

  const adminRole = await prisma.role.upsert({
    where: {
      name: "ADMIN",
    },
    update: {},
    create: {
      name: "ADMIN",
      description: "Administrador del sistema",
    },
  });

  const passwordHash = await bcrypt.hash("Admin123*", 12);

  const adminUser = await prisma.user.upsert({
    where: {
      username: "admin",
    },
    update: {
      email: "admin@empresa.com",
      name: "Administrador",
      status: true,
    },
    create: {
      username: "admin",
      email: "admin@empresa.com",
      password: passwordHash,
      name: "Administrador",
      status: true,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  console.log("=================================");
  console.log("       SEED COMPLETADO");
  console.log("=================================");
  console.log("Usuario:     admin");
  console.log("Correo:      admin@empresa.com");
  console.log("Contraseña:  Admin123*");
  console.log("Rol:         ADMIN");
  console.log("=================================");
}

main()
  .catch((error) => {
    console.error("Error ejecutando seed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); */

  const { PrismaClient } = require("@prisma/client");
  const { PrismaPg } = require("@prisma/adapter-pg");
  const { Pool } = require("pg");
  const bcrypt = require("bcryptjs");

  require("dotenv").config();

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  
  async function main() {
    console.log("🌱 Iniciando seed del Kardex...");
  
    // ============================================================
    // 1. ROLES Y USUARIO ADMINISTRADOR
    // ============================================================
    const [adminRole, password] = await Promise.all([
      prisma.role.upsert({
        where: { name: "ADMIN" },
        update: {},
        create: {
          name: "ADMIN",
          description: "Administrador del sistema",
        },
      }),
      bcrypt.hash("Admin123*", 10),
    ]);
  
    const admin = await prisma.user.upsert({
      where: { username: "admin" },
      update: {
        email: "admin@empresa.com",
        name: "Administrador",
        password,
        status: true,
      },
      create: {
        username: "admin",
        email: "admin@empresa.com",
        name: "Administrador",
        password,
        status: true,
      },
    });
  
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: admin.id,
          roleId: adminRole.id,
        },
      },
      update: {},
      create: {
        userId: admin.id,
        roleId: adminRole.id,
      },
    });

     const permissions = [
    ["USUARIOS.GESTIONAR", "Gestionar usuarios", "USUARIOS"],
    ["ROLES.GESTIONAR", "Gestionar roles y permisos", "ROLES"],
    ["AUDITORIA.CONSULTAR", "Consultar auditoría", "AUDITORIA"],
    ["CONFIGURACION.CONSULTAR", "Consultar configuración", "CONFIGURACION"],
    ["PRODUCTOS.GESTIONAR", "Gestionar productos", "PRODUCTOS"],
    ["BASE_ACTIVA.GESTIONAR", "Gestionar Base Activa", "BASE_ACTIVA"],
    ["PRODUCTO_TERMINADO.GESTIONAR", "Gestionar Producto Terminado", "PRODUCTO_TERMINADO"],
    ["PEPS.GESTIONAR", "Gestionar PEPS", "PEPS"],
    ["STOCK.CONSULTAR", "Consultar stock y Kardex", "STOCK"],
    ["REPORTES.CONSULTAR", "Consultar reportes", "REPORTES"],
  ];
  await Promise.all(
    permissions.map(async ([codigo, nombre, modulo]) => {
      const permission = await prisma.permission.upsert({ where: { codigo }, update: { nombre, modulo, activo: true }, create: { codigo, nombre, modulo, activo: true } });
      await prisma.rolePermission.upsert({ where: { roleId_permissionId: { roleId: adminRole.id, permissionId: permission.id } }, update: {}, create: { roleId: adminRole.id, permissionId: permission.id } });
    }),
  );

  
    // ============================================================
    // 2. EMPRESA / PERIODO / ESTABLECIMIENTO
    // ============================================================
    const empresa = await prisma.empresa.upsert({
      where: { ruc: "20477222766" },
      update: {
        razonSocial: "BIOALTERNATIVA E&F S.A.C.",
        activo: true,
      },
      create: {
        ruc: "20477222766",
        razonSocial: "BIOALTERNATIVA E&F S.A.C.",
      },
    });
  
    const [periodo, establecimiento] = await Promise.all([
      prisma.periodo.upsert({
        where: {
          empresaId_anio: {
            empresaId: empresa.id,
            anio: 2026,
          },
        },
        update: { activo: true },
        create: {
          empresaId: empresa.id,
          anio: 2026,
          activo: true,
        },
      }),
      prisma.establecimiento.upsert({
        where: {
          empresaId_nombre: {
            empresaId: empresa.id,
            nombre: "HUANCHACO - LAS LOMAS",
          },
        },
        update: { activo: true },
        create: {
          empresaId: empresa.id,
          nombre: "HUANCHACO - LAS LOMAS",
          codigo: null,
        },
      }),
    ]);
  
    // ============================================================
    // 3. ALMACENAMIENTO
    // ============================================================
    const almacenamiento = await prisma.almacenamiento.upsert({
      where: { codigo: "CUARTO_FRIO" },
      update: {
        nombre: "CUARTO FRIO",
        establecimientoId: establecimiento.id,
        activo: true,
      },
      create: {
        codigo: "CUARTO_FRIO",
        nombre: "CUARTO FRIO",
        establecimientoId: establecimiento.id,
      },
    });
  
    // ============================================================
    // 4. UNIDADES DE MEDIDA
    // Los códigos oficiales de Tabla 6 no se inventan.
    // ============================================================
    const unidades = [
      "KILOGRAMOS",
      "250 GRAMOS",
      "300 GRAMOS",
      "200 GRAMOS",
      "500 GRAMOS",
      "BOLSA 250 GRAMOS",
      "BOLSA 500 GRAMOS",
      "POMO DE 1 LITRO",
      "BIDON 18 LITROS",
      "BOLSAS GRANDES DE ALMACENAMIENTO BASE ACTIVA",
    ];
  
const unidadMap = Object.fromEntries(
      await Promise.all(
        unidades.map(async (nombre) => {
          const unidad = await prisma.unidadMedida.upsert({
            where: { nombre },
            update: { activo: true },
            create: { nombre, codigo: null },
          });
          return [nombre, unidad];
        }),
      ),
    );
  
// ============================================================
    // 5. TIPOS DE EXISTENCIA (TABLA 5 / TIPO DE AFECTACIÓN)
    // Solo dos modalidades operativas:
    //   1 -> PRODUCTO TERMINADO
    //   2 -> PRODUCTO EN PROCESO
    // ============================================================
    const tiposExistencia = Object.fromEntries(
      await Promise.all(
        [
          { codigo: "1", nombre: "PRODUCTO TERMINADO" },
          { codigo: "2", nombre: "PRODUCTO EN PROCESO" },
        ].map(async (item) => {
          const tipo = await prisma.tipoExistencia.upsert({
            where: { codigo: item.codigo },
            update: { nombre: item.nombre, activo: true },
            create: item,
          });
          return [item.codigo, tipo];
        }),
      ),
    );
  
    // ============================================================
    // 6. CATÁLOGOS BÁSICOS
    // ============================================================
    const operaciones = [
      { codigo: "INVENTARIO_INICIAL", nombre: "INVENTARIO INICIAL" },
      { codigo: "INGRESO", nombre: "INGRESO" },
      { codigo: "SALIDA", nombre: "SALIDA" },
    ];
  
    await Promise.all(
      operaciones.map((op) =>
        prisma.tipoOperacion.upsert({
          where: { codigo: op.codigo },
          update: { nombre: op.nombre, activo: true },
          create: op,
        }),
      ),
    );
  
    // Se mantiene el catálogo vacío de categorías/marcas/afectación
    // porque el Excel proporcionado no define aquí sus valores concretos.
  
// ============================================================
    // 7. PRODUCTOS BASE ACTIVA
    // Código interno separado de codigoExistencia.
    // Tabla 5 apunta siempre a "2 - PRODUCTO EN PROCESO".
    // ============================================================
    const baseProducts = [
      { codigo: "BB", codigoExistencia: "02", descripcion: "Beauveria bassiana" },
      { codigo: "MA", codigoExistencia: "03", descripcion: "Metarhizium anisopliae" },
      { codigo: "PL", codigoExistencia: "03", descripcion: "Purpureocillium lilacinum" },
      { codigo: "IF", codigoExistencia: "03", descripcion: "Isaria fumosorosea" },
      { codigo: "LL", codigoExistencia: "03", descripcion: "Lecanicillium lecanii" },
      { codigo: "TA", codigoExistencia: "08", descripcion: "Trichoderma asperellum" },
      { codigo: "TH", codigoExistencia: "08", descripcion: "Trichoderma harzianum" },
      { codigo: "TV", codigoExistencia: "08", descripcion: "Trichoderma viride" },
    ];

    await Promise.all(
      baseProducts.map((p) =>
        prisma.producto.upsert({
          where: { codigo: p.codigo },
          update: {
            tipoInventario: "BASE_ACTIVA",
            codigoExistencia: p.codigoExistencia,
            descripcion: p.descripcion,
            tipoExistenciaId: tiposExistencia["2"].id,
            unidadMedidaId: unidadMap["BOLSAS GRANDES DE ALMACENAMIENTO BASE ACTIVA"].id,
            metodoValuacion: "PEPS",
            activo: true,
          },
          create: {
            tipoInventario: "BASE_ACTIVA",
            codigo: p.codigo,
            codigoExistencia: p.codigoExistencia,
            descripcion: p.descripcion,
            tipoExistenciaId: tiposExistencia["2"].id,
            unidadMedidaId: unidadMap["BOLSAS GRANDES DE ALMACENAMIENTO BASE ACTIVA"].id,
            metodoValuacion: "PEPS",
          },
        }),
      ),
    );
  
    // ============================================================
    // 8. PRODUCTOS TERMINADOS
    // Cada código del Excel se conserva exactamente.
    // No se agrega "PT-" y no se crean lotes.
    //
    // Tabla 5 apunta siempre a "1 - PRODUCTO TERMINADO".
    // ============================================================
    const ptProducts = [
      ["01", "BIO INSECT PW", "KILOGRAMOS"],
      ["01250", "BIO INSECT PW", "250 GRAMOS"],
      ["01300", "BIO INSECT PW", "300 GRAMOS"],
      ["02", "BIO BASIANA", "KILOGRAMOS"],
      ["02200", "BIO BASIANA", "200 GRAMOS"],
      ["02250", "BIO BASIANA", "250 GRAMOS"],
      ["02500", "BIO BASIANA", "500 GRAMOS"],
      ["03", "BIO METARRIL", "KILOGRAMOS"],
      ["03200", "BIO METARRIL", "200 GRAMOS"],
      ["03250", "BIO METARRIL", "200 GRAMOS"],
      ["03500", "BIO METARRIL", "200 GRAMOS"],
      ["04", "BIO-LILACINUS", "KILOGRAMOS"],
      ["04200", "BIO LILACINUS", "200 GRAMOS"],
      ["05", "BIO FUMOSO", "KILOGRAMOS"],
      ["06", "BIO LECANII", "KILOGRAMOS"],
      ["06500", "BIO LECANII", "500 GRAMOS"],
      ["08", "BIO TRIX", "KILOGRAMOS"],
      ["08200", "BIO TRIX", "200 GRAMOS"],
      ["08250", "BIO TRIX", "BOLSA 250 GRAMOS"],
      ["08500", "BIO TRIX", "BOLSA 500 GRAMOS"],
      ["09", "BIO SUBTILIS", "POMO DE 1 LITRO"],
      ["10", "PROMOBIOL", "POMO DE 1 LITRO"],
      ["15P", "BIO INSECT POWER", "POMO DE 1 LITRO"],
      ["1518", "BIO INSECT POWER", "BIDON 18 LITROS"],
      ["16", "BIO BT", "POMO DE 1 LITRO"],
    ];
  
    await Promise.all(
      ptProducts.map(async ([codigo, descripcion, unidad]) => {
        const producto = await prisma.producto.upsert({
          where: { codigo },
          update: {
            tipoInventario: "PRODUCTO_TERMINADO",
            codigoExistencia: codigo,
            descripcion,
            tipoExistenciaId: tiposExistencia["1"].id,
            unidadMedidaId: unidadMap[unidad].id,
            metodoValuacion: "PEPS",
            activo: true,
          },
          create: {
            tipoInventario: "PRODUCTO_TERMINADO",
            codigo,
            codigoExistencia: codigo,
            descripcion,
            tipoExistenciaId: tiposExistencia["1"].id,
            unidadMedidaId: unidadMap[unidad].id,
            metodoValuacion: "PEPS",
          },
        });

        await prisma.presentacion.upsert({
          where: { productoId: producto.id },
          update: {
            nombre: unidad,
            unidadMedidaId: unidadMap[unidad].id,
            activo: true,
          },
          create: {
            productoId: producto.id,
            nombre: unidad,
            unidadMedidaId: unidadMap[unidad].id,
          },
        });
      }),
    );
  
    console.log("✅ Seed completado.");
    console.log("👤 Usuario: admin");
    console.log("🔑 Password: Admin123*");
    console.log(`🏢 Empresa: ${empresa.razonSocial}`);
    console.log(`📅 Periodo: ${periodo.anio}`);
    console.log(`🏭 Establecimiento: ${establecimiento.nombre}`);
  }
  
  // Ejecuta el seed y libera conexiones al terminar.
  // Se exporta para poder invocarlo desde seed-if-empty.js en el build de Vercel.
  async function run() {
    try {
      await main();
    } catch (error) {
      console.error("❌ Error ejecutando seed:", error);
      throw error;
    } finally {
      await prisma.$disconnect();
      await pool.end();
    }
  }

  module.exports = run;

  // Al ejecutarse directamente (node prisma/seed.js o prisma db seed), corre solo.
  if (require.main === module) {
    run().catch(() => process.exit(1));
  }
  