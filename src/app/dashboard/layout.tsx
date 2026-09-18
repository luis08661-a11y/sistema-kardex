// BUG CORREGIDO: Este layout separa el chrome del dashboard (sidebar + header)
// del layout raíz, para que páginas como /login no rendericen el sidebar/header.
// Antes, DashboardProvider estaba en src/app/layout.tsx (layout raíz),
// lo que causaba que el sidebar y header del dashboard se mostraran
// incluso en la página de login.

import DashboardProvider from "@/lib/provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardProvider>{children}</DashboardProvider>;
}
