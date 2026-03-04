'use client';

import type { ReactNode } from 'react';
import type { UserRole } from '../../domain/types';
import { useAuth } from '../../hooks/use-auth';

interface ProtectedSectionProps {
  allowedRoles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function ProtectedSection({
  allowedRoles,
  children,
  fallback = null,
}: ProtectedSectionProps) {
  const { role, isLoading } = useAuth();

  if (isLoading) return null;

  if (!role || !allowedRoles.includes(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
