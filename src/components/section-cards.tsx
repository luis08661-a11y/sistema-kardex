"use client";

import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import {
  TrendingUpIcon,
  UsersIcon,
  PackageIcon,
  ShoppingCartIcon,
} from "lucide-react";

export function SectionCards() {
  return (
    <div
      className="
        grid grid-cols-1 gap-4 px-4
        lg:px-6
        @xl/main:grid-cols-2
        @5xl/main:grid-cols-4
      "
    >
      {/* VENTAS DEL DÍA */}
      <Card className="@container/card shadow-lg shadow-black/20">
        <CardHeader>
          <CardDescription>Ventas del día</CardDescription>

          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            S/ 0.00
          </CardTitle>

          <CardAction>
            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUpIcon className="size-4" />
              0%
            </Badge>
          </CardAction>
        </CardHeader>

        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium text-muted-foreground">
            Ventas registradas hoy
            <ShoppingCartIcon className="size-4 text-emerald-600 dark:text-emerald-400" />
          </div>

          <div className="text-muted-foreground/70">
            Monto acumulado de ventas del día en curso
          </div>
        </CardFooter>
      </Card>

      {/* VENTAS DEL MES */}
      <Card className="@container/card shadow-lg shadow-black/20">
        <CardHeader>
          <CardDescription>Ventas del mes</CardDescription>

          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            S/ 0.00
          </CardTitle>

          <CardAction>
            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUpIcon className="size-4" />
              0%
            </Badge>
          </CardAction>
        </CardHeader>

        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium text-muted-foreground">
            Total vendido este mes
            <TrendingUpIcon className="size-4 text-emerald-600 dark:text-emerald-400" />
          </div>

          <div className="text-muted-foreground/70">
            Comparación con el mes anterior
          </div>
        </CardFooter>
      </Card>

      {/* CLIENTES */}
      <Card className="@container/card shadow-lg shadow-black/20">
        <CardHeader>
          <CardDescription>Clientes</CardDescription>

          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            0
          </CardTitle>

          <CardAction>
            <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <UsersIcon className="size-4" />
              0
            </Badge>
          </CardAction>
        </CardHeader>

        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium text-muted-foreground">
            Clientes registrados
            <UsersIcon className="size-4 text-blue-600 dark:text-blue-400" />
          </div>

          <div className="text-muted-foreground/70">
            Clientes registrados en el sistema
          </div>
        </CardFooter>
      </Card>

      {/* PRODUCTOS */}
      <Card className="@container/card shadow-lg shadow-black/20">
        <CardHeader>
          <CardDescription>Productos</CardDescription>

          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            0
          </CardTitle>

          <CardAction>
            <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <PackageIcon className="size-4" />
              0
            </Badge>
          </CardAction>
        </CardHeader>

        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium text-muted-foreground">
            Productos registrados
            <PackageIcon className="size-4 text-amber-600 dark:text-amber-400" />
          </div>

          <div className="text-muted-foreground/70">
            Productos disponibles en el inventario
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}