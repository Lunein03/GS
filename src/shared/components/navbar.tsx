"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ChevronDown } from 'lucide-react';
import { ModeToggle } from './mode-toggle';
import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';

const navItems = [
  { href: '/#hero', label: 'Início' },
  { href: '/patrimonio', label: 'Patrimônio' },
];

const formularioItems = [
  { href: '/formularios/horas-extras', label: 'Registro de Horas Extras' },
  { href: '/formularios/prestacao-contas', label: 'Prestação de Contas' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => setIsOpen((prev) => !prev);
  const handleClose = () => setIsOpen(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 dark:bg-[#0f172a]/95 backdrop-blur-md border-b border-border">
      <div className="container-custom mx-auto h-16 flex items-center justify-between">
  <Link href="/#hero" className="flex items-center gap-2" onClick={handleClose}>
          <Image src="/images/gs-logo.svg" alt="Logotipo" width={40} height={32} className="dark:hidden" priority />
          <Image src="/images/gs-logo-2.svg" alt="Logotipo" width={40} height={32} className="hidden dark:block" priority />
          <span className="sr-only">Ir para o início</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ))}
          
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
              {/* <DropdownMenuItem asChild>
                <Link href="/formularios" className="cursor-pointer font-medium">
                  Ver todos os formulários
                </Link>
              </DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="flex items-center gap-3">
          <ModeToggle />
          {/* <Button asChild className="hidden md:inline-flex">
            <Link href="/formularios" onClick={handleClose}>
              Acessar formulários
            </Link>
          </Button> */}
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

      {isOpen && (
        <div className="md:hidden border-t border-border bg-background dark:bg-[#0f172a]">
          <nav className="container-custom py-4 flex flex-col gap-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-base font-medium text-foreground"
                onClick={handleClose}
              >
                {item.label}
              </Link>
            ))}
            
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
              <Link
                href="/formularios"
                className="text-sm font-medium text-muted-foreground hover:text-foreground pl-4 block py-1"
                onClick={handleClose}
              >
                Ver todos os formulários
              </Link>
            </div>
            
            <Button asChild className="mt-2">
              <Link href="/formularios" onClick={handleClose}>
                Acessar formulários
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}