"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { ModeToggle } from './mode-toggle';
import { Button } from './ui/button';

const navItems = [
  { href: '#hero', label: 'Início' },
  { href: '#services', label: 'Serviços' },
  { href: '#portfolio', label: 'Portfólio' },
  { href: '#studio', label: 'Estúdio' },
  { href: '#contact', label: 'Contato' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => setIsOpen((prev) => !prev);
  const handleClose = () => setIsOpen(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container-custom mx-auto h-16 flex items-center justify-between">
        <Link href="#hero" className="flex items-center gap-2" onClick={handleClose}>
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
        </nav>

        <div className="flex items-center gap-3">
          <ModeToggle />
          <Button asChild className="hidden md:inline-flex">
            <a href="#contact">Fale conosco</a>
          </Button>
          <button
            type="button"
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md border border-border"
            onClick={handleToggle}
            aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-border bg-background">
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
            <Button asChild className="mt-2">
              <a href="#contact" onClick={handleClose}>Fale conosco</a>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}