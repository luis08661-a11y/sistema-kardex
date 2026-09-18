import type { Metadata } from "next";

/* fuentes */
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";

/* aqui se importan las fuentes */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sistema Kardex",
  description: "Sistema de gestion inventario y kardex",
};

// BUG CORREGIDO: DashboardProvider (sidebar + header) se aplicaba a TODAS las páginas,
// incluyendo /login. Esto causaba que el layout del dashboard (sidebar y header)
// se renderizara antes que el formulario de login.
// Solución: DashboardProvider se movió al layout de /dashboard (dashboard/layout.tsx)
// para que solo las rutas del dashboard tengan sidebar y header.

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
