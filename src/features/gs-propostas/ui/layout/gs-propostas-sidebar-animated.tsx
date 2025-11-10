"use client";

import { cn } from "@/shared/lib/utils";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { motion } from "framer-motion";
import {
  Briefcase,
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
  FolderTree,
  Package,
  FileText,
  CreditCard,
  FileSignature,
  Users,
  LayoutDashboard,
  Trophy,
  ArrowLeft,
  Moon,
  Sun,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useMemo, memo, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";
import { useTheme } from "next-themes";

const sidebarVariants = {
  open: {
    width: "15rem",
  },
  closed: {
    width: "3.5rem",
  },
};

const contentVariants = {
  open: { display: "block", opacity: 1 },
  closed: { display: "block", opacity: 1 },
};

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
};

const transitionProps = {
  type: "tween" as const,
  ease: "easeOut",
  duration: 0.2,
  staggerChildren: 0.1,
};

const staggerVariants = {
  open: {
    transition: { staggerChildren: 0.03, delayChildren: 0.02 },
  },
};

// Componente memoizado para item de navegação
const NavigationLink = memo(({
  href,
  isActive,
  icon: Icon,
  label,
  isCollapsed
}: {
  href: string;
  isActive: boolean;
  icon: any;
  label: string;
  isCollapsed: boolean;
}) => (
  <Link
    href={href}
    aria-current={isActive ? "page" : undefined}
    className={cn(
      "flex h-11 w-full flex-row items-center rounded-md py-3",
      "transition-all duration-150 hover:scale-[1.02]",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
      sidebarBackgroundRingOffsetClass,
      isActive
        ? cn(
          "border-l-4 font-medium text-foreground shadow-sm pl-2 pr-3",
          activeItemBorderColorClass,
          activeItemBackgroundClass
        )
        : cn("hover:text-foreground px-3", inactiveLinkTextClass, inactiveItemHoverClass)
    )}
  >
    <Icon
      className={cn(
        "h-5 w-5 transition-colors duration-150 shrink-0",
        isActive ? activeIconColorClass : inactiveIconColorClass
      )}
      aria-hidden="true"
    />
    <motion.li variants={variants}>
      {!isCollapsed && (
        <p className="ml-2 text-sm font-medium">{label}</p>
      )}
    </motion.li>
  </Link>
));

NavigationLink.displayName = "NavigationLink";

// Componente memoizado para sub-item de navegação
const SubNavigationLink = memo(({
  href,
  isActive,
  icon: Icon,
  label
}: {
  href: string;
  isActive: boolean;
  icon: any;
  label: string;
}) => (
  <Link
    href={href}
    aria-current={isActive ? "page" : undefined}
    className={cn(
      "flex h-10 items-center rounded-md px-2 py-2.5 text-sm",
      "transition-all duration-150",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
      sidebarBackgroundRingOffsetClass,
      isActive
        ? cn(
          "border-l-4 font-medium text-foreground",
          activeItemBorderColorClass,
          activeItemBackgroundClass
        )
        : cn(inactiveLinkTextClass, "hover:text-foreground", inactiveItemHoverClass)
    )}
  >
    <Icon
      className={cn(
        "h-4 w-4 mr-2 transition-colors duration-150",
        isActive ? activeIconColorClass : inactiveIconColorClass
      )}
      aria-hidden="true"
    />
    {label}
  </Link>
));

SubNavigationLink.displayName = "SubNavigationLink";

export function GsPropostasSidebarAnimated() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const themeMode = resolvedTheme ?? theme;
  const logoSrc = mounted && themeMode === "dark"
    ? "/images/gs-logo-2.svg"
    : "/images/SVG/gs-logo.svg";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Memoizar verificações de rota ativa
  const isDashboardActive = useMemo(() => pathname?.includes("dashboard"), [pathname]);
  const isEmpresasActive = useMemo(() => pathname?.includes("empresas"), [pathname]);
  const isCategoriasActive = useMemo(() => pathname?.includes("categorias"), [pathname]);
  const isItensActive = useMemo(() => pathname?.includes("itens"), [pathname]);
  const isNotasActive = useMemo(() => pathname?.includes("notas"), [pathname]);
  const isPagamentosActive = useMemo(() => pathname?.includes("pagamentos"), [pathname]);
  const isAssinaturasActive = useMemo(() => pathname?.includes("assinaturas"), [pathname]);
  const isClientesActive = useMemo(() => pathname?.includes("clientes"), [pathname]);
  const isAbertasActive = useMemo(() => pathname?.includes("abertas"), [pathname]);
  const isFinalizadasActive = useMemo(() => pathname?.includes("finalizadas"), [pathname]);
  const isGanhasActive = useMemo(() => pathname?.includes("ganhas"), [pathname]);
  const isPerdidasActive = useMemo(() => pathname?.includes("perdidas"), [pathname]);

  return (
    <motion.div
      className={cn(
        "sidebar fixed left-0 top-0 z-40 h-full shrink-0 border-r border-border/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
        sidebarBackgroundClass
      )}
      initial={isCollapsed ? "closed" : "open"}
      animate={isCollapsed ? "closed" : "open"}
      variants={sidebarVariants}
      transition={transitionProps}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      <motion.div
        className={cn("relative z-40 flex h-full shrink-0 flex-col border-r transition-all", sidebarTextClass)}
        variants={contentVariants}
      >
        <motion.ul variants={staggerVariants} className="flex h-full flex-col">
          <div className="flex grow flex-col items-center">
            {/* Header */}
            <div className={cn("flex h-[54px] w-full shrink-0 border-b p-2", sidebarHeaderGradientClass)}>
              <div className="mt-[1.5px] flex w-full items-center gap-2 px-2 overflow-hidden">
                <div className="relative h-8 w-7 shrink-0">
                  <Image
                    src={logoSrc}
                    alt="GS Producoes"
                    fill
                    className="object-contain"
                  />
                </div>
                <motion.div
                  initial={false}
                  animate={{
                    opacity: isCollapsed ? 0 : 1,
                    width: isCollapsed ? 0 : "auto",
                  }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  <p className="text-sm font-medium">GS Propostas</p>
                </motion.div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex h-full w-full flex-col" aria-label="Navegação principal do GS Propostas">
              <div className="flex grow flex-col gap-4">
                <ScrollArea className="h-16 grow p-2">
                  <div className={cn("flex w-full flex-col gap-1")}>
                    {/* Dashboard */}
                    <NavigationLink
                      href="/gs-propostas/dashboard"
                      isActive={isDashboardActive}
                      icon={LayoutDashboard}
                      label="Dashboard"
                      isCollapsed={isCollapsed}
                    />

                    <Separator className="w-full my-3" />

                    {/* Cadastro */}
                    <div className="space-y-1" role="group" aria-label="Menu de cadastro">
                      <div className="flex h-8 w-full flex-row items-center px-3 py-2">
                        <FileText className={cn("h-4 w-4", sectionIconClass)} aria-hidden="true" />
                        <motion.li variants={variants}>
                          {!isCollapsed && (
                            <p className={cn("ml-2 text-xs uppercase tracking-wider font-medium", sectionLabelClass)}>
                              Cadastro
                            </p>
                          )}
                        </motion.li>
                      </div>

                      {!isCollapsed && (
                        <div className="ml-6 space-y-1">
                          <SubNavigationLink
                            href="/gs-propostas/cadastro/empresas"
                            isActive={isEmpresasActive}
                            icon={Building2}
                            label="Empresas"
                          />
                          <SubNavigationLink
                            href="/gs-propostas/cadastro/categorias"
                            isActive={isCategoriasActive}
                            icon={FolderTree}
                            label="Categorias"
                          />
                          <SubNavigationLink
                            href="/gs-propostas/cadastro/itens"
                            isActive={isItensActive}
                            icon={Package}
                            label="Itens"
                          />
                          <SubNavigationLink
                            href="/gs-propostas/cadastro/notas"
                            isActive={isNotasActive}
                            icon={FileText}
                            label="Notas"
                          />
                          <SubNavigationLink
                            href="/gs-propostas/cadastro/pagamentos"
                            isActive={isPagamentosActive}
                            icon={CreditCard}
                            label="Pagamentos"
                          />
                          <SubNavigationLink
                            href="/gs-propostas/cadastro/assinaturas"
                            isActive={isAssinaturasActive}
                            icon={FileSignature}
                            label="Assinaturas"
                          />
                          <SubNavigationLink
                            href="/gs-propostas/cadastro/clientes"
                            isActive={isClientesActive}
                            icon={Users}
                            label="Clientes"
                          />
                        </div>
                      )}
                    </div>

                    <Separator className="w-full my-3" />

                    {/* Propostas */}
                    <div className="space-y-1" role="group" aria-label="Menu de propostas">
                      <div className="flex h-8 w-full flex-row items-center px-3 py-2">
                        <Briefcase className={cn("h-4 w-4", sectionIconClass)} aria-hidden="true" />
                        <motion.li variants={variants}>
                          {!isCollapsed && (
                            <p className={cn("ml-2 text-xs uppercase tracking-wider font-medium", sectionLabelClass)}>
                              Propostas
                            </p>
                          )}
                        </motion.li>
                      </div>

                      {!isCollapsed && (
                        <div className="ml-6 space-y-1">
                          <SubNavigationLink
                            href="/gs-propostas/oportunidades/abertas"
                            isActive={isAbertasActive}
                            icon={Clock}
                            label="Abertas"
                          />
                          <SubNavigationLink
                            href="/gs-propostas/oportunidades/finalizadas"
                            isActive={isFinalizadasActive}
                            icon={CheckCircle2}
                            label="Finalizadas"
                          />
                          <SubNavigationLink
                            href="/gs-propostas/oportunidades/ganhas"
                            isActive={isGanhasActive}
                            icon={Trophy}
                            label="Ganhas"
                          />
                          <SubNavigationLink
                            href="/gs-propostas/oportunidades/perdidas"
                            isActive={isPerdidasActive}
                            icon={XCircle}
                            label="Perdidas"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollArea>
              </div>

              {/* Footer */}
              <div className="flex flex-col gap-1 p-2 border-t">
                {mounted && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="flex h-8 w-full items-center gap-2 rounded-md px-2 py-1.5 transition hover:bg-primary/10 hover:text-primary"
                    aria-label="Alternar tema"
                  >
                    {theme === "dark" ? (
                      <Sun className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Moon className="h-4 w-4" aria-hidden="true" />
                    )}
                    {!isCollapsed && (
                      <span className="text-sm font-medium">
                        {theme === "dark" ? "Modo Claro" : "Modo Escuro"}
                      </span>
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
                    {!isCollapsed && (
                      <span className="text-sm font-medium">Voltar à Intranet</span>
                    )}
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        </motion.ul>
      </motion.div>
    </motion.div>
  );
}

// Design tokens para cores da sidebar - seguindo padrão das sidebars Patrimônio e Drive QR
const sidebarBackgroundClass = 'bg-surface-base dark:bg-background';
const sidebarHeaderGradientClass = 'bg-[radial-gradient(circle_at_top,_rgba(100,34,242,0.16),_rgba(226,232,255,0.6)_60%,_transparent_80%)] dark:bg-[radial-gradient(circle_at_top,_rgba(100,34,242,0.22),_transparent_65%)]';
const activeItemBackgroundClass = 'bg-accent/70 dark:bg-[hsla(263,70%,52%,0.18)]';
const activeItemBorderColorClass = 'border-l-primary dark:border-l-[hsl(263_70%_52%)]';
const inactiveItemHoverClass = 'hover:bg-surface-elevated dark:hover:bg-[hsla(263,70%,52%,0.12)]';
const activeIconColorClass = 'text-primary dark:text-[hsl(263_70%_60%)]';
const inactiveIconColorClass = 'text-muted-foreground dark:text-muted-foreground';
const inactiveLinkTextClass = 'text-foreground/80 dark:text-muted-foreground';
const sectionLabelClass = 'text-muted-foreground dark:text-muted-foreground';
const sectionIconClass = 'text-muted-foreground dark:text-muted-foreground';
const sidebarTextClass = 'text-foreground/70 dark:text-muted-foreground';
const sidebarBackgroundRingOffsetClass = 'focus-visible:ring-offset-[hsl(var(--surface-base))] dark:focus-visible:ring-offset-[hsl(var(--background))]';




