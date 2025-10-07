'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { Calendar, LayoutDashboard, Package, Plus } from 'lucide-react'

import { cn } from '@/lib/utils'

export function PatrimonioLayout({ children }: PatrimonioLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary-glow))]">
                <Package className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">PatrimônioTech</h1>
                <p className="text-xs text-muted-foreground">Gestão de Ativos</p>
              </div>
            </div>
            <nav className="hidden items-center gap-1 md:flex" aria-label="Navegação principal do patrimônio">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = getIsActive(pathname, item.href)

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
            <nav className="md:hidden" aria-label="Navegação principal do patrimônio">
              <select
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium text-foreground shadow-sm"
                value={getActiveHref(pathname)}
                onChange={(event) => router.push(event.target.value)}
              >
                {navigation.map((item) => (
                  <option key={item.href} value={item.href}>
                    {item.name}
                  </option>
                ))}
              </select>
            </nav>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8" role="main">
        {children}
      </main>
    </div>
  )
}

interface PatrimonioLayoutProps {
  children: ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/patrimonio', icon: LayoutDashboard },
  { name: 'Equipamentos', href: '/patrimonio/equipamentos', icon: Package },
  { name: 'Cadastrar', href: '/patrimonio/cadastrar', icon: Plus },
  { name: 'Eventos', href: '/patrimonio/eventos', icon: Calendar },
]

function getIsActive(pathname: string, href: string) {
  if (href === '/patrimonio') {
    return pathname === href
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

function getActiveHref(pathname: string) {
  const current = navigation.find((item) => getIsActive(pathname, item.href))
  return current?.href ?? '/patrimonio'
}
