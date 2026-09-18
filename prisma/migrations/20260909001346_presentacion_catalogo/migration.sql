-- CreateTable
CREATE TABLE "PresentacionCatalogo" (
    "id" TEXT NOT NULL,
    "codigo" TEXT,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PresentacionCatalogo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PresentacionCatalogo_codigo_key" ON "PresentacionCatalogo"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "PresentacionCatalogo_nombre_key" ON "PresentacionCatalogo"("nombre");
