'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';

import { updateUserRole } from '../../../api/profiles';
import type { UserProfile, UserRole } from '../../../domain/types';

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'dono', label: 'Dono' },
  { value: 'admin', label: 'Admin' },
  { value: 'rh', label: 'RH' },
  { value: 'colaborador', label: 'Colaborador' },
];

interface RoleSelectProps {
  user: UserProfile;
  onSuccess: () => void;
}

export function RoleSelect({ user, onSuccess }: RoleSelectProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleRoleChange = async (newRole: string) => {
    if (newRole === user.role) return;

    setIsUpdating(true);
    try {
      await updateUserRole(user.userId, newRole);
      toast.success(`Cargo de ${user.fullName} alterado para ${ROLE_OPTIONS.find((r) => r.value === newRole)?.label}`);
      onSuccess();
    } catch {
      toast.error('Erro ao alterar cargo.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Select
      defaultValue={user.role}
      onValueChange={handleRoleChange}
      disabled={isUpdating}
    >
      <SelectTrigger className="h-8 w-[130px]" aria-label={`Cargo de ${user.fullName}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ROLE_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
