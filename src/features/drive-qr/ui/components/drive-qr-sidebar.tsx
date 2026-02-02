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
  PanelLeftClose,
  PanelLeftOpen,
  LucideIcon,
} from 'lucide-react'
import { useTheme } from 'next-themes'

import { cn } from '@/shared/lib/utils'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Button } from '@/shared/ui/button'
import { Separator } from '@/shared/ui/separator'
import { useSidebar } from '@/shared/context/sidebar-context'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/tooltip'

const transitionProps = {
  type: 'tween' as const,
  ease: 'easeOut',
  duration: 0.2,
}

const sidebarBackgroundClass = 'bg-surface-base dark:bg-background'
const sidebarHeaderGradientClass =
  'bg-[radial-gradient(circle_at_top,_rgba(100,34,242,0.16),_rgba(226,232,255,0.6)_60%,_transparent_80%)] dark:bg-[radial-gradient(circle_at_top,_rgba(100,34,242,0.22),_transparent_65%)]'
const sidebarTextClass = 'text-foreground dark:text-gray-200'

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
    icon: LucideIcon | React.ElementType
    label: string
    isCollapsed: boolean
  }) => {
    const content = (
      <Link
        href={href}
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          'flex h-10 w-full flex-row items-center rounded-md px-3 transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
          isActive
            ? 'bg-primary/10 text-primary font-medium shadow-sm'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        )}
      >
        <Icon
          className={cn(
            'h-5 w-5 shrink-0 transition-colors',
            isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
          )}
          aria-hidden="true"
        />
        <motion.div
          initial={false}
          animate={{
            width: isCollapsed ? 0 : 'auto',
            opacity: isCollapsed ? 0 : 1,
            marginLeft: isCollapsed ? 0 : 8,
          }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden whitespace-nowrap"
        >
          <span className="text-sm">{label}</span>
        </motion.div>
      </Link>
    )

    if (isCollapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {label}
          </TooltipContent>
        </Tooltip>
      )
    }

    return content
  }
)

NavigationLink.displayName = 'NavigationLink'

const SubNavigationLink = memo(
  ({ href, isActive, icon: Icon, label, isCollapsed }: { href: string; isActive: boolean; icon: LucideIcon | React.ElementType; label: string; isCollapsed: boolean }) => (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex h-9 items-center rounded-md px-3 text-sm transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        isActive
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      )}
    >
      <Icon
        className={cn(
          'h-4 w-4 shrink-0 transition-colors',
          isActive ? 'text-primary' : 'text-muted-foreground',
          !isCollapsed && 'mr-2'
        )}
        aria-hidden="true"
      />
      {!isCollapsed && <span>{label}</span>}
    </Link>
  )
)

SubNavigationLink.displayName = 'SubNavigationLink'

export function DriveQrSidebar() {
  const { isCollapsed, toggleSidebar } = useSidebar()
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
    <TooltipProvider>
      <motion.div
        className={cn(
          'sidebar relative z-40 h-full shrink-0 border-r border-border/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]',
          sidebarBackgroundClass
        )}
        initial={false}
        animate={{ width: isCollapsed ? '3.5rem' : '15rem' }}
        transition={transitionProps}
      >
        <div className={cn('relative z-40 flex h-full flex-col border-r transition-all', sidebarTextClass)}>
          {/* Header */}
          <div className={cn(
            'flex h-[54px] w-full shrink-0 items-center border-b p-2',
            sidebarHeaderGradientClass,
            isCollapsed ? 'justify-center' : 'justify-between'
          )}>
            {!isCollapsed && (
              <div className="flex items-center gap-2 px-2 overflow-hidden flex-1">
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
                    opacity: 1,
                    width: 'auto',
                  }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  <p className="text-sm font-medium">Drive QR</p>
                </motion.div>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className={cn('h-8 w-8 shrink-0', isCollapsed && 'w-full flex justify-center')}
              onClick={toggleSidebar}
              aria-label={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 w-full">
            <nav className="flex flex-col gap-2 p-2" aria-label="Navegação principal do Drive QR">
              <NavigationLink
                href="/drive-qr"
                isActive={isDashboardActive}
                icon={LayoutDashboard}
                label="Visão Geral"
                isCollapsed={isCollapsed}
              />

              <Separator className="w-full opacity-50" />

              {/* Fluxo do scanner */}
              <div className="space-y-1" role="group" aria-label="Fluxo do scanner">
                <div className={cn('flex h-8 w-full flex-row items-center px-3', isCollapsed && 'justify-center')}>
                  {isCollapsed ? (
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <ScanQrCode className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      </TooltipTrigger>
                      <TooltipContent side="right">Fluxo do scanner</TooltipContent>
                    </Tooltip>
                  ) : (
                    <>
                      <ScanQrCode className="h-4 w-4 text-muted-foreground mr-2" aria-hidden="true" />
                      <p className="text-xs uppercase tracking-wider font-medium text-muted-foreground">
                        Fluxo do scanner
                      </p>
                    </>
                  )}
                </div>

                {!isCollapsed && (
                  <div className="ml-2 space-y-1 border-l pl-2">
                    <SubNavigationLink
                      href="/drive-qr#upload"
                      isActive={isUploadActive}
                      icon={UploadCloud}
                      label="Carregar lote"
                      isCollapsed={isCollapsed}
                    />
                    <SubNavigationLink
                      href="/drive-qr#resumo"
                      isActive={isResumoActive}
                      icon={BarChart2}
                      label="Resumo"
                      isCollapsed={isCollapsed}
                    />
                    <SubNavigationLink
                      href="/drive-qr#resultados"
                      isActive={isResultadosActive}
                      icon={ListChecks}
                      label="Resultados"
                      isCollapsed={isCollapsed}
                    />
                  </div>
                )}
              </div>
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="flex flex-col gap-1 p-2 border-t mt-auto bg-background/50 backdrop-blur-sm">
            {mounted && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={cn(
                  'flex h-9 w-full items-center justify-start rounded-md px-2 transition-colors hover:bg-accent hover:text-accent-foreground',
                  isCollapsed && 'justify-center px-0'
                )}
                aria-label="Alternar tema"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Moon className="h-4 w-4" aria-hidden="true" />
                )}
                {!isCollapsed && (
                  <span className="ml-2 text-sm font-medium">
                    {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
                  </span>
                )}
              </Button>
            )}
            <Link href="/" className="w-full">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'flex h-9 w-full items-center justify-start rounded-md px-2 transition-colors hover:bg-accent hover:text-accent-foreground',
                  isCollapsed && 'justify-center px-0'
                )}
                aria-label="Voltar à página inicial da intranet"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                {!isCollapsed && (
                  <span className="ml-2 text-sm font-medium">Voltar à Intranet</span>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </TooltipProvider>
  )
}
