'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { memo, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  BarChart2,
  LayoutDashboard,
  ListChecks,
  Moon,
  ScanQrCode,
  Sun,
  UploadCloud,
} from 'lucide-react'
import { useTheme } from 'next-themes'

import { cn } from '@/shared/lib/utils'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Button } from '@/shared/ui/button'
import { Separator } from '@/shared/ui/separator'

const sidebarVariants = {
  open: {
    width: '15rem',
  },
  closed: {
    width: '3.5rem',
  },
}

const contentVariants = {
  open: { display: 'block', opacity: 1 },
  closed: { display: 'block', opacity: 1 },
}

const variants = {
  open: {
    x: 0,
    opacity: 1,
    transition: {
      x: { stiffness: 1000, velocity: -100 },
    },
  },
  closed: {
    x: -20,
    opacity: 0,
    transition: {
      x: { stiffness: 100 },
    },
  },
}

const transitionProps = {
  type: 'tween' as const,
  ease: 'easeOut',
  duration: 0.2,
  staggerChildren: 0.1,
}

const staggerVariants = {
  open: {
    transition: { staggerChildren: 0.03, delayChildren: 0.02 },
  },
}

const NavigationLink = memo(
  ({
    href,
    isActive,
    icon: Icon,
    label,
    isCollapsed,
  }: {
    href: string
    isActive: boolean
    icon: any
    label: string
    isCollapsed: boolean
  }) => (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex h-11 w-full flex-row items-center rounded-md py-3',
        'transition-all duration-150 hover:scale-[1.02]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        sidebarBackgroundRingOffsetClass,
        isActive
          ? cn(
              'border-l-4 font-medium text-foreground shadow-sm pl-2 pr-3',
              activeItemBorderColorClass,
              activeItemBackgroundClass
            )
          : cn('hover:text-foreground px-3', inactiveLinkTextClass, inactiveItemHoverClass)
      )}
    >
      <Icon
        className={cn(
          'h-5 w-5 transition-colors duration-150 shrink-0',
          isActive ? activeIconColorClass : inactiveIconColorClass
        )}
        aria-hidden="true"
      />
      <motion.li variants={variants}>
        {!isCollapsed && <p className="ml-2 text-sm font-medium">{label}</p>}
      </motion.li>
    </Link>
  )
)

NavigationLink.displayName = 'NavigationLink'

const SubNavigationLink = memo(
  ({ href, isActive, icon: Icon, label }: { href: string; isActive: boolean; icon: any; label: string }) => (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex h-10 items-center rounded-md px-2 py-2.5 text-sm',
        'transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        sidebarBackgroundRingOffsetClass,
        isActive
          ? cn('border-l-4 font-medium text-foreground', activeItemBorderColorClass, activeItemBackgroundClass)
          : cn(inactiveLinkTextClass, 'hover:text-foreground', inactiveItemHoverClass)
      )}
    >
      <Icon
        className={cn(
          'mr-2 h-4 w-4 transition-colors duration-150',
          isActive ? activeIconColorClass : inactiveIconColorClass
        )}
        aria-hidden="true"
      />
      {label}
    </Link>
  )
)

SubNavigationLink.displayName = 'SubNavigationLink'

export function DriveQrSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [currentHash, setCurrentHash] = useState('')
  const pathname = usePathname()
  const { theme, resolvedTheme, setTheme } = useTheme()
  const themeMode = resolvedTheme ?? theme

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const updateHash = () => {
      if (typeof window !== 'undefined') {
        setCurrentHash(window.location.hash)
      }
    }

    updateHash()
    window.addEventListener('hashchange', updateHash)

    return () => {
      window.removeEventListener('hashchange', updateHash)
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentHash(window.location.hash)
    }
  }, [pathname])

  const isDashboardActive = useMemo(() => pathname?.startsWith('/drive-qr') ?? false, [pathname])
  const isUploadActive = currentHash === '#upload'
  const isResumoActive = currentHash === '#resumo'
  const isResultadosActive = currentHash === '#resultados'

  return (
    <motion.div
      className={cn(
        'sidebar fixed left-0 top-0 z-40 h-full shrink-0 border-r border-border/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]',
        sidebarBackgroundClass
      )}
      initial={isCollapsed ? 'closed' : 'open'}
      animate={isCollapsed ? 'closed' : 'open'}
      variants={sidebarVariants}
      transition={transitionProps}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      <motion.div
        className={cn('relative z-40 flex h-full shrink-0 flex-col border-r transition-all', sidebarTextClass)}
        variants={contentVariants}
      >
        <motion.ul variants={staggerVariants} className="flex h-full flex-col">
          <div className="flex grow flex-col items-center">
            {/* Header */}
            <div className={cn('flex h-[54px] w-full shrink-0 border-b p-2', sidebarHeaderGradientClass)}>
              <div className="mt-[1.5px] flex w-full items-center gap-2 overflow-hidden px-2">
                <div className="relative h-8 w-7 shrink-0">
                  <Image
                    src={themeMode === 'dark' ? '/images/gs-logo-2.svg' : '/images/SVG/gs-logo.svg'}
                    alt="GS Producoes"
                    fill
                    className="object-contain"
                  />
                </div>
                <motion.div
                  initial={false}
                  animate={{
                    opacity: isCollapsed ? 0 : 1,
                    width: isCollapsed ? 0 : 'auto',
                  }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  <p className="text-sm font-medium">Drive QR</p>
                </motion.div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex h-full w-full flex-col" aria-label="Navegação principal do Drive QR">
              <div className="flex grow flex-col gap-4">
                <ScrollArea className="h-16 grow p-2">
                  <div className={cn('flex w-full flex-col gap-1')}>
                    <NavigationLink
                      href="/drive-qr"
                      isActive={isDashboardActive}
                      icon={LayoutDashboard}
                      label="Visão Geral"
                      isCollapsed={isCollapsed}
                    />

                    <Separator className="my-3 w-full" />

                    <div className="space-y-1" role="group" aria-label="Fluxo do scanner">
                      <div className="flex h-8 w-full flex-row items-center px-3 py-2">
                        <ScanQrCode className={cn('h-4 w-4', sectionIconClass)} aria-hidden="true" />
                        <motion.li variants={variants}>
                          {!isCollapsed && (
                            <p className={cn('ml-2 text-xs font-medium uppercase tracking-wider', sectionLabelClass)}>
                              Fluxo do scanner
                            </p>
                          )}
                        </motion.li>
                      </div>

                      {!isCollapsed && (
                        <div className="ml-6 space-y-1">
                          <SubNavigationLink
                            href="/drive-qr#upload"
                            isActive={isUploadActive}
                            icon={UploadCloud}
                            label="Carregar lote"
                          />
                          <SubNavigationLink
                            href="/drive-qr#resumo"
                            isActive={isResumoActive}
                            icon={BarChart2}
                            label="Resumo"
                          />
                          <SubNavigationLink
                            href="/drive-qr#resultados"
                            isActive={isResultadosActive}
                            icon={ListChecks}
                            label="Resultados"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollArea>
              </div>

              {/* Footer */}
              <div className="flex flex-col gap-1 border-t p-2">
                {mounted && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="flex h-8 w-full items-center gap-2 rounded-md px-2 py-1.5 transition hover:bg-primary/10 hover:text-primary"
                    aria-label="Alternar tema"
                  >
                    {theme === 'dark' ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
                    {!isCollapsed && (
                      <span className="text-sm font-medium">{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
                    )}
                  </Button>
                )}
                <Link href="/">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex h-8 w-full items-center gap-2 rounded-md px-2 py-1.5 transition hover:bg-primary/10 hover:text-primary"
                    aria-label="Voltar à página inicial da intranet"
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    {!isCollapsed && <span className="text-sm font-medium">Voltar à Intranet</span>}
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        </motion.ul>
      </motion.div>
    </motion.div>
  )
}

const sidebarBackgroundClass = 'bg-surface-base dark:bg-background'
const sidebarHeaderGradientClass =
  'bg-[radial-gradient(circle_at_top,_rgba(100,34,242,0.16),_rgba(226,232,255,0.6)_60%,_transparent_80%)] dark:bg-[radial-gradient(circle_at_top,_rgba(100,34,242,0.22),_transparent_65%)]'
const activeItemBackgroundClass = 'bg-primary/10 dark:bg-primary/20'
const activeItemBorderColorClass = 'border-l-primary dark:border-l-[hsl(263_70%_52%)]'
const inactiveItemHoverClass = 'hover:bg-surface-elevated dark:hover:bg-[hsla(263,70%,52%,0.12)]'
const activeIconColorClass = 'text-primary dark:text-[hsl(263_70%_60%)]'
const inactiveIconColorClass = 'text-muted-foreground dark:text-muted-foreground'
const inactiveLinkTextClass = 'text-foreground dark:text-foreground'
const sectionLabelClass = 'text-foreground/90 dark:text-foreground/90'
const sectionIconClass = 'text-foreground/90 dark:text-foreground/90'
const sidebarTextClass = 'text-foreground dark:text-foreground'
const sidebarBackgroundRingOffsetClass =
  'focus-visible:ring-offset-[hsl(var(--surface-base))] dark:focus-visible:ring-offset-[hsl(var(--background))]'






