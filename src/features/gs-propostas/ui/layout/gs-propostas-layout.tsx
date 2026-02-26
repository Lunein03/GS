'use client'

import type { ReactNode } from 'react'
import { GsPropostasSidebarAnimated } from './gs-propostas-sidebar-animated'
import { SidebarProvider } from '@/shared/context/sidebar-context'

export function GsPropostasLayout({ children }: GsPropostasLayoutProps) {
  return (
    <SidebarProvider storageKey="gs-propostas-sidebar-collapsed">
      <div className="flex h-screen overflow-hidden">
        <GsPropostasSidebarAnimated />
        <main className="flex-1 flex flex-col overflow-y-auto bg-background transition-all duration-200 ease-out">
          <div className="w-full max-w-[1400px] mx-auto px-6 py-4 flex-1">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

interface GsPropostasLayoutProps {
  children: ReactNode
}
