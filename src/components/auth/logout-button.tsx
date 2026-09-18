"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";

import { logoutAction } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  const [pending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await logoutAction();
    });
  }

  return (
    <Button
      type="button"
      onClick={handleLogout}
      disabled={pending}
      variant="ghost"
      className="text-red-400 hover:text-red-300">
      <LogOut className="mr-2 h-4 w-4" />

      {pending ? "Cerrando..." : "Cerrar sesión"}
    </Button>
  );
}
