import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

interface SectionShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  header?: ReactNode;
  contentClassName?: string;
}

export function SectionShell({ title, subtitle, children, className = '', header, contentClassName }: SectionShellProps) {
  const headerContent = header ?? (
    <>
      <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">{title}</h1>
      {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
    </>
  );

  return (
    <section className={cn('w-full', className)}>
      <div className="max-w-6xl mx-auto px-6">
        {headerContent}
        <div className={cn('mt-10 lg:mt-12', contentClassName)}>{children}</div>
      </div>
    </section>
  );
}
