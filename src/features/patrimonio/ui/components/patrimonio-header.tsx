'use client'

import { Menu, Package } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function PatrimonioHeader({ onMenuClick }: PatrimonioHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-sm shadow-sm">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Botão de menu mobile + Logo */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
            aria-label="Abrir menu de navegação"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary-glow))]">
              <Package className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">PatrimônioTech</h1>
              <p className="text-xs text-muted-foreground">Gestão de Ativos</p>
            </div>
          </div>
        </div>

        {/* Área reservada para ícones de perfil/notificações */}
        <div className="flex items-center gap-2">
          {/* TODO: Adicionar ícones de notificação e perfil */}
        </div>
      </div>
    </header>
  )
}

interface PatrimonioHeaderProps {
  onMenuClick: () => void
}
