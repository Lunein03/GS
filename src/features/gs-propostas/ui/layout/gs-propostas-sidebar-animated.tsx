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
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useMemo, memo, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";
import { useTheme } from "next-themes";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/tooltip";
import { useSidebar } from "@/shared/context/sidebar-context";

const sidebarVariants = {
  open: {
    width: "15rem",
  },
  closed: {
    width: "3.5rem",
  },
};

const transitionProps = {
  type: "tween" as const,
  ease: "easeOut",
  duration: 0.2,
};

const sidebarBackgroundClass = 'bg-surface-base dark:bg-background';
const sidebarHeaderGradientClass = 'bg-[radial-gradient(circle_at_top,_rgba(100,34,242,0.16),_rgba(226,232,255,0.6)_60%,_transparent_80%)] dark:bg-[radial-gradient(circle_at_top,_rgba(100,34,242,0.22),_transparent_65%)]';
const sectionLabelClass = 'text-foreground/90 dark:text-gray-400';
const sectionIconClass = 'text-foreground/90 dark:text-gray-400';
const sidebarTextClass = 'text-foreground dark:text-gray-200';

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
}) => {
  const content = (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex h-10 w-full flex-row items-center rounded-md px-3 transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        isActive
          ? "bg-primary/10 text-primary font-medium shadow-sm"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <Icon
        className={cn(
          "h-5 w-5 shrink-0 transition-colors",
          isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
        )}
        aria-hidden="true"
      />
      <motion.div
        initial={false}
        animate={{
          width: isCollapsed ? 0 : "auto",
          opacity: isCollapsed ? 0 : 1,
          marginLeft: isCollapsed ? 0 : 8,
        }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden whitespace-nowrap"
      >
        <span className="text-sm">{label}</span>
      </motion.div>
    </Link>
  );

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
    );
  }

  return content;
});

NavigationLink.displayName = "NavigationLink";

// Componente memoizado para sub-item de navegação
const SubNavigationLink = memo(({
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
}) => {
  const content = (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex h-9 items-center rounded-md px-3 text-sm transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        isActive
          ? "bg-primary/10 text-primary font-medium"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 shrink-0 transition-colors",
          isActive ? "text-primary" : "text-muted-foreground",
          !isCollapsed && "mr-2"
        )}
        aria-hidden="true"
      />
      {!isCollapsed && <span>{label}</span>}
    </Link>
  );

  return content;
});

SubNavigationLink.displayName = "SubNavigationLink";

export function GsPropostasSidebarAnimated() {
  const { isCollapsed, toggleSidebar } = useSidebar();
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
  const isGanhasActive = useMemo(() => pathname?.includes("ganhas"), [pathname]);
  const isPerdidasActive = useMemo(() => pathname?.includes("perdidas"), [pathname]);

  return (
    <TooltipProvider>
      <motion.div
        className={cn(
          "sidebar relative z-40 h-full shrink-0 border-r border-border/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
          sidebarBackgroundClass
        )}
        initial={false}
        animate={{ width: isCollapsed ? "3.5rem" : "15rem" }}
        transition={transitionProps}
      >
        <div className={cn("relative z-40 flex h-full flex-col border-r transition-all", sidebarTextClass)}>
          {/* Header */}
          <div className={cn(
            "flex h-[54px] w-full shrink-0 items-center border-b p-2",
            sidebarHeaderGradientClass,
            isCollapsed ? "justify-center" : "justify-between"
          )}>
            {!isCollapsed && (
              <div className="flex items-center gap-2 px-2 overflow-hidden flex-1">
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
                    opacity: 1,
                    width: "auto",
                  }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  <p className="text-sm font-medium">GS Propostas</p>
                </motion.div>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8 shrink-0", isCollapsed && "w-full flex justify-center")}
              onClick={toggleSidebar}
              aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
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
            <nav className="flex flex-col gap-2 p-2" aria-label="Navegação principal do GS Propostas">
              {/* Dashboard */}
              <NavigationLink
                href="/gs-propostas/dashboard"
                isActive={isDashboardActive}
                icon={LayoutDashboard}
                label="Dashboard"
                isCollapsed={isCollapsed}
              />

              <Separator className="w-full opacity-50" />

              {/* Cadastro */}
              <div className="space-y-1" role="group" aria-label="Menu de cadastro">
                <div className={cn("flex h-8 w-full flex-row items-center px-3", isCollapsed && "justify-center")}>
                  {isCollapsed ? (
                     <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                           <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        </TooltipTrigger>
                        <TooltipContent side="right">Cadastro</TooltipContent>
                     </Tooltip>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 text-muted-foreground mr-2" aria-hidden="true" />
                      <p className="text-xs uppercase tracking-wider font-medium text-muted-foreground">
                        Cadastro
                      </p>
                    </>
                  )}
                </div>

                {!isCollapsed && (
                  <div className="ml-2 space-y-1 border-l pl-2">
                    <SubNavigationLink
                      href="/gs-propostas/cadastro/empresas"
                      isActive={isEmpresasActive}
                      icon={Building2}
                      label="Empresas"
                      isCollapsed={isCollapsed}
                    />
                    <SubNavigationLink
                      href="/gs-propostas/cadastro/categorias"
                      isActive={isCategoriasActive}
                      icon={FolderTree}
                      label="Categorias"
                      isCollapsed={isCollapsed}
                    />
                    <SubNavigationLink
                      href="/gs-propostas/cadastro/itens"
                      isActive={isItensActive}
                      icon={Package}
                      label="Itens"
                      isCollapsed={isCollapsed}
                    />
                    <SubNavigationLink
                      href="/gs-propostas/cadastro/notas"
                      isActive={isNotasActive}
                      icon={FileText}
                      label="Notas"
                      isCollapsed={isCollapsed}
                    />
                    <SubNavigationLink
                      href="/gs-propostas/cadastro/pagamentos"
                      isActive={isPagamentosActive}
                      icon={CreditCard}
                      label="Pagamentos"
                      isCollapsed={isCollapsed}
                    />
                    <SubNavigationLink
                      href="/gs-propostas/cadastro/assinaturas"
                      isActive={isAssinaturasActive}
                      icon={FileSignature}
                      label="Assinaturas"
                      isCollapsed={isCollapsed}
                    />
                    <SubNavigationLink
                      href="/gs-propostas/cadastro/clientes"
                      isActive={isClientesActive}
                      icon={Users}
                      label="Clientes"
                      isCollapsed={isCollapsed}
                    />
                  </div>
                )}
              </div>

              <Separator className="w-full opacity-50" />

              {/* Propostas */}
              <div className="space-y-1" role="group" aria-label="Menu de propostas">
                <div className={cn("flex h-8 w-full flex-row items-center px-3", isCollapsed && "justify-center")}>
                   {isCollapsed ? (
                     <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                           <Briefcase className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        </TooltipTrigger>
                        <TooltipContent side="right">Propostas</TooltipContent>
                     </Tooltip>
                  ) : (
                    <>
                      <Briefcase className="h-4 w-4 text-muted-foreground mr-2" aria-hidden="true" />
                      <p className="text-xs uppercase tracking-wider font-medium text-muted-foreground">
                        Propostas
                      </p>
                    </>
                  )}
                </div>

                {!isCollapsed && (
                  <div className="ml-2 space-y-1 border-l pl-2">
                    <SubNavigationLink
                      href="/gs-propostas/oportunidades/abertas"
                      isActive={isAbertasActive}
                      icon={Clock}
                      label="Abertas"
                      isCollapsed={isCollapsed}
                    />
                    <SubNavigationLink
                      href="/gs-propostas/oportunidades/ganhas"
                      isActive={isGanhasActive}
                      icon={Trophy}
                      label="Ganhas"
                      isCollapsed={isCollapsed}
                    />
                    <SubNavigationLink
                      href="/gs-propostas/oportunidades/perdidas"
                      isActive={isPerdidasActive}
                      icon={XCircle}
                      label="Perdidas"
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
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className={cn(
                  "flex h-9 w-full items-center justify-start rounded-md px-2 transition-colors hover:bg-accent hover:text-accent-foreground",
                  isCollapsed && "justify-center px-0"
                )}
                aria-label="Alternar tema"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Moon className="h-4 w-4" aria-hidden="true" />
                )}
                {!isCollapsed && (
                  <span className="ml-2 text-sm font-medium">
                    {theme === "dark" ? "Modo Claro" : "Modo Escuro"}
                  </span>
                )}
              </Button>
            )}
            <Link href="/" className="w-full">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "flex h-9 w-full items-center justify-start rounded-md px-2 transition-colors hover:bg-accent hover:text-accent-foreground",
                  isCollapsed && "justify-center px-0"
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
  );
}
