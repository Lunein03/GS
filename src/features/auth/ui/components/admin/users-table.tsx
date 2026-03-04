'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/shared/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';

import { getAllProfiles } from '../../../api/profiles';
import { authKeys } from '../../../domain/query-keys';
import type { UserProfile } from '../../../domain/types';
import { ApproveRejectActions } from './approve-reject-actions';
import { RoleSelect } from './role-select';

export function UsersTable() {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: authKeys.users(),
    queryFn: getAllProfiles,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Carregando usuários...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-destructive">Erro ao carregar usuários.</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Nenhum usuário encontrado.</p>
      </div>
    );
  }

  const handleMutationSuccess = () => {
    queryClient.invalidateQueries({ queryKey: authKeys.users() });
  };

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.fullName}</TableCell>
              <TableCell className="text-muted-foreground">{user.email}</TableCell>
              <TableCell>
                <RoleSelect user={user} onSuccess={handleMutationSuccess} />
              </TableCell>
              <TableCell>
                {user.isApproved ? (
                  <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                    Aprovado
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600">
                    Pendente
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <ApproveRejectActions user={user} onSuccess={handleMutationSuccess} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
