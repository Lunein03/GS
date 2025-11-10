'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { memo, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  Calendar,
  LayoutDashboard,
  LogOut,
  Moon,
  Package,
  Plus,
  Sun,
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
      <motion.li variants={variants} className="overflow-hidden">
        <motion.span
          initial={false}
          animate={{
            opacity: isCollapsed ? 0 : 1,
            width: isCollapsed ? 0 : 'auto',
          }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="ml-2 block overflow-hidden whitespace-nowrap text-sm font-medium"
        >
          {label}
        </motion.span>
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
      <motion.span
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="overflow-hidden whitespace-nowrap"
      >
        {label}
      </motion.span>
  </Link>
  )
)

SubNavigationLink.displayName = 'SubNavigationLink'

export function PatrimonioSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { theme, resolvedTheme, setTheme } = useTheme()
  const themeMode = resolvedTheme ?? theme

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDashboardActive = useMemo(() => pathname === '/patrimonio', [pathname])
  const isEquipamentosActive = useMemo(
    () => pathname?.startsWith('/patrimonio/equipamentos') ?? false,
    [pathname]
  )
  const isCadastrarActive = useMemo(
    () => pathname?.startsWith('/patrimonio/cadastrar') ?? false,
    [pathname]
  )
  const isEventosActive = useMemo(() => pathname?.startsWith('/patrimonio/eventos') ?? false, [pathname])

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
            <div className={cn('flex h-[54px] w-full shrink-0 border-b p-2', sidebarHeaderGradientClass)}>
              <div className="mt-[1.5px] flex w-full items-center gap-2 overflow-hidden px-2">
                <div className="relative h-8 w-7 shrink-0">
                  <Image
                    src="/images/gs-logo-2.svg"
                    alt="GS Producoes"
                    fill
                    className="object-contain dark:block hidden"
                  />
                  <Image
                    src="/images/SVG/gs-logo.svg"
                    alt="GS Producoes"
                    fill
                    className="object-contain dark:hidden block"
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
                  <p className="text-sm font-medium">Patrimonio</p>
                </motion.div>
              </div>
            </div>

            <nav className="flex h-full w-full flex-col" aria-label="Navegacao principal do Patrimonio">
              <div className="flex grow flex-col gap-4">
                <ScrollArea className="h-16 grow p-2">
                  <div className={cn('flex w-full flex-col gap-1')}>
                    <NavigationLink
                      href="/patrimonio"
                      isActive={isDashboardActive}
                      icon={LayoutDashboard}
                      label="Dashboard"
                      isCollapsed={isCollapsed}
                    />

                    <Separator className="w-full my-3" />

                    <div className="space-y-1" role="group" aria-label="Gestao de ativos">
                      <div className="flex h-8 w-full flex-row items-center px-3 py-2">
                        <Package className={cn('h-4 w-4', sectionIconClass)} aria-hidden="true" />
                        <motion.li variants={variants} className="overflow-hidden whitespace-nowrap">
                          <motion.span
                            initial={false}
                            animate={{
                              opacity: isCollapsed ? 0 : 1,
                              width: isCollapsed ? 0 : 'auto',
                            }}
                            transition={{ duration: 0.18, ease: 'easeOut' }}
                            className={cn(
                              'ml-2 block text-xs font-medium uppercase tracking-wider',
                              sectionLabelClass
                            )}
                          >
                            Gestao de ativos
                          </motion.span>
                        </motion.li>
                      </div>

                      <AnimatePresence initial={false}>
                        {!isCollapsed && (
                          <motion.div
                            key="assets-group"
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.18, ease: 'easeOut' }}
                            className="ml-6 space-y-1"
                          >
                            <SubNavigationLink
                              href="/patrimonio/equipamentos"
                              isActive={isEquipamentosActive}
                              icon={Package}
                              label="Equipamentos"
                            />
                            <SubNavigationLink
                              href="/patrimonio/cadastrar"
                              isActive={isCadastrarActive}
                              icon={Plus}
                              label="Novo equipamento"
                            />
                            <SubNavigationLink
                              href="/patrimonio/eventos"
                              isActive={isEventosActive}
                              icon={Calendar}
                              label="Eventos"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </ScrollArea>
              </div>

              <div className="flex flex-col gap-1 p-2 border-t">
                {mounted && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="flex h-8 w-full items-center gap-2 rounded-md px-2 py-1.5 transition hover:bg-primary/10 hover:text-primary"
                    aria-label="Alternar tema"
                  >
                    {theme === 'dark' ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
                    <motion.span
                      initial={false}
                      animate={{
                        opacity: isCollapsed ? 0 : 1,
                        width: isCollapsed ? 0 : 'auto',
                      }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="overflow-hidden whitespace-nowrap text-sm font-medium"
                    >
                      {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
                    </motion.span>
                  </Button>
                )}
                <Link href="/">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex h-8 w-full items-center gap-2 rounded-md px-2 py-1.5 transition hover:bg-primary/10 hover:text-primary"
                        aria-label="Voltar a pagina inicial da intranet"
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    <motion.span
                      initial={false}
                      animate={{
                        opacity: isCollapsed ? 0 : 1,
                        width: isCollapsed ? 0 : 'auto',
                      }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="overflow-hidden whitespace-nowrap text-sm font-medium"
                    >
                      Voltar a Intranet
                    </motion.span>
                  </Button>
                </Link>

                <Separator className="my-1 w-full" />

                {/* <Button
                    variant="ghost"
                    size="sm"
                    className="flex h-8 w-full items-center gap-2 rounded-md px-2 py-1.5 text-destructive transition hover:bg-destructive/15 hover:text-destructive"
                    aria-label="Sair da conta"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    <motion.span
                      initial={false}
                      animate={{
                        opacity: isCollapsed ? 0 : 1,
                        width: isCollapsed ? 0 : 'auto',
                      }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="overflow-hidden whitespace-nowrap text-sm font-medium"
                    >
                      Sair
                    </motion.span>
                  </Button> */}

                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.div
                      key="footer-copy"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="px-2 pb-1 pt-2 text-xs text-muted-foreground"
                    >
                     
                    </motion.div>
                  )}
                </AnimatePresence>
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
const activeItemBackgroundClass = 'bg-accent/70 dark:bg-[hsla(263,70%,52%,0.18)]'
const activeItemBorderColorClass = 'border-l-primary dark:border-l-[hsl(263_70%_52%)]'
const inactiveItemHoverClass = 'hover:bg-surface-elevated dark:hover:bg-[hsla(263,70%,52%,0.12)]'
const activeIconColorClass = 'text-primary dark:text-[hsl(263_70%_60%)]'
const inactiveIconColorClass = 'text-muted-foreground dark:text-muted-foreground'
const inactiveLinkTextClass = 'text-foreground/80 dark:text-muted-foreground'
const sectionLabelClass = 'text-muted-foreground dark:text-muted-foreground'
const sectionIconClass = 'text-muted-foreground dark:text-muted-foreground'
const sidebarTextClass = 'text-foreground/70 dark:text-muted-foreground'
const sidebarBackgroundRingOffsetClass =
  'focus-visible:ring-offset-[hsl(var(--surface-base))] dark:focus-visible:ring-offset-[hsl(var(--background))]'







