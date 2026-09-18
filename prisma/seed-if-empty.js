/**
 * Seed de bootstrap: solo siembra si la base de datos está vacía.
 *
 * Se ejecuta en el build de Vercel (después de `prisma migrate deploy`),
 * pero SOLO actúa si no existe ningún usuario. En despliegues posteriores
 * la base ya tiene datos y este script termina inmediatamente (no-op).
 *
 * Siembra: rol ADMIN, usuario admin, permisos, empresa, periodo,
 * establecimiento, almacenamiento, catálogos y productos iniciales.
 */
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const userCount = await prisma.user.count();

  if (userCount > 0) {
    console.log(
      `▶ Seed omitido: la base ya tiene ${userCount} usuario(s). Solo se siembra una base vacía.`
    );
    return;
  }

  console.log("▶ Base vacía detectada: ejecutando seed inicial...");
  await require("./seed.js")();
  console.log("▶ Seed inicial completado.");
}

main()
  .catch((error) => {
    console.error("❌ Error en seed-if-empty:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
