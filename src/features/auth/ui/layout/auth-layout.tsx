'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import { BackgroundNoiseOverlay } from '@/shared/ui/background-snippets-noise-effect11';

interface AuthLayoutProps {
  children: ReactNode;
}

const AUTH_NOISE_PATTERN_ALPHA = 8;

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0a0f1c] via-[#151c2a] to-[#1a2332]">
      {/* Noise overlay reutilizando componente compartilhado */}
      <BackgroundNoiseOverlay patternAlpha={AUTH_NOISE_PATTERN_ALPHA} />

      {/* Gradient accent top */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-8 px-4 py-12">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <Image
            src="/images/gs-logo-2.svg"
            alt="GS Produções"
            width={160}
            height={48}
            priority
            className="h-12"
            style={{ width: 'auto' }}
          />
          <p className="text-sm text-muted-foreground">Intranet Corporativa</p>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
}
