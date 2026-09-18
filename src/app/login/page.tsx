"use client";

import React, { useActionState } from "react";
import { Store } from "lucide-react";

import { loginAction, type LoginState } from "@/actions/auth.actions";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

const initialState: LoginState = {
  success: false,
  message: "",
};

export default function Login() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25 mb-3">
            <Store className="w-8 h-8 text-primary-foreground" />
          </div>

          <h1 className="text-xl font-bold text-foreground tracking-tight">
            Iniciar sesión
          </h1>
        </div>

        <form action={formAction} className="space-y-5">
          {/* Usuario */}
          <div className="space-y-2">
            <Label className="text-xs text-secondary-foreground font-medium">
              Usuario o correo
            </Label>

            <Input
              name="login"
              type="text"
              placeholder="Usuario o correo"
              autoComplete="username"
              disabled={pending}
              className="bg-input border-border text-foreground h-11 rounded-xl text-sm focus-visible:border-primary focus-visible:ring-0 tracking-widest"
            />
          </div>

          {/* Contraseña */}
          <div className="space-y-2">
            <Label className="text-xs text-secondary-foreground font-medium">
              Contraseña
            </Label>

            <Input
              name="password"
              type="password"
              placeholder="Contraseña"
              autoComplete="current-password"
              disabled={pending}
              className="bg-input border-border text-foreground h-11 rounded-xl text-sm focus-visible:border-primary focus-visible:ring-0 tracking-widest"
            />
          </div>

          {/* Mensaje */}
          {state.message && (
            <div
              className={`rounded-xl px-4 py-3 text-sm border ${
                state.success
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-destructive/10 border-destructive/30 text-destructive"
              }`}>
              {state.message}
            </div>
          )}

          {/* Botón */}
          <Button
            type="submit"
            disabled={pending}
            className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/25 transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {pending ? "Ingresando..." : "Ingresar al Sistema"}
          </Button>
        </form>

        <div className="text-center mt-6">
          <p className="text-[11px] text-muted-foreground">
            Sistema de Facturación Electrónica
          </p>

          <p className="text-[10px] text-muted-foreground/70 mt-1">© 2026 delux</p>
        </div>
      </div>
    </div>
  );
}