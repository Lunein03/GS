"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ModeToggle() {
  const { setTheme } = useTheme()

  // Função para prevenir qualquer propagação de evento que possa afetar o layout
  const handleThemeChange = (theme: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setTheme(theme)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full w-9 h-9 flex items-center justify-center border-transparent bg-transparent hover:bg-accent hover:text-accent-foreground"
          onClick={(e) => e.stopPropagation()}
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Alternar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[8rem]">
        <DropdownMenuItem onClick={handleThemeChange("light")}>
          Claro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleThemeChange("dark")}>
          Escuro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleThemeChange("system")}>
          Sistema
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}