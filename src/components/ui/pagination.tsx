"use client"

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages: { key: string; label: number | "..." }[] = []
    const maxVisible = 5
    const push = (label: number | "...", key: string) => pages.push({ key, label })

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) push(i, `p${i}`)
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) push(i, `p${i}`)
        push("...", "ellipsis-start")
        push(totalPages, `p${totalPages}`)
      } else if (currentPage >= totalPages - 2) {
        push(1, "p1")
        push("...", "ellipsis-start")
        for (let i = totalPages - 3; i <= totalPages; i++) push(i, `p${i}`)
      } else {
        push(1, "p1")
        push("...", "ellipsis-start")
        for (let i = currentPage - 1; i <= currentPage + 1; i++) push(i, `p${i}`)
        push("...", "ellipsis-end")
        push(totalPages, `p${totalPages}`)
      }
    }
    return pages
  }

  return (
    <nav className={cn("flex items-center gap-1", className)} aria-label="Pagination">
      <Button
        variant="outline"
        size="icon-sm"
        aria-label="Página anterior"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {getPageNumbers().map(({ key, label }) =>
        label === "..." ? (
          <span key={key} className="flex size-8 items-center justify-center">
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </span>
        ) : (
          <Button
            key={key}
            variant={currentPage === label ? "default" : "outline"}
            size="icon-sm"
            onClick={() => onPageChange(label)}
          >
            {label}
          </Button>
        ),
      )}

      <Button
        variant="outline"
        size="icon-sm"
        aria-label="Página siguiente"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  )
}
