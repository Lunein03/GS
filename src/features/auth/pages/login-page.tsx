'use client';

import { AuthLayout } from '../ui/layout/auth-layout';
import { LoginForm } from '../ui/components/login-form';

export function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
