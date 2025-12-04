'use client'

import type { ReactNode } from 'react'
import { SidebarProvider } from '@/shared/context/sidebar-context'
import { PatrimonioSidebar } from './patrimonio-sidebar'

export function PatrimonioLayout({ children }: PatrimonioLayoutProps) {
  return (
    <SidebarProvider storageKey="patrimonio-sidebar-collapsed">
      <div className="flex h-screen overflow-hidden bg-background">
        <PatrimonioSidebar />

        <main
          className="relative flex-1 overflow-y-auto bg-background noise-background transition-all duration-200 ease-out"
          role="main"
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="floating-lights-container">
              <div className="floating-light floating-light-1" />
              <div className="floating-light floating-light-2" />
              <div className="floating-light floating-light-3" />
              <div className="floating-light floating-light-4" />
              <div className="floating-light floating-light-5" />
            </div>
          </div>

          <div className="relative z-10 min-h-screen">
            <div className="container mx-auto px-4 pb-12 pt-8 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

interface PatrimonioLayoutProps {
  children: ReactNode
}
