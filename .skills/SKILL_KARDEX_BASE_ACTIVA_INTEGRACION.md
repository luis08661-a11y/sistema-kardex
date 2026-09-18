---
name: kardex-base-activa-integracion
version: 1.0.0
description: Adaptación del módulo Kardex Base Activa del prototipo existente al proyecto Next.js + Prisma, conservando la interfaz y comportamiento del prototipo.
---

# SKILL — KARDEX BASE ACTIVA

## OBJETIVO

Implementar el módulo **Base Activa / Kardex Base Activa** usando como referencia directa el prototipo existente.

REGLA PRINCIPAL:

**CONSERVAR LA INTERFAZ DEL PROTOTIPO.**

No crear una pantalla nueva genérica.

La adaptación consiste en reemplazar los datos JavaScript/locales por datos reales de:

- Producto
- LoteBaseActiva
- TipoOperacion
- MovimientoBaseActiva
- PEPS
- PostgreSQL mediante Prisma

---

# 1. ESTRUCTURA VISUAL A CONSERVAR

La pantalla debe conservar:

## Encabezado

`Base Activa`

Subtítulo:

`Lotes, movimientos e inventario histórico de materia prima.`

## Indicadores

- Lotes
- Movimientos
- Stock Base Activa

## Pestañas

- Movimientos
- Lotes
- Stock por lote

## Movimiento

Botón:

`+ Nuevo Movimiento Base Activa`

## Tabla Kardex

Debe mantener la estructura agrupada:

### DETALLE DEL REGISTRO

- FECHA
- LOTE
- PRODUCTO
- UBICACIÓN
- RESPONSABLE

### OPERACIÓN

- TIPO (TABLA 12)

### ENTRADAS

- UND
- PESO (KG)
- TOTAL KG

### SALIDAS

- UND
- PESO UNIT.
- TOTAL KG

### SALDO FINAL

- UND
- PESO (KG)
- TOTAL KG

### MOTIVO

- MOTIVO FORM.

### FORMULACIÓN BASE ACTIVA

- RESP. FORM.
- CANT. FORM.
- UBICACIÓN

---

# 2. FILTROS

Conservar los filtros del prototipo:

### Producto Maestro

Permitir:

`Todos los Productos Maestros`

o seleccionar un producto específico.

### Lote

Permitir:

`Todos los Lotes`

o seleccionar un lote.

El filtro de lote debe depender del producto seleccionado.

Si se selecciona un producto, mostrar únicamente sus lotes.

---

# 3. NUEVO MOVIMIENTO BASE ACTIVA

El botón abre el modal:

`Nuevo Registro de Inventario`

Mantener la estructura visual del prototipo.

## SECCIÓN 1 — DETALLE DEL REGISTRO

Campos:

- Producto
- Fecha
- N° Lote
- Abrev. Código
- Observación
- Responsable

### Producto

Cargar desde `Producto`.

Solo:

`tipoInventario = BASE_ACTIVA`

### Fecha

Obligatoria.

### N° Lote

Cargar desde `LoteBaseActiva`.

El listado debe depender del producto seleccionado.

### Abrev. Código

Mostrar el código/abreviatura del producto.

Debe provenir del producto seleccionado.

No crear un código diferente.

### Observación

Campo independiente.

NO confundir con:

`Almacenamiento`

### Responsable

Debe integrarse con el usuario autenticado cuando sea posible.

---

# 4. SECCIÓN 2 — TIPO DE OPERACIÓN

Título:

`2. TIPO DE OPERACIÓN (TABLA 12)`

Campos:

### Operación

Selector basado en `TipoOperacion`.

### Tipo de Movimiento

Dos opciones:

`ENTRADA`

`SALIDA`

Mantener el estilo de botones/radio del prototipo.

### Motivo Salida / Formulación

Campo para el motivo correspondiente.

---

# 5. SECCIÓN 3 — DATOS DE ENTRADA

Título:

`3. DATOS DE ENTRADA DE MERCADERÍA`

Campos:

- Unidades (UND)
- Peso Unitario (Kg)
- Peso Total (Kg)

## Cálculo

Si se ingresan:

`Unidades × Peso Unitario`

calcular:

`Peso Total`

Ejemplo:

`10 × 3.50 = 35.00 Kg`

El peso total no debe depender de un valor escrito manualmente cuando pueda calcularse.

Para una salida utilizar la misma lógica en los campos correspondientes.

---

# 6. SECCIÓN 4 — REGISTRO DE CANTIDAD FINAL

Campos:

- Responsable Formulación
- Cantidad Formulado
- Almacenamiento

IMPORTANTE:

`Almacenamiento` es diferente de `Observación`.

No mezclarlos.

---

# 7. DATOS Y PRISMA

NO utilizar:

- arrays locales
- `localStorage`
- IDs como `rec-${Date.now()}`
- `masterProducts`
- `batches`
- `kardexMovements`

El prototipo utiliza actualmente estructuras locales de ese tipo; deben ser reemplazadas por la base de datos real.

El prototipo actual construye movimientos con `productId`, `batchId`, `fecha`, `tipoOperacion`, entrada/salida y datos de formulación. Esa estructura conceptual debe conservarse, pero persistida mediante Prisma.

---

# 8. MODELOS A UTILIZAR

Usar los modelos existentes:

```text
Producto
LoteBaseActiva
TipoOperacion
MovimientoBaseActiva
CapaPEPSBase
AplicacionPEPSBase
Periodo
Establecimiento
Almacenamiento
User
```

NO crear otro modelo de movimiento.

NO crear otro modelo de lote.

---

# 9. MAPEO

## Producto

```text
UI Producto
    ↓
Producto.id
```

## Lote

```text
UI N° Lote
    ↓
LoteBaseActiva.id
```

## Fecha

```text
UI Fecha
    ↓
MovimientoBaseActiva.fecha
```

## Operación

```text
UI Operación
    ↓
TipoOperacion.id
```

## Movimiento

```text
ENTRADA / SALIDA
    ↓
MovimientoBaseActiva.tipoMovimiento
```

## Entrada Base Activa

Utilizar los campos de entrada existentes:

- unidades
- peso unitario
- peso total

## Salida Base Activa

Utilizar los campos de salida existentes:

- unidades
- peso unitario
- peso total

---

# 10. SALDO

NO guardar un saldo manual desde la interfaz.

El saldo debe derivarse de los movimientos y/o del proceso PEPS existente.

Para Base Activa:

```text
Saldo Kg =
Entradas Kg - Salidas Kg
```

respetando el orden cronológico de los movimientos.

La tabla debe mostrar el saldo acumulado correspondiente a cada registro.

---

# 11. PEPS

Al registrar una entrada:

```text
MovimientoBaseActiva
        ↓
CapaPEPSBase
```

Al registrar una salida:

```text
MovimientoBaseActiva
        ↓
AplicacionPEPSBase
        ↓
CapaPEPSBase
```

La salida debe consumir primero las capas más antiguas.

NO implementar otra lógica PEPS dentro del componente visual.

El cálculo PEPS pertenece al servicio PEPS existente.

---

# 12. STOCK

El indicador:

`Stock Base Activa`

debe provenir del sistema real.

No usar valores estáticos del prototipo.

No usar:

```text
320.00
```

como dato fijo.

Debe calcularse mediante los movimientos/servicio de Stock.

---

# 13. LOTES

El indicador:

`Lotes`

debe contar los lotes Base Activa reales.

Los lotes provienen de:

`LoteBaseActiva`

---

# 14. MOVIMIENTOS

El indicador:

`Movimientos`

debe contar los movimientos Base Activa reales.

Fuente:

`MovimientoBaseActiva`

---

# 15. LISTADO DE MOVIMIENTOS

Ordenar cronológicamente:

1. Fecha ascendente
2. ID ascendente como desempate

El saldo debe respetar ese orden.

---

# 16. VALIDACIONES

Antes de crear:

### Producto

Debe existir y ser:

`BASE_ACTIVA`

### Lote

Debe existir.

Debe pertenecer al producto seleccionado.

### Fecha

Obligatoria.

### Operación

Obligatoria.

### Tipo de movimiento

Obligatorio:

`ENTRADA` o `SALIDA`

### Cantidades

No aceptar valores negativos.

### Salida

No permitir salida superior al stock disponible.

El servicio debe validar nuevamente la disponibilidad; nunca confiar únicamente en la validación del frontend.

---

# 17. SERVER ACTION

Mantener arquitectura:

```text
Formulario
   ↓
Server Action
   ↓
Zod
   ↓
Service Base Activa
   ↓
Prisma transaction
   ↓
PEPS
```

La operación debe ejecutarse dentro de una transacción cuando se creen/actualicen datos relacionados.

---

# 18. NO MODIFICAR EL PROTOTIPO VISUAL

No reemplazar por:

- tarjetas CRUD genéricas
- tabla simple
- formulario vertical genérico
- diseño diferente
- columnas nuevas sin necesidad

La apariencia debe conservar:

- colores
- encabezados agrupados
- tabla compacta
- modal oscuro
- botones
- pestañas
- filtros
- estructura de columnas

---

# 19. EXPORTACIÓN

El módulo debe preparar la vista para exportación.

Formatos requeridos posteriormente:

- Excel
- PDF

IMPORTANTE:

No limitar la exportación a CSV.

El Excel y PDF deben respetar la estructura del reporte Base Activa.

---

# 20. REPORTE BASE ACTIVA

El reporte debe conservar la estructura del Excel/prototipo:

```text
REGISTRO DE INVENTARIO PERMANENTE VALORIZADO
DETALLE DEL INVENTARIO VALORIZADO - BASE ACTIVA
```

Cabecera:

- PERÍODO
- RUC
- DENOMINACIÓN O RAZÓN SOCIAL
- ESTABLECIMIENTO
- CÓDIGO DE LA EXISTENCIA
- TIPO (TABLA 5)
- DESCRIPCIÓN
- CÓDIGO DE LA UNIDAD DE MEDIDA
- MÉTODO DE VALUACIÓN: PEPS

Detalle:

- FECHA
- LOTE
- PRODUCTO
- UBICACIÓN
- RESPONSABLE
- TIPO DE OPERACIÓN
- ENTRADAS
- SALIDAS
- SALDO FINAL
- MOTIVO DE SALIDA
- FORMULACIÓN BASE ACTIVA

---

# 21. IMPLEMENTACIÓN POR ARCHIVOS

Crear/adaptar:

```text
src/
├── app/
│   └── dashboard/
│       └── base-activa/
│           ├── page.tsx
│           └── base-activa-module.tsx
│
├── actions/
│   └── base-activa.actions.ts
│
├── lib/
│   ├── services/
│   │   └── base-activa.service.ts
│   │
│   └── validators/
│       └── base-activa.schema.ts
```

Reutilizar:

```text
lib/db/prisma
```

y los servicios existentes de:

```text
peps
stock
productos
catalogos
```

---

# 22. ORDEN DE IMPLEMENTACIÓN

## Paso 1

Copiar/adaptar la estructura visual del módulo original.

## Paso 2

Eliminar los datos locales del prototipo.

## Paso 3

Conectar Productos.

## Paso 4

Conectar LoteBaseActiva.

## Paso 5

Conectar TipoOperacion.

## Paso 6

Conectar MovimientoBaseActiva.

## Paso 7

Conectar saldo.

## Paso 8

Conectar PEPS.

## Paso 9

Conectar Stock.

## Paso 10

Implementar filtros.

## Paso 11

Implementar exportación Excel/PDF.

## Paso 12

Probar con datos reales.

---

# 23. CRITERIOS DE ACEPTACIÓN

El módulo será aceptado únicamente si:

- Se ve como el prototipo.
- Producto carga desde Prisma.
- Solo muestra productos Base Activa.
- Lote carga desde `LoteBaseActiva`.
- Solo muestra lotes del producto seleccionado.
- Fecha funciona.
- Tipo Tabla 12 funciona.
- Entrada funciona.
- Salida funciona.
- Peso total se calcula correctamente.
- Saldo se calcula correctamente.
- No permite salidas sin stock.
- PEPS funciona.
- Stock se actualiza.
- Los indicadores son reales.
- La tabla muestra todos los grupos del prototipo.
- Observación y Almacenamiento permanecen separados.
- No utiliza localStorage para datos reales.
- No usa datos estáticos.
- No crea modelos duplicados.
- No rompe los módulos Productos ni Lotes.
- TypeScript compila sin errores.
- Prisma mantiene las relaciones.
- Excel y PDF podrán generarse con la estructura del reporte.

# REGLA FINAL

**NO REDISEÑAR.**

El módulo original es la referencia visual.

La nueva implementación solamente reemplaza:

```text
datos locales
      ↓
datos reales de Prisma
```

y conecta:

```text
Producto
   ↓
Lote
   ↓
Movimiento Base Activa
   ↓
PEPS
   ↓
Stock
   ↓
Reporte Excel/PDF
```

---

# 24. INTEGRACIÓN — REPORTE GENERAL BASE ACTIVA

## 24.1 OBJETIVO

Crear el módulo **Reporte General** dentro de **Base Activa (Materia Prima)**.

Este módulo debe generar el reporte oficial detallado de Base Activa,
siguiendo el formato del Registro de Inventario Permanente Valorizado
mostrado en el Excel y en la imagen de referencia.

El reporte debe mostrar:

1. Reporte detallado en pantalla.
2. Vista oficial de impresión.
3. Exportación Excel.
4. Exportación PDF.
5. Impresión.

El reporte debe utilizar exclusivamente los datos reales existentes
en PostgreSQL mediante Prisma.

NO utilizar datos ficticios.
NO escribir datos de ejemplo de forma fija.
NO inventar productos.
NO inventar lotes.
NO inventar movimientos.
NO inventar responsables.
NO inventar fechas.
NO agregar información que no corresponda.

---

## 24.2 MÓDULOS EXISTENTES QUE NO DEBEN MODIFICARSE

NO modificar:

- Configuración
- Catálogos
- Productos
- Lotes
- Kardex Base Activa
- Registrar Movimiento BA
- Usuarios

Estos módulos ya están creados.

El nuevo desarrollo corresponde únicamente a:

BASE ACTIVA
└── Reporte General

Y a los archivos estrictamente necesarios para soportarlo.

---

## 24.3 RUTA

Crear:

```text
src/app/dashboard/base-activa/reporte-general/
```

Por ejemplo:

```text
src/app/dashboard/base-activa/reporte-general/
├── page.tsx
└── reporte-general-base-activa-module.tsx
```

Respetar la arquitectura existente del proyecto.

No crear un módulo global llamado "Reportes".

---

## 24.4 MENÚ

El menú debe continuar siendo:

```text
BASE ACTIVA (MATERIA PRIMA)
├── Kardex Activa
├── Resumen Base Activa
├── Reporte General
└── Registrar Movimiento BA
```

No agregar:

- Reportes
- Reportes de Stock
- PEPS
- Capas PEPS
- Stock técnico

PEPS y stock son lógica interna.

---

## 24.5 OBJETIVO DEL REPORTE

El reporte representa:

```text
REGISTRO DE INVENTARIO PERMANENTE VALORIZADO
- DETALLE DEL INVENTARIO VALORIZADO -
BASE ACTIVA
```

Debe permitir consultar el detalle de movimientos de Base Activa
en un período determinado.

No es un resumen de stock.

No sustituye al Resumen Base Activa.

---

## 24.6 FILTROS

Los filtros deben ser únicamente los que corresponden al reporte.

Filtros principales:

- Producto
- Lote
- Fecha desde
- Fecha hasta

Diseño:

```text
Producto       Lote             Fecha desde       Fecha hasta

[Todos]        [Todos]          [01/08/2026]      [31/08/2026]

[ Consultar ]  [ Limpiar ]
```

---

## 24.7 FILTRO PRODUCTO

El selector Producto debe obtener productos reales de Base Activa.

No mostrar productos de Producto Terminado.

Los productos de Base Activa deben identificarse mediante:

```text
Producto.tipoInventario = BASE_ACTIVA
```

No crear una lista manual.

---

## 24.8 FILTRO LOTE

El selector Lote debe obtener:

```text
LoteBaseActiva
```

El lote debe estar relacionado con el producto seleccionado.

Si Producto = Todos:

mostrar todos los lotes Base Activa.

Si se selecciona un producto:

mostrar únicamente sus lotes.

Ejemplo:

```text
Producto:
Metarhizium anisopliae

Lotes:
MA2601-01
MA2604-02
MA2604-03
```

No mostrar lotes de otros productos.

---

## 24.9 FILTRO FECHA

Debe existir:

```text
Fecha desde
Fecha hasta
```

Ejemplo:

```text
01/08/2026
31/08/2026
```

El reporte debe mostrar solamente movimientos cuya fecha esté
dentro del rango seleccionado.

```text
Fecha >= Fecha desde
Fecha <= Fecha hasta
```

No incluir movimientos fuera del período.

---

## 24.10 VALIDACIÓN DE FECHAS

Si:

```text
Fecha desde > Fecha hasta
```

mostrar error de validación.

No ejecutar la consulta.

Si no existe fecha desde:

permitir consultar desde el inicio de información disponible.

Si no existe fecha hasta:

utilizar la última fecha disponible o la fecha actual según la lógica
existente del proyecto.

No inventar fechas.

---

## 24.11 BOTONES

En la parte superior del reporte:

```text
[ Excel ]
[ PDF ]
[ Imprimir ]
```

Todos deben utilizar exactamente los datos de la consulta actual.

No ejecutar una consulta diferente para cada formato.

---

## 24.12 ENCABEZADO OFICIAL

La vista del reporte debe reproducir el encabezado del Excel.

Título:

```text
REGISTRO DE INVENTARIO PERMANENTE VALORIZADO
- DETALLE DEL INVENTARIO VALORIZADO -
BASE ACTIVA
```

Debajo:

```text
PERÍODO:
RUC:
DENOMINACIÓN O RAZÓN SOCIAL:
ESTABLECIMIENTO:
CÓDIGO DE LA EXISTENCIA:
TIPO (TABLA 5):
DESCRIPCIÓN:
CÓDIGO DE LA UNIDAD DE MEDIDA (TABLA 6):
MÉTODO DE VALUACIÓN:
```

---

## 24.13 ORIGEN DE LOS DATOS DEL ENCABEZADO

PERÍODO:

Obtener del período seleccionado/relacionado con el reporte.

RUC:

Obtener de `Empresa.ruc`.

DENOMINACIÓN O RAZÓN SOCIAL:

Obtener de `Empresa.razonSocial`.

ESTABLECIMIENTO:

Obtener del establecimiento correspondiente.

CÓDIGO DE LA EXISTENCIA:

Obtener de `Producto.codigoExistencia`.

TIPO (TABLA 5):

Obtener del `TipoExistencia` relacionado al producto.

DESCRIPCIÓN:

Obtener de `Producto.descripcion`.

CÓDIGO DE LA UNIDAD DE MEDIDA (TABLA 6):

Obtener de `UnidadMedida` relacionada.

MÉTODO DE VALUACIÓN:

Obtener de `Producto.metodoValuacion`.

Actualmente debe corresponder a:

PEPS

No escribir PEPS como dato independiente si el producto ya lo tiene
registrado.

---

## 24.14 REGLA PARA EL ENCABEZADO

El encabezado corresponde al producto cuando el reporte está filtrado
por un producto.

Si se seleccionan múltiples productos:

NO inventar un único código de existencia o una única descripción.

En ese caso:

- mostrar información general de empresa/período/establecimiento
- permitir que el detalle contenga los diferentes productos

Si el formato oficial requiere una ficha individual por producto,
generar una sección por cada producto.

No mezclar códigos de existencia incompatibles.

---

## 24.15 TABLA PRINCIPAL

La tabla debe seguir la estructura del Excel.

Primer grupo:

DETALLE DEL REGISTRO

Columnas:

FECHA
CÓDIGO
DESCRIPCIÓN
OBSERVACIÓN
RESPONSABLE DEL REGISTRO

---

## 24.16 TIPO DE OPERACIÓN

Segundo grupo:

TIPO DE OPERACIÓN

Columna:

TIPO DE OPERACIÓN
(TABLA 12)

Utilizar el nombre de la operación existente en:

`TipoOperacion`

Ejemplos reales pueden incluir:

INVENTARIO INICIAL

No crear operaciones adicionales.

---

## 24.17 ENTRADAS

Grupo:

ENTRADAS

Columnas:

UND
PESO UNITARIO
PESO TOTAL

Para cada movimiento:

```text
entradaUnd
entradaPesoUnitarioKg
entradaPesoTotalKg
```

Mostrar vacío cuando no corresponda.

No colocar 0 si el formato existente utiliza celda vacía.

Mantener la representación del Excel.

---

## 24.18 SALIDAS

Grupo:

SALIDAS

Columnas:

UND
PESO UNITARIO
PESO TOTAL

Utilizar:

```text
salidaUnd
salidaPesoUnitarioKg
salidaPesoTotalKg
```

Mostrar solamente cuando corresponda al movimiento.

---

## 24.19 SALDO FINAL

Grupo:

SALDO FINAL

Columnas:

UND
PESO UNITARIO
PESO TOTAL

Utilizar el saldo correspondiente al movimiento.

El saldo debe ser coherente con Kardex Base Activa.

No calcular un saldo diferente al utilizado por el Kardex.

---

## 24.20 MOTIVO DE SALIDA

Grupo:

MOTIVO DE SALIDA

Subcampo:

FORMULACIÓN

Y:

Tipo

Mostrar únicamente información existente.

No agregar:

```text
Venta
Producción
Ensayo
```

porque esos motivos pertenecen al Producto Terminado.

En Base Activa utilizar únicamente los datos correspondientes a
formulación/motivo existentes.

---

## 24.21 REGISTRO DE CANTIDAD FINAL DE BASE ACTIVA

Grupo:

REGISTRO DE CANTIDAD FINAL DE BASE ACTIVA

Columnas:

RESPONSABLE DE LA FORMULACIÓN
CANTIDAD DE PRODUCTO FORMULADO
ALMACENAMIENTO

Utilizar:

```text
responsableFormulacion
cantidadProductoFormuladoKg
almacenamiento
```

No confundir:

OBSERVACIÓN

con:

ALMACENAMIENTO

Son campos diferentes.

---

## 24.22 OBSERVACIÓN Y ALMACENAMIENTO

Regla obligatoria:

```text
OBSERVACIÓN ≠ ALMACENAMIENTO
```

Ejemplo:

```text
Observación:
CUARTO FRIO

Almacenamiento:
CUARTO FRIO
```

Aunque puedan tener el mismo texto en determinados registros,
siguen siendo conceptos diferentes.

No copiar automáticamente uno sobre otro.

---

## 24.23 RESPONSABLE

RESPONSABLE DEL REGISTRO:

Debe provenir del usuario/responsable asociado al movimiento.

No escribir nombres fijos.

Ejemplo de referencia del Excel:

YOBER GARCIA CABRERA

Este valor solamente debe aparecer si existe realmente en la base
de datos.

---

## 24.24 FECHA

La fecha de cada fila debe provenir de:

`MovimientoBaseActiva.fecha`

No utilizar:

- fecha actual
- fecha de creación
- fecha de actualización

si no corresponde a la fecha del movimiento.

---

## 24.25 CÓDIGO

La columna:

CÓDIGO

debe utilizar el código del producto registrado en el sistema.

Ejemplos de Base Activa:

BB
MA
PL
IF
LL
TA
TH
TV

No agregar prefijos.

No modificar los códigos.

---

## 24.26 DESCRIPCIÓN

Debe mostrar la descripción real del producto.

Ejemplos:

Beauveria bassiana
Metarhizium anisopliae
Purpureocillium lilacinum
Isaria fumosorosea
Lecanicillium lecanii
Trichoderma asperellum
Trichoderma harzianum
Trichoderma viride

No escribir manualmente estas descripciones.

Obtenerlas de Producto.

---

## 24.27 LOTE

El Excel de referencia utiliza el lote dentro del código/detalle
del registro.

El reporte debe mostrar el lote real asociado:

`MovimientoBaseActiva.lote`

No crear lotes.

No modificar códigos de lote.

Ejemplos de referencia:

MA2601-01
MA2604-02
MA2604-03

---

## 24.28 ORDEN DE LOS MOVIMIENTOS

Ordenar cronológicamente:

```text
fecha ASC
```

En caso de empate:

```text
id ASC
```

Esto garantiza que el reporte tenga un orden determinístico.

---

## 24.29 SALDO

El saldo debe seguir la lógica del Kardex Base Activa.

Para peso:

saldoPesoTotalKg

Debe ser coherente con:

Entradas - Salidas

considerando el historial anterior cuando sea necesario para obtener
el saldo correcto a la fecha del reporte.

No calcular simplemente:

SUM(entradas del filtro) - SUM(salidas del filtro)

si eso produce un saldo incorrecto por existir stock anterior al
rango consultado.

---

## 24.30 STOCK FINAL

Al final del reporte mostrar:

```text
STOCK AL DD/MM/YYYY: XXX KG
```

La fecha debe corresponder a:

Fecha hasta

El valor debe ser el stock real de Base Activa a esa fecha.

No usar un valor fijo.

---

## 24.31 FILTRO Y STOCK INICIAL

Cuando se consulte:

```text
01/08/2026 - 31/08/2026
```

pero exista stock anterior al 01/08/2026:

El reporte debe considerar el saldo previo para construir correctamente
el saldo acumulado.

No perder el saldo anterior solamente porque el movimiento está fuera
del filtro visual.

La consulta de movimientos y el cálculo del saldo son conceptos
diferentes.

---

## 24.32 TOTALES

Al final de la tabla mostrar:

TOTALES

Los totales deben calcularse dinámicamente.

Para entradas:

Total unidades
Total peso

Para salidas:

Total unidades
Total peso

Para saldo:

Saldo final real

No escribir:

531

u otro número fijo.

---

## 24.33 REFERENCIA REAL DE LA IMAGEN

La imagen contiene movimientos como:

```text
12/08/2026
MA2601-01
MA
INVENTARIO INICIAL
saldo 120 KG

12/08/2026
MA2601-01
MA
INVENTARIO INICIAL
saldo 4 KG

12/08/2026
MA2601-01
MA
INVENTARIO INICIAL
saldo 8 KG

12/08/2026
MA2604-02
MA
INVENTARIO INICIAL
saldo 216 KG

12/08/2026
MA2604-03
MA
INVENTARIO INICIAL
saldo 180 KG

12/08/2026
MA2604-03
MA
INVENTARIO INICIAL
saldo 3 KG
```

Estos datos sirven únicamente para validar que el diseño coincide
con el documento de referencia.

NO codificarlos como datos iniciales.

El sistema debe obtenerlos de PostgreSQL.

---

## 24.34 DISEÑO VISUAL

La pantalla debe seguir el patrón del prototipo existente.

Utilizar:

- fondo claro
- tarjetas blancas
- verde institucional
- bordes discretos
- tabla compacta
- encabezados agrupados
- controles de filtro
- botones de exportación
- diseño administrativo

No utilizar un CRUD genérico.

---

## 24.35 TABLA AGRUPADA

La tabla debe tener encabezados agrupados visualmente.

Ejemplo:

```text
┌──────────────────────┬──────────────┬───────────────┬─────────────┐
│ DETALLE DEL REGISTRO │ TIPO OPERACIÓN│ ENTRADAS      │ SALIDAS     │
├────┬────┬────┬───────┼──────────────┼────┬────┬─────┼────┬────┬────┤
│FECHA│COD│DESC│OBSERV.│ TABLA 12     │UND │P.U.│TOTAL│UND │P.U.│TOTAL│
└────┴────┴────┴───────┴──────────────┴────┴────┴─────┴────┴────┴────┘
```

Continuar con:

SALDO FINAL
MOTIVO DE SALIDA
REGISTRO DE CANTIDAD FINAL DE BASE ACTIVA

---

## 24.36 COLORES DE LOS GRUPOS

Seguir el Excel de referencia.

DETALLE DEL REGISTRO:
verde

TIPO DE OPERACIÓN:
verde

ENTRADAS:
verde

SALIDAS:
verde

SALDO FINAL:
azul

MOTIVO DE SALIDA:
verde

REGISTRO DE CANTIDAD FINAL:
verde claro

No exagerar los colores.

La prioridad es reproducir el formato institucional.

---

## 24.37 LOGO

Utilizar el logo institucional existente en el proyecto.

No crear otro logo.

No utilizar un logo ficticio.

Ubicarlo en la zona superior derecha del reporte, siguiendo la
referencia del Excel.

---

## 24.38 INFORMACIÓN DE EMPRESA

Utilizar:

`Empresa.ruc`
`Empresa.razonSocial`

No escribir:

```text
BIOALTERNATIVA E&F S.A.C.
```

como texto fijo.

Debe provenir de la configuración de empresa existente.

---

## 24.39 ESTABLECIMIENTO

Utilizar el establecimiento real seleccionado/asociado.

Ejemplo de referencia:

```text
HUANCHACO - LAS LOMAS
```

No escribirlo fijo.

Obtenerlo de:

`Establecimiento`

---

## 24.40 MÉTODO DE VALUACIÓN

Mostrar:

PEPS

cuando el producto tenga:

`MetodoValuacion.PEPS`

No crear una pantalla PEPS.

La lógica PEPS continúa siendo interna.

---

## 24.41 EXPORTACIÓN EXCEL

Generar:

.xlsx

No generar CSV.

El Excel debe conservar la estructura del reporte.

Debe incluir:

- título
- información de empresa
- período
- establecimiento
- producto
- unidad
- método
- tabla agrupada
- movimientos
- totales
- stock final

No exportar filtros ni elementos del dashboard.

---

## 24.42 EXPORTACIÓN PDF

El PDF debe representar el reporte oficial.

Debe ser adecuado para:

- archivo
- impresión
- presentación institucional

Debe incluir:

logo
encabezado
tabla
totales
stock
firmas/responsables cuando existan

No agregar información inexistente.

---

## 24.43 IMPRESIÓN

El botón:

`Imprimir`

debe imprimir únicamente el reporte.

Ocultar:

- menú lateral
- filtros
- botones
- navegación
- elementos propios del dashboard

Utilizar estilos:

```text
@media print
```

---

## 24.44 RESPONSABLE Y APROBACIÓN

Si el proyecto ya tiene datos de responsable:

mostrar:

```text
Elaborado por:
[NOMBRE REAL]

[CARGO REAL]

Para:

Aprobado por:
```

mostrar solamente información existente.

Si no existe información de aprobación:

NO inventar:

```text
Ing. Responsable
```

ni ningún otro nombre.

Puede dejarse el espacio institucional correspondiente.

---

## 24.45 SERVICIOS

Reutilizar los servicios existentes.

Preferentemente:

```text
src/lib/services/base-activa.service.ts
src/lib/services/stock.service.ts
src/lib/services/reportes.service.ts
```

No duplicar consultas innecesariamente.

Si `reportes.service.ts` ya contiene funciones relacionadas,
extenderlas solamente cuando sea necesario.

---

## 24.46 PRISMA

NO crear nuevas tablas.

Utilizar los modelos existentes:

```text
Empresa
Periodo
Establecimiento
UnidadMedida
TipoExistencia
Producto
LoteBaseActiva
MovimientoBaseActiva
TipoOperacion
Almacenamiento
CapaPEPSBase
AplicacionPEPSBase
```

No modificar el esquema Prisma salvo que sea estrictamente necesario
y esté justificado por una carencia real.

---

## 24.47 PEPS

No implementar nuevamente PEPS dentro de la interfaz.

El reporte debe consumir la información calculada por el sistema.

PEPS es lógica de negocio.

No agregar al menú:

PEPS

ni:

Capas PEPS

ni:

Aplicaciones PEPS

---

## 24.48 NO CONFUNDIR CON PRODUCTO TERMINADO

Este módulo es exclusivamente:

BASE ACTIVA

No incluir campos de Producto Terminado como:

- presentación
- venta
- factura
- boleta
- guía
- empresa destino
- ingeniero de campo
- motivo PRODUCCIÓN
- motivo VENTA
- motivo ENSAYO

Esos datos pertenecen al módulo Producto Terminado.

---

## 24.49 NO CONFUNDIR CON RESUMEN BASE ACTIVA

Resumen Base Activa:

```text
DESCRIPCIÓN
CÓDIGO
LOTE
STOCK TOTAL EN KG
OBSERVACIONES
```

Reporte General:

```text
DETALLE COMPLETO DE MOVIMIENTOS
```

No mezclar las dos pantallas.

---

## 24.50 DATOS VACÍOS

Cuando un campo no corresponda al movimiento:

mantenerlo vacío.

No mostrar:

0
N/A
-

automáticamente si el formato oficial utiliza celdas vacías.

Respetar la representación del Excel.

---

## 24.51 VALIDACIONES

Antes de mostrar el reporte comprobar:

- Producto existe.
- Producto pertenece a BASE_ACTIVA.
- Lote pertenece al producto.
- Fecha desde es válida.
- Fecha hasta es válida.
- Fecha desde <= Fecha hasta.
- Movimientos corresponden a Base Activa.

---

## 24.52 SEGURIDAD

La consulta debe respetar los permisos existentes.

No permitir que un usuario sin permiso pueda consultar información
si el sistema ya maneja permisos para este módulo.

No modificar el sistema de permisos existente.

---

## 24.53 AUDITORÍA

Consultar/reportar no debe generar una mutación de inventario.

No crear AuditLog por cada lectura salvo que la arquitectura existente
defina explícitamente auditoría de consultas.

Las operaciones de creación/modificación de movimientos continúan
siendo responsabilidad del módulo Registrar Movimiento BA.

---

## 24.54 RENDIMIENTO

No cargar todos los movimientos innecesariamente.

Aplicar filtros directamente en Prisma cuando sea posible.

Filtrar por:

producto
lote
fecha

antes de procesar el resultado.

Si el cálculo de saldo requiere movimientos anteriores,
consultar únicamente la información necesaria.

---

## 24.55 RESPONSIVE

La pantalla debe funcionar en escritorio.

La tabla oficial puede requerir desplazamiento horizontal en pantallas
pequeñas.

No destruir la estructura del reporte para hacerlo responsive.

Para impresión utilizar formato horizontal cuando sea necesario.

---

## 24.56 RESULTADO VISUAL ESPERADO

La pantalla debe seguir esta estructura:

```text
BASE ACTIVA (MATERIA PRIMA)
>
REPORTE GENERAL

┌─────────────────────────────────────────────────────────────┐
│ Producto │ Lote │ Fecha desde │ Fecha hasta │ Consultar    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ REPORTE GENERAL BASE ACTIVA             Excel PDF Imprimir  │
│                                                             │
│ REGISTRO DE INVENTARIO PERMANENTE VALORIZADO                │
│ - DETALLE DEL INVENTARIO VALORIZADO - BASE ACTIVA           │
│                                                             │
│ PERÍODO:                    2026                             │
│ RUC:                        [real]                           │
│ DENOMINACIÓN:               [real]                           │
│ ESTABLECIMIENTO:            [real]                           │
│ CÓDIGO EXISTENCIA:          [real]                           │
│ TIPO TABLA 5:               [real]                           │
│ DESCRIPCIÓN:                [real]                           │
│ UNIDAD TABLA 6:             [real]                           │
│ MÉTODO VALUACIÓN:           PEPS                             │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ DETALLE │ OPERACIÓN │ ENTRADAS │ SALIDAS │ SALDO │ ... │ │
│ ├─────────┼───────────┼──────────┼─────────┼───────┼─────┤ │
│ │ ...     │ ...       │ ...      │ ...     │ ...   │ ... │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ TOTALES                                                     │
│                                                             │
│ STOCK AL DD/MM/YYYY: XXXX KG                                │
│                                                             │
│ Elaborado por:                  Aprobado por:               │
└─────────────────────────────────────────────────────────────┘
```

---

## 24.57 CRITERIO PRINCIPAL

El Excel y la imagen son la referencia visual y estructural.

La base de datos es la fuente de verdad de los datos.

Por lo tanto:

```text
IMAGEN → define formato
EXCEL  → define estructura y columnas
PRISMA / POSTGRESQL → define los datos reales
KARDEX BASE ACTIVA  → define la coherencia del saldo
PEPS                → define la valorización interna
```

---

## 24.58 NO HACER

NO:

- crear datos demo
- crear productos adicionales
- crear lotes adicionales
- modificar códigos
- modificar módulos existentes
- crear tablas nuevas sin necesidad
- crear menú Reportes
- crear menú PEPS
- agregar campos de PT
- agregar campos fiscales que no correspondan
- agregar precios
- agregar proveedores
- agregar clientes
- agregar categorías
- agregar marcas
- agregar Tipo de Afectación
- inventar responsables
- inventar firmas
- inventar cargos
- escribir fechas fijas
- escribir stocks fijos
- escribir totales fijos
- exportar CSV en lugar de Excel

---

## 24.59 PRUEBAS OBLIGATORIAS

Probar:

1. Todos los productos + todos los lotes.
2. Un producto específico.
3. Un lote específico.
4. Rango de fechas.
5. Producto + lote.
6. Producto + fechas.
7. Producto + lote + fechas.
8. Sin resultados.
9. Fecha inválida.
10. Fecha desde mayor que fecha hasta.
11. Stock anterior al rango.
12. Movimiento de entrada.
13. Movimiento de salida.
14. Movimiento con formulación.
15. Movimiento sin formulación.
16. Excel.
17. PDF.
18. Impresión.

---

## 24.60 VALIDACIÓN FINAL

Antes de terminar comprobar:

- Ruta correcta.
- Menú correcto.
- No se modificaron módulos terminados.
- Filtros funcionan.
- Producto filtra correctamente.
- Lote depende del producto.
- Fecha desde funciona.
- Fecha hasta funciona.
- Solo aparecen movimientos Base Activa.
- Los datos vienen de PostgreSQL.
- Encabezado coincide con Excel.
- Columnas coinciden con Excel.
- Entradas correctas.
- Salidas correctas.
- Saldo correcto.
- Formulación correcta.
- Almacenamiento correcto.
- Observación independiente de almacenamiento.
- Totales dinámicos.
- Stock final dinámico.
- Excel funciona.
- PDF funciona.
- Imprimir funciona.
- No existen datos fijos de la imagen.
- No existen datos ficticios.
- No se crean tablas innecesarias.
- No se duplica la lógica PEPS.
- No se duplica la lógica de Stock.
- El resultado coincide con Kardex Base Activa.

---

# REGLA FINAL

**NO REDISEÑAR.**

El módulo original es la referencia visual.

La nueva implementación solamente reemplaza:

```text
datos locales
      ↓
datos reales de Prisma
```

y conecta:

```text
Producto
   ↓
Lote
   ↓
Movimiento Base Activa
   ↓
PEPS
   ↓
Stock
   ↓
Reporte Excel/PDF
   ↓
Reporte General
```
