'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, LayoutDashboard, LogOut, Menu, Package, Plus, ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function PatrimonioSidebar({ isOpen, onClose }: PatrimonioSidebarProps) {
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
        aria-label="Navegação lateral do patrimônio"
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
                <h1 className="text-lg font-extrabold text-foreground sm:text-xl">Patrimônio</h1>
                <p className="text-xs font-medium text-muted-foreground">Gestão de Ativos</p>
              </div>
            </div>
            {/* Botão de fechar menu no mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onClose}
              aria-label="Fechar menu de navegação"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* Navegação Principal */}
          <nav className="flex-1 space-y-2 p-4 sm:space-y-3 sm:p-5">
            {/* Botão de voltar à intranet */}
            <Link
              href="/"
              onClick={onClose}
              className={cn(
                'group flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-sm transition-all duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 text-muted-foreground hover:text-foreground sm:px-4 sm:py-3.5',
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
              <span className="flex-1 truncate">Voltar à Intranet</span>
            </Link>
            
            <div className="border-t border-border/60 pt-2 sm:pt-3">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = getIsActive(pathname, item.href)

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'group flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-sm transition-all duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 sm:px-4 sm:py-3.5',
                      sidebarBackgroundRingOffsetClass,
                      isActive
                        ? cn(
                          'border-l-4 font-semibold text-foreground shadow-sm',
                          activeItemBorderColorClass,
                          activeItemBackgroundClass
                        )
                        : cn('text-muted-foreground hover:text-foreground', inactiveItemHoverClass)
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon
                      className={cn(
                        'h-4 w-4 transition-colors duration-200 sm:h-5 sm:w-5',
                        isActive ? activeIconColorClass : inactiveIconColorClass
                      )}
                      aria-hidden="true"
                    />
                    <span className="flex-1 truncate">{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </nav>

          <div className="border-t border-border/60 p-4 sm:p-5">
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start rounded-lg border border-transparent text-xs font-medium text-destructive transition-colors duration-200 hover:bg-destructive/15 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/30 focus-visible:ring-offset-2 sm:text-sm',
                sidebarBackgroundRingOffsetClass
              )}
              size="sm"
              aria-label="Sair da conta"
            >
              <LogOut className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Sair
            </Button>
            <div className="mt-3 space-y-1 text-xs text-muted-foreground sm:mt-4 sm:space-y-1.5">
              <p className="text-xs text-muted-foreground">
                Sistema de Gestão de Patrimônio
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

interface PatrimonioSidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navigation = [
  { name: 'Dashboard', href: '/patrimonio', icon: LayoutDashboard },
  { name: 'Equipamentos', href: '/patrimonio/equipamentos', icon: Package },
  { name: 'Novo Equipamento', href: '/patrimonio/cadastrar', icon: Plus },
  { name: 'Eventos', href: '/patrimonio/eventos', icon: Calendar },
]

const sidebarBackgroundClass = 'bg-[hsl(222.2_47.4%_13%)]'

const sidebarHeaderGradientClass = 'bg-[radial-gradient(circle_at_top,_rgba(120,40,255,0.22),_transparent_65%)]'

const sidebarBackgroundRingOffsetClass = 'focus-visible:ring-offset-[hsl(222.2_47.4%_13%)]'

const activeItemBorderColorClass = 'border-l-[hsl(263_70%_52%)]'

const activeItemBackgroundClass = 'bg-[hsla(263,70%,52%,0.18)]'

const inactiveItemHoverClass = 'hover:bg-[hsla(263,70%,52%,0.12)]'

const activeIconColorClass = 'text-[hsl(263_70%_60%)]'

const inactiveIconColorClass = 'text-muted-foreground'

function getIsActive(pathname: string, href: string) {
  if (href === '/patrimonio') {
    return pathname === href
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}
