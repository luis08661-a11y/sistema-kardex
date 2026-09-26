"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import LogoutButton from "./auth/logout-button"

export function SiteHeader() {
  const { toggleSidebar } = useSidebar()

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Abrir o cerrar menú"
          className="-ml-1"
          onClick={toggleSidebar}
        >
          <Menu className="size-5" />
        </Button>
        {/* <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        /> */}
        {/* <h1 className="text-base font-medium">Documents</h1> */}
   
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}