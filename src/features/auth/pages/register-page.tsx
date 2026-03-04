'use client';

import { AuthLayout } from '../ui/layout/auth-layout';
import { RegisterForm } from '../ui/components/register-form';

export function RegisterPage() {
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  );
}
