"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ChevronDown, LogIn, LogOut, User, Shield, Settings } from 'lucide-react';
import { ModeToggle } from './mode-toggle';
import { Button } from '@/shared/ui/button';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/shared/ui/dropdown-menu';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { PROTECTED_ROUTES } from '@/features/auth/config/auth-config';
import type { UserRole } from '@/features/auth/domain/types';

/** Labels amigáveis para as rotas */
const ROUTE_LABELS: Record<string, string> = {
  '/gs-propostas': 'Propostas',
  '/patrimonio': 'Patrimônio',
  '/drive-qr': 'Drive QR',
  '/admin': 'Admin',
};

const formularioItems = [
  { href: '/formularios/horas-extras', label: 'Registro de Horas Extras' },
  { href: '/formularios/prestacao-contas', label: 'Prestação de Contas' },
];

/** Labels de role para exibição */
const ROLE_LABELS: Record<UserRole, string> = {
  dono: 'Proprietário',
  admin: 'Administrador',
  rh: 'Recursos Humanos',
  colaborador: 'Colaborador',
};

/** Gera iniciais do nome (máximo 2 letras) */
function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, role, isAuthenticated, isLoading, signOut } = useAuth();

  const handleToggle = () => setIsOpen((prev) => !prev);
  const handleClose = () => setIsOpen(false);

  /** Rotas visíveis no nav baseadas no role do usuário */
  const visibleRoutes = role
    ? PROTECTED_ROUTES.filter(
        (route) =>
          route.allowedRoles.includes(role) &&
          route.path !== '/formularios' &&
          route.path !== '/admin'
      )
    : [];

  /** Verifica se usuário tem acesso a formulários */
  const hasFormularios = role
    ? PROTECTED_ROUTES.find((r) => r.path === '/formularios')?.allowedRoles.includes(role)
    : false;

  /** Verifica se usuário tem acesso ao admin */
  const hasAdmin = role
    ? PROTECTED_ROUTES.find((r) => r.path === '/admin')?.allowedRoles.includes(role)
    : false;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 dark:bg-[#0f172a]/95 backdrop-blur-md border-b border-border">
      <div className="container-custom mx-auto h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2" onClick={handleClose}>
          <Image src="/images/gs-logo.svg" alt="Logotipo" width={40} height={32} className="dark:hidden" priority />
          <Image src="/images/gs-logo-2.svg" alt="Logotipo" width={40} height={32} className="hidden dark:block" priority />
          <span className="sr-only">Ir para o início</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Início
          </Link>

          {isAuthenticated && visibleRoutes.map((route) => (
            <Link
              key={route.path}
              href={route.path}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {ROUTE_LABELS[route.path] ?? route.path.slice(1)}
            </Link>
          ))}

          {isAuthenticated && hasFormularios && (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Formulários
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {formularioItems.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href} className="cursor-pointer">
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>

        {/* Right side: theme toggle + user menu */}
        <div className="flex items-center gap-3">
          <ModeToggle />

          {/* User menu or login button */}
          {!isLoading && (
            <>
              {isAuthenticated && profile ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                          {getInitials(profile.fullName)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{profile.fullName}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          <span className="inline-flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            {ROLE_LABELS[profile.role]}
                          </span>
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {hasAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin/users" className="cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          Gerenciar Usuários
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={signOut}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild size="sm" variant="outline" className="hidden md:inline-flex">
                  <Link href="/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    Entrar
                  </Link>
                </Button>
              )}
            </>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden inline-flex h-12 w-12 items-center justify-center rounded-md border border-border hover:bg-accent transition-colors"
            onClick={handleToggle}
            aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-background dark:bg-[#0f172a]">
          <nav className="container-custom py-4 flex flex-col gap-3">
            <Link href="/" className="text-base font-medium text-foreground" onClick={handleClose}>
              Início
            </Link>

            {isAuthenticated && visibleRoutes.map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className="text-base font-medium text-foreground"
                onClick={handleClose}
              >
                {ROUTE_LABELS[route.path] ?? route.path.slice(1)}
              </Link>
            ))}

            {isAuthenticated && hasFormularios && (
              <div className="border-t border-border pt-3 mt-2">
                <span className="text-base font-medium text-foreground mb-2 block">Formulários</span>
                {formularioItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground pl-4 block py-1"
                    onClick={handleClose}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}

            {/* Mobile: user info or login */}
            <div className="border-t border-border pt-3 mt-2">
              {isAuthenticated && profile ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 px-1">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {getInitials(profile.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{profile.fullName}</p>
                      <p className="text-xs text-muted-foreground">{ROLE_LABELS[profile.role]}</p>
                    </div>
                  </div>
                  {hasAdmin && (
                    <Link
                      href="/admin/users"
                      className="text-sm text-muted-foreground hover:text-foreground pl-4 block py-1"
                      onClick={handleClose}
                    >
                      <Settings className="inline mr-2 h-4 w-4" />
                      Gerenciar Usuários
                    </Link>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { signOut(); handleClose(); }}
                    className="mt-1 text-destructive border-destructive/30 hover:bg-destructive/10"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </Button>
                </div>
              ) : (
                <Button asChild className="w-full">
                  <Link href="/login" onClick={handleClose}>
                    <LogIn className="mr-2 h-4 w-4" />
                    Entrar
                  </Link>
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}