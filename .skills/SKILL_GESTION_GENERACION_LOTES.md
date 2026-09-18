---
name: gestion-generacion-lotes
version: 1.0.0
description: Integración del módulo Gestión y Generación de Lotes para Base Activa, respetando el prototipo y la arquitectura existente.
---

# SKILL — GESTIÓN Y GENERACIÓN DE LOTES

## Objetivo

Integrar el módulo **Gestión y Generación de Lotes** al proyecto Kardex existente.

No rehacer el sistema. No crear un CRUD genérico. Mantener el diseño del prototipo y reutilizar la arquitectura existente de Next.js, Prisma, PostgreSQL, Server Actions, Services, Validators y componentes.

## Datos del formulario

El formulario debe solicitar únicamente:

### 1. Lote *
- Tipo: texto.
- Obligatorio.
- Ejemplos: `TH2026-01`, `BB2026-01`, `MA2026-01`.
- Debe ser único.
- No generar un código diferente si el usuario proporciona el lote.

### 2. Producto *
- Tipo: selector.
- Obligatorio.
- Guardar `productoId`.
- Mostrar únicamente productos cuyo `tipoInventario = BASE_ACTIVA`.
- No mostrar productos terminados.

Ejemplo:
`Trichoderma harzianum (TH)`

### 3. Fecha *
- Tipo: fecha.
- Obligatoria.
- Mapear a la fecha de ingreso del lote existente.
- Puede iniciar con la fecha actual como valor sugerido, pero debe poder modificarse.

### 4. Peso
- Tipo: número decimal.
- NO obligatorio.
- Valor por defecto: `0`.
- Permitir `0`.
- Permitir decimales.
- No permitir valores negativos.

Ejemplos:
`0`, `15.00`, `25.50`.

### 5. Ubicación
- Tipo: selector o control existente para almacenamiento/ubicación.
- NO obligatorio.
- Puede quedar vacío/null.
- No poner `*`.
- Si no existe ubicación, mostrar `—` en el listado.

## Diseño

Seguir el prototipo proporcionado:

- Modal centrado.
- Fondo oscurecido.
- Encabezado oscuro.
- Tarjeta blanca.
- Bordes redondeados.
- Campos compactos.
- Botón verde `Generar Lote`.
- Tabla de lotes debajo.
- Icono de eliminar.
- Diseño responsive.

Estructura visual:

```text
Gestión y Generación de Lotes

Producto *                         Lote *
[ Trichoderma harzianum (TH) ▼ ]   [ TH2026-01 ]

Fecha *                             Peso Unitario (Kg)
[ 01/09/2026 ]                      [ 0.00 ]

Ubicación
[ CUARTO FRIO ▼ ]

                         [ Generar Lote ]
```

## Listado

Mostrar:

- Lote
- Producto
- Fecha
- Peso Unit.
- Ubicación
- Acción

Ejemplo:

```text
TH2026-01 | Trichoderma harzianum | 01/09/2026 | 25.00 Kg | CUARTO FRIO
BB2026-01 | Beauveria bassiana    | 01/09/2026 | 20.00 Kg | CUARTO FRIO
MA2026-01 | Metarhizium anisopliae| 01/09/2026 | 0.00 Kg  | —
```

## Reglas de negocio

1. Solo se pueden asociar lotes a productos **Base Activa**.
2. El lote es obligatorio y único.
3. La fecha es obligatoria.
4. El peso es opcional y por defecto vale `0`.
5. El peso nunca puede ser negativo.
6. La ubicación es opcional.
7. Crear un lote NO genera stock.
8. Crear un lote NO genera automáticamente un movimiento de entrada.
9. El stock aparecerá cuando exista un movimiento de entrada en Base Activa.
10. Un lote que ya tenga movimientos no debe eliminarse físicamente.

## Prisma

Usar el modelo existente **`LoteBaseActiva`**.

No crear otro modelo de lotes.

Reutilizar las relaciones existentes con:

- `Producto`
- `Almacenamiento`
- movimientos Base Activa
- PEPS

Mapeos conceptuales:

```text
Lote       -> codigo
Producto   -> productoId
Fecha      -> fechaIngreso
Ubicación  -> almacenamientoId, si corresponde
Peso       -> utilizar el campo existente adecuado
```

IMPORTANTE:

Antes de modificar `schema.prisma`, revisar si el modelo actual ya dispone de un campo apropiado para el peso.

No crear una migración automáticamente solo para almacenar el peso si el modelo actual ya maneja el peso mediante movimientos.

Si realmente se necesita almacenar peso en el lote y no existe un campo adecuado, primero evaluar el impacto sobre PEPS, Kardex y Stock.

## Server Actions

Mantener:

```text
UI
 ↓
Server Action
 ↓
Zod
 ↓
Service
 ↓
Prisma
```

La acción de creación debe:

1. Validar datos.
2. Verificar que el producto exista.
3. Verificar que sea Base Activa.
4. Verificar que el lote no exista.
5. Convertir peso vacío a `0`.
6. Permitir ubicación vacía/null.
7. Crear el lote.
8. Retornar resultado.
9. Actualizar el listado.

## Validación Zod

Conceptualmente:

```text
lote:
  string, obligatorio, no vacío

productoId:
  entero, obligatorio

fecha:
  fecha, obligatoria

peso:
  número, default 0, mínimo 0

ubicacion:
  opcional / nullable
```

No hacer obligatorios Peso ni Ubicación.

## Eliminación

Si el lote no tiene movimientos, puede utilizarse la estrategia de eliminación existente.

Si tiene movimientos:

```text
No se puede eliminar este lote porque tiene movimientos asociados.
```

Preferir desactivación lógica si el proyecto ya la utiliza.

## Integración

Flujo:

```text
Productos
   ↓
Base Activa
   ↓
Gestión y Generación de Lotes
   ↓
LoteBaseActiva
   ↓
Movimiento Base Activa
   ↓
PEPS
   ↓
Kardex / Stock
   ↓
Reportes
```

Un lote por sí solo no representa stock.

Ejemplo:

```text
Crear:
TH2026-01
Peso: 25 Kg
```

Resultado:

```text
Lote creado correctamente
```

NO:

```text
Stock = 25 Kg
```

Para generar stock:

```text
Movimiento de Entrada
TH2026-01
25 Kg
```

## No hacer

- No rehacer el proyecto.
- No cambiar el diseño del prototipo.
- No crear otro modelo de lotes.
- No agregar campos innecesarios.
- No hacer obligatorio el peso.
- No hacer obligatoria la ubicación.
- No generar stock al crear el lote.
- No mezclar lote con movimiento.
- No mezclar ubicación con observación.
- No cambiar los códigos reales de los productos.
- No modificar PEPS innecesariamente.

## Criterios de aceptación

El módulo queda correcto cuando:

- Se puede crear un lote.
- Producto es obligatorio.
- Solo aparecen productos Base Activa.
- Fecha es obligatoria.
- Peso inicia en `0`.
- Se puede guardar con peso `0`.
- No se aceptan pesos negativos.
- Ubicación es opcional.
- Se puede guardar sin ubicación.
- No se permiten lotes duplicados.
- Los lotes aparecen en la tabla.
- El diseño conserva el prototipo.
- Crear lote no genera stock.
- Los movimientos Base Activa pueden seleccionar el lote.
- PEPS puede utilizar posteriormente los movimientos del lote.
- TypeScript compila sin errores.
- No se rompe Prisma ni la arquitectura existente.

## Regla principal

El módulo debe ser simple.

Los datos de entrada son únicamente:

**LOTE + PRODUCTO + FECHA + PESO (0 POR DEFECTO) + UBICACIÓN (OPCIONAL)**

El prototipo define la apariencia.

La arquitectura existente define cómo se guarda.

Prisma define las relaciones.

Base Activa, PEPS, Kardex y Stock definen cómo se utiliza posteriormente el lote.
