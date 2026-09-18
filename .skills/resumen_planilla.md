---
name: resumen-planilla-kardex
version: 1.0.0
description: Skill para implementar el módulo de Resumen de Planilla del sistema Kardex e Inventario, mostrando vista resumida de existencias por producto/lote con formato institucional.
---

# SKILL: RESUMEN DE PLANILLA — KARDEX E INVENTARIO

## 1. OBJETIVO

Crear el módulo de Resumen de Planilla que proporcione una vista consolidada de las existencias por producto y lote, con dos representaciones:

1. **REPORTE NORMAL**: Vista tabular estándar para consulta
2. **PLANTILLA INSTITUCIONAL**: Formato oficial con encabezado empresarial

El módulo debe integrarse con la información existente sin modificar módulos ya implementados.

**IMPORTANTE:**
- NO crear información ficticia
- NO agregar columnas que no correspondan
- NO modificar módulos existentes
- NO duplicar lógica de cálculo de stock
- Utilizar servicios existentes para obtener datos

---

## 2. UBICACIÓN

Crear el nuevo módulo en:

```
src/app/dashboard/resumen-planilla/
├── page.tsx
└── resumen-planilla-module.tsx
```

La ruta debe estar disponible en:
`/dashboard/resumen-planilla`

---

## 3. CONCEPTO DEL MÓDULO

El Resumen de Planilla muestra la situación resumida de existencias por producto/lote.

**NO es el Reporte General** que muestra el detalle oficial de movimientos.

**Resumen de Planilla:**
- Existencias/lotes/stock a una fecha específica
- Vista consolidada por producto
- Formato institucional para impresión

**Reporte General:**
- Detalle oficial de movimientos
- Formato Excel con todas las columnas
- Datos históricos completos

No mezclar ambos conceptos.

---

## 4. FILTROS

Los filtros deben ser únicamente los necesarios para el resumen:

- **Producto**: Selección de producto específico o todos
- **Lote**: Selección de lote específico o todos (dependiente del producto)
- **Fecha a consultar**: Fecha hasta la cual se desea consultar el stock

**Diseño:**
```
┌──────────────────────────────────────────────────────────────┐
│ Producto        │ Lote            │ Fecha a consultar        │
│ [Todos]         │ [Todos]         │ [31/08/2026]             │
│                                                              │
│                  [ Consultar ] [ Limpiar ]                   │
└──────────────────────────────────────────────────────────────┘
```

---

## 5. REPORTE NORMAL

Mostrar una sección denominada **REPORTE NORMAL** con:

- Tarjeta/panel blanco con bordes suaves
- Encabezado: "REPORTE NORMAL"
- Botones superiores: [Excel] [PDF] [Imprimir]
- Tabla con columnas exactas:

| DESCRIPCIÓN | CÓDIGO | LOTE | STOCK TOTAL EN KG | OBSERVACIONES |
|-------------|--------|------|-------------------|---------------|

**NO incluir:**
- categoría
- marca
- tipo de afectación
- costo
- precio
- usuario
- fecha de ingreso
- almacén adicional
- PEPS
- documento
- proveedor
- cliente

---

## 6. DATOS DEL REPORTE NORMAL

### DESCRIPCIÓN
- Debe provenir de `Producto.descripcion`
- Ejemplo: "Metarhizium anisopliae"

### CÓDIGO
- Debe provenir del código del producto
- Ejemplos: BB, MA, PL, IF, LL, TA, TH, TV

### LOTE
- Debe provenir de `LoteBaseActiva.codigo`
- Ejemplos: BB2607-09, MA2601-01, MA2604-02

### STOCK TOTAL EN KG
- Calcular a partir de movimientos hasta la fecha seleccionada
- Fórmula: ENTRADAS - SALIDAS
- No almacenar stock ficticio

### OBSERVACIONES
- Mostrar únicamente la observación correspondiente cuando exista
- No utilizar para: ubicación, almacenamiento, responsable, motivo, formulación

---

## 7. ORDEN DEL REPORTE

Ordenar resultados de manera consistente:
1. DESCRIPCIÓN
2. CÓDIGO
3. LOTE

---

## 8. TOTAL GENERAL

Al final de la tabla mostrar:
```
TOTAL GENERAL | | | [TOTAL] KG |
```

El valor debe calcularse dinámicamente. Nunca escribir valores fijos.

---

## 9. PLANTILLA / VISTA PRELIMINAR

Debajo del reporte normal mostrar **PLANTILLA / VISTA PRELIMINAR** con formato institucional:

- Logo empresarial
- Razón social: "BIOALTERNATIVA E&F S.A.C."
- Título: "CUADRO RESUMEN DE INVENTARIO"
- Fecha seleccionada por el usuario
- Tabla con mismos datos que el reporte normal
- Subtotales por producto cuando correspondan
- Total general
- Texto inferior: "Informe al DD-MM-YYYY"
- "Elaborado por:" y "Aprobado por:" con espacios para firmas

---

## 10. AGRUPACIÓN DE PRODUCTOS

La plantilla institucional puede agrupar lotes del mismo producto:

```
Metarhizium anisopliae

MA2601-01 → 132
MA2604-02 → 216
MA2604-03 → 183

Total → 531

Kilogramos
```

La agrupación debe hacerse únicamente cuando existan varios lotes del mismo producto.

---

## 11. PRODUCTOS REALES

Utilizar únicamente los productos Base Activa registrados:
- BB (Beauveria bassiana)
- MA (Metarhizium anisopliae)
- PL (Purpureocillium lilacinum)
- IF (Isaria fumosorosea)
- LL (Lecanicillium lecanii)
- TA (Trichoderma asperellum)
- TH (Trichoderma harzianum)
- TV (Trichoderma viride)

NO usar códigos como BA-BB, PT-BB, BASE-BB.

---

## 12. SUBTOTALES

Cuando un producto tenga varios lotes, mostrar:

```
Producto: Metarhizium anisopliae

MA2601-01    132
MA2604-02    216
MA2604-03    183

Subtotal: 531

Observación: Kilogramos
```

Si solo existe un lote, no es obligatorio mostrar subtotal independiente.

---

## 13. TOTAL GENERAL EN PLANTILLA

Al final de la plantilla:
```
TOTAL GENERAL
```

Debe sumar el stock vigente a la fecha consultada, no movimientos históricos.

---

## 14. TEXTO INSTITUCIONAL INFERIOR

**Izquierda:**
```
Informe al DD-MM-YYYY
```
La fecha debe corresponder a la fecha seleccionada.

**Centro:**
```
Elaborado por:

[NOMBRE DEL RESPONSABLE]

[ CARGO ]
```

**Derecha:**
```
Aprobado por:

[ RESPONSABLE ]
```

---

## 15. BOTONES DE EXPORTACIÓN

Tanto el Reporte Normal como la Plantilla deben tener:
- [Excel]
- [PDF]
- [Imprimir]

Los tres deben funcionar correctamente.

---

## 16. EXCEL

- Generar archivo `.xlsx` (no CSV)
- Conservar: encabezados, columnas, datos, totales, agrupaciones
- Utilizar mismos datos mostrados en pantalla
- No crear segunda consulta diferente

---

## 17. PDF

- Representar la plantilla institucional
- Contener: logo, razón social, título, fecha, tabla, subtotales, total, firmas
- Preparado para impresión
- No incluir información que no aparezca en la plantilla

---

## 18. IMPRESIÓN

El botón Imprimir debe imprimir únicamente el reporte correspondiente.

**No imprimir:**
- menú lateral
- filtros
- botones
- dashboard
- navegación

Utilizar `@media print` para ocultar elementos de navegación.

---

## 19. ARQUITECTURA

**No crear nuevas tablas.** Utilizar modelos existentes:
- Producto
- LoteBaseActiva
- MovimientoBaseActiva
- Empresa
- Periodo
- Establecimiento
- Almacenamiento

**Servicios existentes:**
- `src/lib/services/stock.service.ts` (para obtener stock)
- `src/lib/services/reportes.service.ts` (reutilizar si es necesario)

No duplicar lógica de stock.

---

## 20. REGLA DE STOCK

El stock debe ser consistente con Kardex Base Activa.

Si Kardex muestra:
```
ENTRADA 100 KG
SALIDA 20 KG
```

El resumen debe mostrar:
```
80 KG
```

No implementar cálculo diferente.

---

## 21. FILTROS DETALLADOS

### Por Fecha
La fecha seleccionada representa "Stock existente hasta esta fecha".

Ejemplo: Fecha 24/08/2026
Solo considerar movimientos <= 24/08/2026

### Por Producto
- Producto = Todos: mostrar todos los productos Base Activa
- Producto específico: mostrar solo ese producto y sus lotes

### Por Lote
- Lote = Todos: mostrar todos los lotes correspondientes
- Lote específico: mostrar solo ese lote

---

## 22. INTERFAZ

Mantener patrón visual:
- fondo claro
- tarjetas blancas
- verde institucional
- bordes suaves
- botones compactos
- tablas con bordes
- títulos en mayúsculas donde corresponda
- diseño administrativo
- responsive

No convertir en CRUD genérico. Debe parecer módulo de sistema de inventario.

---

## 23. NO AGREGAR INFORMACIÓN

**NO agregar a este resumen:**
- precio de venta
- proveedor
- cliente
- factura
- guía
- costo PEPS
- categoría
- marca
- tipo de afectación
- usuario de cada movimiento
- responsable de formulación
- cantidad formulada
- documento de traslado
- motivo de salida

Estos datos corresponden a otros módulos/reportes.

---

## 24. DIFERENCIA CON REPORTE GENERAL

**Resumen de Planilla:**
- DESCRIPCIÓN
- CÓDIGO
- LOTE
- STOCK TOTAL EN KG
- OBSERVACIONES

**Reporte General:**
- PERÍODO
- RUC
- RAZÓN SOCIAL
- ESTABLECIMIENTO
- CÓDIGO DE EXISTENCIA
- TIPO
- DESCRIPCIÓN
- UNIDAD
- MÉTODO PEPS
- DETALLE DEL REGISTRO
- OPERACIÓN
- ENTRADAS
- SALIDAS
- SALDO
- MOTIVO
- FORMULACIÓN
- ALMACENAMIENTO

NO mezclar las dos estructuras.

---

## 25. REGLAS DE INTEGRACIÓN

Antes de crear archivos nuevos:
1. Revisar imports existentes
2. Revisar servicios existentes
3. Revisar tipos existentes
4. Revisar modelo Prisma
5. Reutilizar funciones existentes
6. No duplicar modelos
7. No duplicar servicios
8. No modificar módulos marcados como terminados

---

## 26. ARCHIVOS A CREAR

Crear únicamente los archivos necesarios:

```
src/app/dashboard/resumen-planilla/page.tsx
src/app/dashboard/resumen-planilla/resumen-planilla-module.tsx
```

Si la arquitectura existente separa actions/services/validators, crear solo los archivos específicos necesarios.

---

## 27. RESULTADO FINAL

La pantalla debe quedar conceptualmente así:

```
RESUMEN DE PLANILLA

┌───────────────────────────────────────────────────────────────┐
│ Producto        Lote          Fecha a consultar               │
│ [Todos]         [Todos]       [24/08/2026]                    │
│                         [Consultar] [Limpiar]                 │
└───────────────────────────────────────────────────────────────┘


REPORTE NORMAL

┌───────────────────────────────────────────────────────────────┐
│                              Excel   PDF   Imprimir            │
│                                                               │
│ DESCRIPCIÓN | CÓDIGO | LOTE | STOCK TOTAL EN KG | OBSERV.   │
│                                                               │
│ ...                                                           │
│                                                               │
│ TOTAL GENERAL                         XXXX KG                 │
└───────────────────────────────────────────────────────────────┘


PLANTILLA / VISTA PRELIMINAR

┌───────────────────────────────────────────────────────────────┐
│                    LOGO                                       │
│             BIOALTERNATIVA E&F S.A.C.                         │
│      CUADRO RESUMEN DE INVENTARIO                             │
│                                             Fecha: XX/XX/XXXX │
│                                                               │
│ DESCRIPCIÓN | CODIGO | LOTE | STOCK TOTAL EN KG | OBSERV.   │
│                                                               │
│ ...                                                           │
│                                                               │
│ Informe al XX-XX-XXXX                                         │
│                                                               │
│              Elaborado por:        Aprobado por:              │
│              Responsable           Responsable                │
└───────────────────────────────────────────────────────────────┘
```

---

## 28. VALIDACIÓN FINAL

Antes de finalizar verificar:
- [ ] El menú existente no fue modificado innecesariamente
- [ ] Kardex Base Activa sigue funcionando
- [ ] Registrar Movimiento BA sigue funcionando
- [ ] Productos sigue funcionando
- [ ] Lotes sigue funcionando
- [ ] El resumen obtiene datos reales de PostgreSQL
- [ ] Producto filtra correctamente
- [ ] Lote filtra correctamente
- [ ] Fecha filtra correctamente
- [ ] El stock coincide con Kardex
- [ ] No aparecen productos PT
- [ ] No aparecen códigos PT
- [ ] No se inventan datos
- [ ] Reporte Normal funciona
- [ ] Plantilla funciona
- [ ] Excel funciona
- [ ] PDF funciona
- [ ] Imprimir funciona
- [ ] La plantilla conserva el formato institucional
- [ ] El total general es dinámico
- [ ] Los subtotales son dinámicos
- [ ] No existen valores fijos de la imagen en el código
- [ ] No se crean tablas Prisma nuevas
- [ ] No se modifica PEPS innecesariamente
- [ ] No se modifica ningún módulo terminado

---

## 29. STACK TECNOLÓGICO

Respetar el stack actual del proyecto:
- Next.js App Router
- React
- TypeScript
- pnpm
- PostgreSQL
- Prisma ORM
- Tailwind CSS
- shadcn/ui
- Server Actions
- Servicios
- Zod

NO introducir otra arquitectura si no es necesaria.

---

## 30. REGLA PRINCIPAL

**ANTES DE CAMBIAR CÓDIGO:**
1. Revisar lo que ya existe
2. Reutilizar servicios y componentes existentes
3. No duplicar modelos
4. No duplicar lógica
5. Comparar la UI con el prototipo
6. Hacer únicamente los cambios necesarios

La prioridad es:
```
PROTOTIPO VISUAL
        +
LÓGICA DEL NEGOCIO
        +
ARQUITECTURA EXISTENTE
        +
PRISMA/POSTGRES
```

No crear una aplicación diferente.