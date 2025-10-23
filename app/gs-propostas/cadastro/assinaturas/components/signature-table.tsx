'use client';

import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatCPF, formatPhone } from '@/lib/validators';
import type { Signature } from '../types';
import { SignatureStatusBadge } from './signature-status-badge';
import { SignatureTypeBadge } from './signature-type-badge';

const EMPTY_STATE_MESSAGE = 'Nenhuma assinatura cadastrada no momento.';

const PLACEHOLDER_SIGNATURE_ALT = 'Visualizacao da assinatura personalizada';

function formatGovbrIdentifier(signature: Signature) {
  if (!signature.govbrIdentifier) {
    return 'Gov.br';
  }

  if (signature.govbrIdentifier.length <= 8) {
    return signature.govbrIdentifier;
  }

  return `${signature.govbrIdentifier.slice(0, 4)}…${signature.govbrIdentifier.slice(-3)}`;
}

type SignatureTableProps = {
  signatures: Signature[];
  selectedId?: string | null;
  isLoading?: boolean;
  onSelect: (signature: Signature | null) => void;
  onEdit: (signature: Signature) => void;
};

function SignatureTableComponent({
  signatures,
  selectedId,
  isLoading = false,
  onSelect,
  onEdit,
}: SignatureTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-lg border bg-card py-12">
        <span className="text-muted-foreground">Carregando assinaturas...</span>
      </div>
    );
  }

  if (signatures.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border bg-card py-12 text-center">
        <p className="text-muted-foreground">{EMPTY_STATE_MESSAGE}</p>
        <p className="text-sm text-muted-foreground">
          Clique em "Cadastrar Assinatura" para adicionar a primeira assinatura.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-4 py-3 text-sm text-muted-foreground">
        Clique duas vezes para editar ou selecione uma linha para habilitar as acoes.
      </div>
      <div className="overflow-x-auto">
        <table className="w-full" role="table" aria-label="Lista de assinaturas">
          <thead className="bg-muted/40">
            <tr className="border-b">
              <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Nome
              </th>
              <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                CPF
              </th>
              <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                E-mail
              </th>
              <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Telefone
              </th>
              <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Tipo
              </th>
              <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Assinatura
              </th>
              <th scope="col" className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                Acoes
              </th>
            </tr>
          </thead>
          <tbody>
            {signatures.map((signature) => {
              const isSelected = signature.id === selectedId;

              return (
                <tr
                  key={signature.id}
                  className={cn(
                    'cursor-pointer border-b last:border-0 transition-colors hover:bg-muted/40',
                    isSelected && 'bg-primary/10 hover:bg-primary/15',
                  )}
                  onClick={() => onSelect(isSelected ? null : signature)}
                  onDoubleClick={() => onEdit(signature)}
                  role="row"
                  aria-selected={isSelected}
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      onEdit(signature);
                    }
                    if (event.key === ' ') {
                      event.preventDefault();
                      onSelect(isSelected ? null : signature);
                    }
                  }}
                >
                  <td className="px-4 py-3 align-middle">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{signature.name}</span>
                      {signature.signatureType === 'govbr' && signature.govbrIdentifier && (
                        <span className="text-xs text-muted-foreground">
                          ID Gov.br: {formatGovbrIdentifier(signature)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle text-sm text-muted-foreground">
                    {formatCPF(signature.cpf)}
                  </td>
                  <td className="px-4 py-3 align-middle text-sm text-muted-foreground">
                    <span className="break-all">{signature.email}</span>
                  </td>
                  <td className="px-4 py-3 align-middle text-sm text-muted-foreground">
                    {formatPhone(signature.phone)}
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <SignatureTypeBadge type={signature.signatureType} />
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <SignatureStatusBadge status={signature.status} />
                  </td>
                  <td className="px-4 py-3 align-middle">
                    {signature.signatureType === 'custom' && signature.signatureImage ? (
                      <div className="flex flex-col items-start gap-2">
                        <Badge variant="outline" className="text-xs">
                          Personalizada
                        </Badge>
                        <img
                          src={signature.signatureImage}
                          alt={PLACEHOLDER_SIGNATURE_ALT}
                          className="h-12 max-w-[200px] rounded border bg-white object-contain"
                        />
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Validacao Gov.br</span>
                    )}
                  </td>
                  <td className="px-4 py-3 align-middle text-right">
                    <Button
                      type="button"
                      variant="link"
                      className="px-0 text-primary"
                      onClick={(event) => {
                        event.stopPropagation();
                        onEdit(signature);
                      }}
                    >
                      Editar
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const SignatureTable = memo(SignatureTableComponent);
