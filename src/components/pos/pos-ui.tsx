import type { ReactNode } from "react";

export function Caja({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-border bg-card overflow-hidden ${className}`}
    >
      {children}
    </section>
  );
}

export function CajaHeader({
  icono,
  titulo,
  acciones,
}: {
  icono?: ReactNode;
  titulo: string;
  acciones?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2 bg-primary px-3 py-2">
      <h2 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-primary-foreground">
        {icono}
        {titulo}
      </h2>
      {acciones}
    </div>
  );
}

export function Etiqueta({
  children,
  required = false,
}: {
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
      {children}
      {required && <span className="text-destructive"> *</span>}
    </label>
  );
}

export function Badge({
  children,
  variant = "default",
  className = "",
}: {
  children: ReactNode;
  variant?: "default" | "success" | "info" | "warning";
  className?: string;
}) {
  const variants: Record<string, string> = {
    default: "bg-primary text-primary-foreground",
    success: "bg-primary/10 text-primary border border-primary/20",
    info: "bg-accent/10 text-accent border border-accent/20",
    warning: "bg-destructive/10 text-destructive border border-destructive/20",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
