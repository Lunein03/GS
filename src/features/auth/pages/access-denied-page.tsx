'use client';

import { AuthLayout } from '../ui/layout/auth-layout';
import { AccessDenied } from '../ui/components/access-denied';

export function AccessDeniedPage() {
  return (
    <AuthLayout>
      <AccessDenied />
    </AuthLayout>
  );
}
