"use client"

import { usePathname } from "next/navigation"
import { ChevronRightIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import Link from "next/link"

export interface NavSubItem {
  title: string
  url: string
  icon?: React.ReactNode
}

export interface NavItem {
  title: string
  url: string
  icon?: React.ReactNode
  items?: NavSubItem[]
}

export function NavMain({ items }: { items: NavItem[] }) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => {
            const hasSubItems = item.items && item.items.length > 0
            const isSubActive =
              hasSubItems &&
              item.items!.some((sub) => pathname.startsWith(sub.url))
            const isActive = !hasSubItems && pathname === item.url

            return hasSubItems ? (
              <Collapsible
                key={item.title}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger
                    render={
                      <SidebarMenuButton
                        isActive={isSubActive}
                        className="data-active:bg-primary/20 data-active:text-primary data-active:font-semibold data-active:shadow-sm data-active:ring-1 data-active:ring-primary/20 data-active:hover:bg-primary/30 data-active:hover:text-primary"
                      >
                        {item.icon}
                        <span>{item.title}</span>
                        <ChevronRightIcon className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    }
                  />
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items!.map((sub) => (
                        <SidebarMenuSubItem key={sub.title}>
                          <SidebarMenuSubButton
                            render={<Link href={sub.url} />}
                            isActive={pathname === sub.url}
                            className="data-active:bg-primary/25 data-active:text-primary data-active:font-semibold data-active:hover:bg-primary/35 data-active:hover:text-primary"
                          >
                            {sub.icon}
                            <span>{sub.title}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ) : (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  isActive={isActive}
                  render={<Link href={item.url} />}
                  className="data-active:bg-primary/20 data-active:text-primary data-active:font-semibold data-active:shadow-sm data-active:ring-1 data-active:ring-primary/20 data-active:hover:bg-primary/30 data-active:hover:text-primary"
                >
                  {item.icon}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}