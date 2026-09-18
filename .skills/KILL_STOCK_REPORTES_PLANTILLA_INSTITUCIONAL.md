SKILL --- STOCK + REPORTES + PLANTILLA INSTITUCIONAL

1. OBJETIVO

Implementar y corregir el módulo de Stock y el módulo de
Reportes sin rehacer el proyecto y sin reemplazar la arquitectura
existente.

Debe existir una separación clara entre:

Stock normal: consulta operativa del inventario.

Reporte normal: salida limpia para consulta/impresión.

Reporte oficial mediante plantilla institucional: documento con
logo, encabezado, tabla, fecha, firma, responsable y razón social.

La plantilla oficial debe poder utilizarse para Base Activa y
posteriormente para Producto Terminado y Kardex.

PRIORIDADES:

PROTOTIPO / PLANTILLA VISUAL
        +
LÓGICA REAL DEL NEGOCIO
        +
PRISMA / POSTGRESQL
        +
PEPS
        +
STOCK
        +
PDF / IMPRESIÓN

No crear una aplicación paralela.

2. FUENTES DE DATOS

No utilizar datos estáticos para stock.

La información debe provenir de:

Producto
   ↓
LoteBaseActiva / MovimientoProductoTerminado
   ↓
MovimientoBaseActiva / MovimientoProductoTerminado
   ↓
PEPS
   ↓
Stock
   ↓
Reportes

Para Base Activa:

Producto
 ├── codigo
 ├── codigoExistencia
 ├── descripcion
 ├── tipoExistencia
 ├── unidadMedida
 └── metodoValuacion

LoteBaseActiva
 ├── codigo
 ├── productoId
 └── almacenamiento

MovimientoBaseActiva
 ├── fecha
 ├── productoId
 ├── loteId
 ├── establecimientoId
 ├── tipoMovimiento
 ├── entradas
 ├── salidas
 ├── observacion
 └── almacenamiento

PEPS
 └── stock disponible por capa

3. REGLA FUNDAMENTAL DE PRODUCTO

No mezclar:

Producto.codigo

con:

Producto.codigoExistencia

Ejemplos Base Activa:

BB → 02 → Beauveria bassiana
MA → 03 → Metarhizium anisopliae
PL → 03 → Purpureocillium lilacinum
IF → 03 → Isaria fumosorosea
LL → 03 → Lecanicillium lecanii
TA → 08 → Trichoderma asperellum
TH → 08 → Trichoderma harzianum
TV → 08 → Trichoderma viride

El reporte puede mostrar ambos valores cuando corresponda, pero nunca
sustituir uno por otro.

4. STOCK NORMAL

Ruta:

/dashboard/stock

Archivos a revisar/adaptar:

src/app/dashboard/stock/page.tsx
src/app/dashboard/stock/stock-module.tsx

src/actions/stock.actions.ts

src/lib/services/stock.service.ts
src/lib/validators/stock.schema.ts

Usar los archivos existentes si ya están creados.

NO crear otro servicio de stock.

4.1 Vista Base Activa

Debe permitir:

Producto

Código

Lote

Stock total Kg

Ubicación

Estado, si ya existe en la arquitectura

Filtros:

Producto
Lote
Establecimiento
Periodo

Acciones:

Exportar Excel
Imprimir
PDF
Reporte oficial

4.2 Cálculo

El stock no se edita manualmente.

Base Activa:

Stock Kg =
SUM(Entradas Kg) - SUM(Salidas Kg)

respetando el orden cronológico y la lógica PEPS existente.

Para el stock por lote:

Producto + Lote
        ↓
Movimientos del lote
        ↓
Entradas - Salidas
        ↓
Stock actual

No sumar lotes diferentes como si fueran uno solo.

5. REPORTE NORMAL DE STOCK

El reporte normal es diferente de la plantilla oficial.

Es una salida operativa sencilla.

Ejemplo:

STOCK BASE ACTIVA

Producto                  Código   Lote          Stock Kg    Ubicación
-----------------------------------------------------------------------
Beauveria bassiana        BB       BB2607-09     180.00      CUARTO FRIO
Metarhizium anisopliae    MA       MA2601-01     132.00      CUARTO FRIO
Metarhizium anisopliae    MA       MA2604-02     216.00      ALMACEN A
Trichoderma harzianum     TH       TH2606-08     251.00      CUARTO FRIO

Debe permitir:

[Imprimir]
[Exportar Excel]
[Exportar PDF]

Este reporte NO necesita obligatoriamente logo y firma.

6. PLANTILLA INSTITUCIONAL

Crear una plantilla reutilizable.

Recomendación:

src/
└── components/
    └── reportes/
        ├── report-template.tsx
        ├── stock-base-activa-report.tsx
        ├── stock-producto-terminado-report.tsx
        └── report-actions.tsx

Si el proyecto ya tiene una carpeta de componentes para reportes,
reutilizarla.

NO duplicar plantillas.

7. ESTRUCTURA DE LA PLANTILLA

La plantilla oficial debe seguir la referencia visual entregada por el
usuario.

Estructura:

┌─────────────────────────────────────────────────────┐
│                    LOGO EMPRESA                     │
│                                                     │
│        CUADRO RESUMEN DE INVENTARIO                 │
│                 BASE ACTIVA                         │
├─────────────────────────────────────────────────────┤
│ ESPECIE │ CÓDIGO │ LOTE │ STOCK TOTAL │ UBICACIÓN  │
├─────────┼────────┼──────┼─────────────┼────────────┤
│ ...                                                 │
│                                                     │
│ Total especie ...                                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Informe al DD-MM-YYYY                               │
│                                                     │
│                           FIRMA                     │
│                           Responsable               │
│                           Razón social              │
└─────────────────────────────────────────────────────┘

Conservar:

marco exterior

encabezado verde de referencia

encabezados de tabla

agrupación por especie/producto

filas de total por especie

fecha

firma

razón social

espaciado

alineaciones

formato decimal

No convertirlo en una tabla genérica.

8. DATOS DEL ENCABEZADO

Los datos deben salir de Prisma.

Empresa.ruc
Empresa.razonSocial
Establecimiento.nombre
Periodo.anio

Para el producto:

Producto.descripcion
Producto.codigo
Producto.codigoExistencia
Producto.tipoExistencia
Producto.unidadMedida
Producto.metodoValuacion

Para el stock:

LoteBaseActiva.codigo
stock calculado
almacenamiento

No pedir estos datos manualmente al usuario cada vez que genera el
reporte.

9. LOGO Y FIRMA

La plantilla debe permitir integrar:

logo
firma
responsable
cargo

Opción recomendada

Agregar configuración de reporte a nivel de empresa, reutilizando la
Empresa existente.

Antes de modificar Prisma:

Revisar si ya existen campos de logo/firma.

Si no existen, agregar solamente los campos necesarios.

Ejecutar migración.

Regenerar Prisma Client.

Validar TypeScript.

Campos recomendados:

logoUrl             String?
firmaUrl            String?
responsableReporte  String?
cargoReporte        String?

Estos campos deben representar rutas/URLs de archivos, NO imágenes
binarias dentro de PostgreSQL.

Ejemplo:

/public/uploads/empresa/logo.png
/public/uploads/empresa/firma.png

Si el proyecto ya tiene almacenamiento de archivos, utilizarlo en lugar
de crear otro mecanismo.

10. CAMBIOS EN CONFIGURACIÓN DE EMPRESA

Revisar:

src/app/dashboard/config/
src/lib/services/config.service.ts
src/actions/config.actions.ts
src/lib/validators/config.schema.ts

Agregar únicamente:

Logo de empresa
Firma
Responsable de reportes
Cargo

La pantalla debe permitir:

[Seleccionar logo]
[Seleccionar firma]

Responsable de reportes: __________________
Cargo: _________________________________

[Guardar configuración]

No agregar configuración innecesaria.

11. REPORTE OFICIAL BASE ACTIVA

Archivo recomendado:

src/components/reportes/stock-base-activa-report.tsx

Debe recibir datos ya calculados.

Conceptualmente:

type StockBaseActivaReportData = {
  empresa: {
    ruc: string;
    razonSocial: string;
    logoUrl?: string | null;
    firmaUrl?: string | null;
    responsableReporte?: string | null;
    cargoReporte?: string | null;
  };
  establecimiento: string;
  fechaInforme: Date;
  items: Array<{
    productoId: number;
    descripcion: string;
    codigo: string;
    lotes: Array<{
      lote: string;
      stockKg: number;
      ubicacion?: string | null;
      observacion?: string | null;
    }>;
    totalKg: number;
  }>;
};

La plantilla NO debe consultar Prisma directamente.

12. AGRUPACIÓN DEL REPORTE

El reporte debe agrupar por producto/especie.

Ejemplo:

Beauveria bassiana
    BB2607-09     180.00
    BB2608-01     320.00
    ----------------------
    Total         500.00

Metarhizium anisopliae
    MA2601-01     132.00
    MA2604-02     216.00
    ----------------------
    Total         348.00

Los productos con stock 0 pueden mostrarse según el filtro/configuración
del reporte.

No inventar especies que no existan en Producto.

13. UBICACIÓN Y OBSERVACIÓN

Mantener separados:

almacenamiento / ubicación

y:

observación

En la plantilla de stock se puede mostrar:

UBICACIÓN / OBS.

pero el origen de cada dato debe mantenerse separado en el modelo.

NO concatenar permanentemente los campos en la base de datos.

14. IMPRESIÓN

Crear una vista preparada para imprimir.

Botón:

Imprimir

Debe utilizar:

window.print()

o el mecanismo equivalente ya utilizado por el proyecto.

Durante impresión:

Ocultar:

sidebar

menú

filtros

botones

elementos de navegación

Mostrar:

logo

título

tabla

totales

fecha

firma

responsable

razón social

Utilizar CSS:

@media print {
  ...
}

La impresión debe estar preparada para A4.

15. EXPORTACIÓN PDF

Debe existir:

Exportar PDF

El PDF debe representar la plantilla oficial, no una captura de pantalla
de la tabla.

Tecnología recomendada si el proyecto no tiene una solución existente:

jspdf
jspdf-autotable

o reutilizar la solución PDF que ya exista.

Antes de instalar otra librería:

revisar package.json;

reutilizar una dependencia existente si cumple;

evitar dos soluciones PDF simultáneas.

El PDF debe incluir:

logo

título

tabla

totales

fecha

firma

responsable

razón social

16. EXPORTACIÓN EXCEL

El Excel es una salida de datos, no necesariamente una copia
pixel-perfect del PDF.

Usar:

.xlsx

No utilizar CSV como exportación principal.

Debe contener como mínimo:

Descripción
Código
Lote
Stock Total Kg
Ubicación
Observación

Si el reporte necesita agrupación, conservar los totales por especie.

17. SERVICIO DE REPORTES

Revisar:

src/lib/services/reportes.service.ts
src/actions/reportes.actions.ts
src/lib/validators/reportes.schema.ts
src/app/dashboard/reportes/page.tsx
src/app/dashboard/reportes/reportes-module.tsx

El servicio debe encargarse de:

filtros
   ↓
consultas Prisma
   ↓
cálculo/obtención de stock
   ↓
agrupación
   ↓
DTO de reporte

La plantilla solamente presenta:

DTO
 ↓
HTML / Print
 ↓
PDF

No poner consultas Prisma dentro del componente visual.

18. FLUJO CORRECTO

Usuario
   ↓
Stock / Reportes
   ↓
Selecciona:
Periodo
Establecimiento
Producto
Lote
   ↓
Server Action
   ↓
Zod
   ↓
Reportes Service
   ↓
Stock Service / PEPS
   ↓
Prisma
   ↓
Datos reales
   ↓
Report DTO
   ├───────────────┐
   ▼               ▼
Reporte normal   Plantilla oficial
                   │
              ┌────┴─────┐
              ▼          ▼
           Imprimir     PDF

19. ARCHIVOS QUE SE DEBEN MODIFICAR

EXISTENTES --- REVISAR PRIMERO

src/app/dashboard/stock/page.tsx
src/app/dashboard/stock/stock-module.tsx

src/app/dashboard/reportes/page.tsx
src/app/dashboard/reportes/reportes-module.tsx

src/actions/stock.actions.ts
src/actions/reportes.actions.ts

src/lib/services/stock.service.ts
src/lib/services/reportes.service.ts

src/lib/validators/stock.schema.ts
src/lib/validators/reportes.schema.ts

src/app/dashboard/config/page.tsx
src/app/dashboard/config/config-module.tsx

src/actions/config.actions.ts
src/lib/services/config.service.ts
src/lib/validators/config.schema.ts

prisma/schema.prisma

NUEVOS --- SOLO SI NO EXISTEN

src/components/reportes/report-template.tsx
src/components/reportes/stock-base-activa-report.tsx
src/components/reportes/report-actions.tsx

Si el proyecto ya posee componentes equivalentes, adaptarlos en lugar de
crear duplicados.

20. CAMBIO EN PRISMA

NO modificar Prisma por el reporte normal.

Para logo/firma sí puede ser necesario.

Antes:

Revisar Empresa

Si no existen campos equivalentes:

logoUrl             String?
firmaUrl            String?
responsableReporte  String?
cargoReporte        String?

Después:

pnpm prisma format
pnpm prisma validate
pnpm prisma migrate dev --name add_empresa_report_config
pnpm prisma generate
pnpm exec tsc --noEmit

No continuar si prisma validate o TypeScript fallan.

21. NO CREAR UN MODELO STOCK NUEVO

El stock debe continuar siendo derivado de:

MovimientoBaseActiva
MovimientoProductoTerminado
PEPS

No crear:

StockBaseActiva
StockProductoTerminado

solo para almacenar números calculados, salvo que exista una necesidad
técnica demostrada.

22. NO MODIFICAR PEPS DESDE EL REPORTE

El reporte es de lectura.

Nunca:

Reporte
  ↓
modifica PEPS

Debe ser:

PEPS
  ↓
Stock
  ↓
Reporte

23. SEGURIDAD Y PERMISOS

Respetar el sistema existente de permisos.

Consultar el permiso correspondiente antes de permitir:

ver stock
generar reporte
exportar Excel
exportar PDF
configurar logo/firma

No duplicar el sistema de permisos.

24. MANEJO DE LOGO Y FIRMA

No utilizar rutas absolutas del computador del desarrollador.

NO:

C:\Users\...\logo.png

Usar rutas accesibles por la aplicación:

/uploads/empresa/logo.png
/uploads/empresa/firma.png

o el almacenamiento ya existente.

El PDF debe comprobar que las imágenes estén disponibles.

Si falta logo:

No mostrar imagen rota.

Si falta firma:

Mostrar espacio de firma y responsable,
sin inventar una firma.

25. ERRORES QUE ESTE SKILL DEBE EVITAR

NO:

crear otro modelo Producto;

crear otro modelo Lote;

crear otro servicio Stock;

guardar stock manual;

consultar Prisma desde la UI;

duplicar PEPS;

mezclar observación y almacenamiento;

mezclar código con código de existencia;

cambiar los códigos reales;

usar datos demo en producción;

usar CSV como exportación principal;

generar PDF solo con texto sin plantilla;

poner logo/firma hardcodeados en el componente;

usar rutas C:\...;

modificar PEPS desde reportes;

crear una pantalla CRUD genérica;

cambiar el diseño del prototipo;

duplicar componentes existentes;

instalar una segunda librería PDF sin revisar package.json;

dejar errores TypeScript.

26. PRUEBAS OBLIGATORIAS

Antes de terminar:

pnpm prisma format
pnpm prisma validate
pnpm prisma generate
pnpm exec tsc --noEmit
pnpm build

Corregir todos los errores.

Prueba funcional Base Activa

Usar datos reales o de prueba controlada:

Producto: TH
Descripción: Trichoderma harzianum
Lote: TH2026-01
Entrada: 60 Kg
Ubicación: CUARTO FRIO

El stock debe mostrar:

TH | TH2026-01 | 60.00 Kg | CUARTO FRIO

El reporte oficial debe mostrar el mismo valor.

27. PRUEBA DE LOGO Y FIRMA

Configurar:

Logo
Firma
Responsable
Cargo

Generar reporte.

Comprobar:

✓ Logo visible
✓ Firma visible
✓ Responsable correcto
✓ Razón social correcta
✓ Fecha correcta
✓ Tabla correcta
✓ Totales correctos
✓ PDF abre correctamente
✓ Impresión A4 correcta

28. CRITERIOS DE ACEPTACIÓN

El trabajo queda terminado solamente cuando:

Stock normal funciona.

Stock Base Activa utiliza datos reales.

Stock por lote funciona.

Filtros funcionan.

Reporte normal funciona.

Exportación Excel funciona.

Impresión funciona.

PDF funciona.

Existe plantilla institucional.

La plantilla incorpora logo.

La plantilla incorpora firma.

Responsable y cargo salen de configuración.

La razón social sale de Empresa.

La fecha se genera automáticamente.

Los totales por producto son correctos.

No se mezclan lotes.

No se mezcla observación con almacenamiento.

No se altera PEPS desde reportes.

No hay datos estáticos.

No hay modelos duplicados.

No hay servicios duplicados.

pnpm prisma validate pasa.

pnpm exec tsc --noEmit pasa.

pnpm build pasa.

La plantilla conserva la referencia visual proporcionada por el
usuario.

29. ORDEN EXACTO DE IMPLEMENTACIÓN

No implementar todo simultáneamente.

FASE 1 --- Diagnóstico

Revisar:

Prisma
Stock
Reportes
Configuración
Dependencias PDF/Excel

No modificar nada todavía.

FASE 2 --- Stock normal

Corregir/adaptar:

stock.service.ts
stock.actions.ts
stock-module.tsx

Probar.

FASE 3 --- Reporte normal

Corregir/adaptar:

reportes.service.ts
reportes.actions.ts
reportes-module.tsx

Probar.

FASE 4 --- Configuración institucional

Agregar:

logo
firma
responsable
cargo

Solo modificar Prisma si realmente faltan los campos.

FASE 5 --- Plantilla

Crear/reutilizar:

report-template.tsx
stock-base-activa-report.tsx

FASE 6 --- Impresión

Implementar CSS de impresión A4.

FASE 7 --- PDF

Implementar exportación PDF usando una única solución.

FASE 8 --- Excel

Implementar .xlsx.

FASE 9 --- Integración

Verificar:

Producto
 ↓
Lote
 ↓
Movimiento
 ↓
PEPS
 ↓
Stock
 ↓
Reporte
 ↓
Plantilla
 ↓
PDF / Impresión

FASE 10 --- Validación final

Ejecutar:

pnpm prisma format
pnpm prisma validate
pnpm prisma generate
pnpm exec tsc --noEmit
pnpm build

Solo considerar terminado cuando todos pasen.

30. REGLA FINAL

Este SKILL NO debe utilizarse para rehacer el sistema.

Debe utilizarse para:

CÓDIGO EXISTENTE
      +
MÓDULOS EXISTENTES
      +
PRISMA EXISTENTE
      +
PROTOTIPO EXISTENTE
      +
PLANTILLA INSTITUCIONAL
      ↓
IMPLEMENTACIÓN FINAL

La plantilla oficial es independiente del stock normal, pero utiliza
exactamente los mismos datos reales.

La salida final debe ser:

                 STOCK
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
   REPORTE NORMAL       REPORTE OFICIAL
        │                     │
        ├─ Excel              ├─ Logo
        ├─ PDF                ├─ Firma
        └─ Imprimir           ├─ Responsable
                              ├─ Razón social
                              ├─ Fecha
                              ├─ Tabla
                              └─ Totales

NO improvisar cambios fuera de este alcance.
