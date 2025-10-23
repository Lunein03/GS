'use client'

import type { ReactNode } from 'react'
import { GsPropostasSidebarAnimated } from './gs-propostas-sidebar-animated'

export function GsPropostasLayout({ children }: GsPropostasLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <GsPropostasSidebarAnimated />
      <main className="flex-1 overflow-y-auto ml-[3.05rem] bg-background">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}

interface GsPropostasLayoutProps {
  children: ReactNode
}
