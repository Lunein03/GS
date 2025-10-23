'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'
import { Menu } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { PatrimonioSidebar } from './patrimonio-sidebar'

export function PatrimonioLayout({ children }: PatrimonioLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev)
  }

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-background noise-background">
      {/* Luzes flutuantes */}
      <div className="floating-lights-container">
        <div className="floating-light floating-light-1" />
        <div className="floating-light floating-light-2" />
        <div className="floating-light floating-light-3" />
        <div className="floating-light floating-light-4" />
        <div className="floating-light floating-light-5" />
      </div>

      <PatrimonioSidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />

      {/* Botão flutuante de menu para mobile */}
      <Button
        variant="default"
        size="icon"
        className="fixed bottom-4 right-4 z-30 h-12 w-12 rounded-full shadow-lg transition-all hover:shadow-xl active:scale-95 sm:bottom-6 sm:right-6 sm:h-14 sm:w-14 lg:hidden"
        onClick={handleToggleSidebar}
        aria-label="Abrir menu de navegação"
      >
        <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
      </Button>

      {/* Área de conteúdo principal */}
      <main
        className="min-h-screen pt-6 transition-all duration-300 lg:ml-64 lg:pt-8"
        role="main"
      >
        <div className="container mx-auto px-4 pb-12 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}

interface PatrimonioLayoutProps {
  children: ReactNode
}
