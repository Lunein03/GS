'use client';

import { UsersTable } from '../../ui/components/admin/users-table';

export function AdminUsersPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Gerenciar Usuários</h1>
        <p className="text-muted-foreground">
          Aprove, rejeite ou altere o cargo dos usuários da intranet.
        </p>
      </div>

      <UsersTable />
    </div>
  );
}
