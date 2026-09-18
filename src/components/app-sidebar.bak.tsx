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
  RefreshCwIcon,
  ClipboardListIcon,
  FileBarChartIcon,
  UsersIcon,
  DatabaseIcon,
  ShieldCheckIcon,
  HistoryIcon,
  LayersIcon,
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
      title: "Configuración",
      url: "/dashboard/config",
      icon: <SettingsIcon />,
      items: [
        {
          title: "Empresa / Periodo",
          url: "/dashboard/config",
          icon: <SettingsIcon />,
        },
      ],
    },
    {
      title: "Catálogos",
      url: "/dashboard/catalogos",
      icon: <BookOpenIcon />,
    },
    {
      title: "Productos",
      url: "/dashboard/productos",
      icon: <PackageIcon />,
    },
    /*{ 
      title: "Base Activa",
      url: "/dashboard/base-activa",
      icon: <FlaskConicalIcon />,
    }, */
    {
      title: "Registrar Inventario",
      url: "/dashboard/inventory",
      icon: <ClipboardListIcon />,
    },
    {
      title: "Lotes",
      url: "/dashboard/lotes",
      icon: <LayersIcon />,
    },
    {
      title: "Producto Terminado",
      url: "/dashboard/producto-terminado",
      icon: <FactoryIcon />,
    },
    /* {
      title: "PEPS",
      url: "/dashboard/peps",
      icon: <RefreshCwIcon />,
    }, */
    {
      title: "Stock / Kardex",
      url: "/dashboard/stock",
      icon: <ClipboardListIcon />,
    },
    {
      title: "Reportes",
      url: "/dashboard/reportes",
      icon: <FileBarChartIcon />,
    },
    {
      title: "Usuarios y Seguridad",
      url: "/dashboard/usuarios",
      icon: <UsersIcon />,
      items: [
        {
          title: "Usuarios / Roles",
          url: "/dashboard/usuarios",
          icon: <ShieldCheckIcon />,
        },
        {
          title: "Auditoría",
          url: "/dashboard/usuarios?tab=auditoria",
          icon: <HistoryIcon />,
        },
      ],
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
