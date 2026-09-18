"use client";

import * as React from "react";
import Link from "next/link";
import {
  LayoutDashboardIcon,
  SettingsIcon,
  BookOpenIcon,
  PackageIcon,
  FlaskConicalIcon,
  FactoryIcon,
  LayersIcon,
  BarChart3Icon,
  ClipboardListIcon,
  FileTextIcon,
  PlusCircleIcon,
  UsersIcon,
  ShieldCheckIcon,
  DatabaseIcon,
  ReceiptTextIcon,
  ContactIcon,
  StoreIcon,
  WarehouseIcon,
  BoxesIcon,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "Usuario",
    email: "usuario@empresa.com",
    avatar: "/avatars/default.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />,
    },

    {
      title: "Base Activa (Materia Prima)",
      url: "/dashboard/base-activa",
      icon: <FlaskConicalIcon />,
      items: [
        {
          title: "Registrar Movimiento BA",
          url: "/dashboard/base-activa/inventory",
          icon: <PlusCircleIcon />,
        },
        {
          title: "Resumen Base Activa",
          url: "/dashboard/base-activa/resumen",
          icon: <ClipboardListIcon />,
        },
        {
          title: "Reporte General",
          url: "/dashboard/base-activa/reporte",
          icon: <FileTextIcon />,
        },
      ],
    },
    {
      title: "Producto Terminado",
      url: "/dashboard/producto-terminado",
      icon: <FactoryIcon />,
      items: [
        {
          title: "Registrar Movimiento PT",
          url: "/dashboard/producto-terminado/registrar",
          icon: <PlusCircleIcon />,
        },

        {
          title: "Resumen Producto Terminado",
          url: "/dashboard/producto-terminado/resumen",
          icon: <ClipboardListIcon />,
        },
        {
          title: "Reporte General",
          url: "/dashboard/producto-terminado/reporte",
          icon: <FileTextIcon />,
        },
      ],
    },
    {
      title: "Productos",
      url: "/dashboard/productos",
      icon: <PackageIcon />,
    },
    {
      title: "Stock",
      url: "/dashboard/stock",
      icon: <WarehouseIcon />,
      items: [
        {
          title: "Stock Base Activa",
          url: "/dashboard/stock/base-activa",
          icon: <WarehouseIcon />,
        },
        {
          title: "Stock Producto Terminado",
          url: "/dashboard/stock/producto-terminado",
          icon: <BoxesIcon />,
        },
      ],
    },
    /* {
      title: "Venta POS",
      url: "/dashboard/venta-pos",
      icon: <StoreIcon />,
    }, */
    {
      title: "Ventas",
      url: "/dashboard/ventas",
      icon: <ReceiptTextIcon />,
      items: [
        {
          title: "Registro de Ventas",
          url: "/dashboard/venta-pos",
          icon: <ReceiptTextIcon />,
        },
        {
          title: "Reporte de Ventas",
          url: "/dashboard/reporte-ventas",
          icon: <BarChart3Icon />,
        },
      ],
    },
    {
      title: "Clientes",
      url: "/dashboard/clientes",
      icon: <ContactIcon />,
    },
    {
      title: "Lotes",
      url: "/dashboard/lotes",
      icon: <LayersIcon />,
    },
    {
      title: "Catálogos",
      url: "/dashboard/catalogos",
      icon: <BookOpenIcon />,
    },
    {
      title: "Configuración",
      url: "/dashboard/config",
      icon: <SettingsIcon />,
    },
    {
      title: "Usuarios",
      url: "/dashboard/usuarios",
      icon: <UsersIcon />,
    },
    {
      title: "Auditoría",
      url: "/dashboard/auditoria",
      icon: <ShieldCheckIcon />,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href="/dashboard" />}>
              <div className="flex size-8 shrink-0 items-center justify-center bg-muted-foreground/20 ring-1 ring-muted-foreground/10 group-data-[collapsible=icon]:size-6 group-data-[collapsible=icon]:ring-0">
                <DatabaseIcon className="text-primary" />
              </div>
              <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate text-sm font-semibold">
                  Kardex e Inventario
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  PEPS · Base Activa · Producto Terminado
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
