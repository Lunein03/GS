'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, ArrowLeft } from 'lucide-react'

import { cn } from '@/lib/utils'

export function DriveQrSidebar({ isOpen, onClose }: DriveQrSidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen w-64 border-r border-border/60 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-transform duration-300 lg:translate-x-0',
          sidebarBackgroundClass,
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Navegação lateral do Drive QR"
      >
        <div className="flex h-full flex-col">
          {/* Header da Sidebar com Logo e Nome */}
          <div className={cn('flex items-center justify-between border-b border-border/60 p-4 sm:p-6', sidebarHeaderGradientClass)}>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative h-10 w-10 sm:h-12 sm:w-12">
                <Image
                  src="/images/gs-logo-2.svg"
                  alt="Logo GS Produções"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="space-y-1">
                <h1 className="text-lg font-extrabold text-foreground sm:text-xl">Drive QR</h1>
                <p className="text-xs font-medium text-muted-foreground">Scanner Integrado</p>
              </div>
            </div>
            {/* Botão de fechar menu no mobile */}
            <button
              className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-[hsla(263,70%,52%,0.12)] hover:text-foreground lg:hidden"
              onClick={onClose}
              aria-label="Fechar menu de navegação"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          {/* Espaço flexível */}
          <div className="flex-1" />

          {/* Botão de voltar à intranet no rodapé */}
          <div className="border-t border-border/60 p-4 sm:p-5">
            <Link
              href="/"
              onClick={onClose}
              className={cn(
                'group flex w-full items-center justify-center gap-3 rounded-xl border border-transparent px-3 py-3 text-sm font-medium transition-all duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 text-muted-foreground hover:text-foreground sm:px-4 sm:py-3.5',
                sidebarBackgroundRingOffsetClass,
                inactiveItemHoverClass
              )}
            >
              <ArrowLeft
                className={cn(
                  'h-4 w-4 transition-colors duration-200 sm:h-5 sm:w-5',
                  inactiveIconColorClass
                )}
                aria-hidden="true"
              />
              <span>Voltar à Intranet</span>
            </Link>
            <div className="mt-3 space-y-1 text-center text-xs text-muted-foreground sm:mt-4 sm:space-y-1.5">
              <p className="text-xs text-muted-foreground">
                Drive QR Scanner Integrado
              </p>
              <p className="text-xs text-muted-foreground">
                GS Produções © 2025
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

interface DriveQrSidebarProps {
  isOpen: boolean
  onClose: () => void
}

const sidebarBackgroundClass = 'bg-[hsl(222.2_47.4%_13%)]'

const sidebarHeaderGradientClass = 'bg-[radial-gradient(circle_at_top,_rgba(120,40,255,0.22),_transparent_65%)]'

const sidebarBackgroundRingOffsetClass = 'focus-visible:ring-offset-[hsl(222.2_47.4%_13%)]'

const inactiveItemHoverClass = 'hover:bg-[hsla(263,70%,52%,0.12)]'

const inactiveIconColorClass = 'text-muted-foreground'
