'use client';

import { memo } from 'react';
import { Button } from '@/shared/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { cn } from '@/shared/lib/utils';
import {
  formatCEP,
  formatCNPJ,
  formatCPF,
  formatPhone,
  removeNonNumeric,
} from '@/shared/lib/validators';
import type { Company } from '../types';

type CompanyTableProps = {
  companies: Company[];
  selectedId?: string | null;
  isLoading?: boolean;
  onSelect: (company: Company | null) => void;
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
};

const EMPTY_STATE_MESSAGE = 'Nenhuma empresa cadastrada até o momento.';

const getDisplayName = (company: Company): string => {
  if (company.tipo === 'fisica') {
    return company.nome ?? 'Sem nome';
  }

  return company.nomeFantasia ?? company.razaoSocial ?? 'Sem nome';
};

const getInitials = (value: string | undefined) => {
  if (!value) {
    return 'GS';
  }

  const segments = value.trim().split(' ').filter(Boolean);
  if (segments.length === 0) {
    return 'GS';
  }

  const initials = segments.slice(0, 2).map((segment) => segment[0]?.toUpperCase()).join('');
  return initials || 'GS';
};

const formatDocument = (company: Company) => {
  const digits = removeNonNumeric(company.cpfCnpj);

  if (company.tipo === 'fisica') {
    const formatted = formatCPF(digits);
    return formatted ?? company.cpfCnpj;
  }

  const formatted = formatCNPJ(digits);
  return formatted ?? company.cpfCnpj;
};

const formatAddress = (company: Company) => {
  const parts: string[] = [];
  const addressLine = `${company.endereco}, ${company.numero}`;
  parts.push(addressLine.trim());

  if (company.complemento) {
    parts.push(company.complemento);
  }

  const neighborhoodCity = `${company.bairro} - ${company.cidade}/${company.estado}`;
  parts.push(neighborhoodCity.trim());

  const cep = formatCEP(company.cep);
  parts.push(`CEP: ${cep}`);

  return parts.filter(Boolean).join(' • ');
};

const CompanyTableComponent = ({
  companies,
  selectedId,
  isLoading = false,
  onSelect,
  onEdit,
  onDelete,
}: CompanyTableProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-lg border bg-card py-12">
        <span className="text-muted-foreground">Carregando empresas...</span>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border bg-card py-12 text-center">
        <p className="text-muted-foreground">{EMPTY_STATE_MESSAGE}</p>
        <p className="text-sm text-muted-foreground">
          Clique em "Cadastrar Empresa" para adicionar o primeiro registro.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-4 py-3 text-sm text-muted-foreground">
        Clique duas vezes para editar ou selecione uma linha e utilize os botões de ação.
      </div>
      <div className="overflow-x-auto">
        <table className="w-full" role="table" aria-label="Lista de empresas">
          <thead className="bg-muted/40">
            <tr className="border-b">
              <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Logo
              </th>
              <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Nome
              </th>
              <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Responsável
              </th>
              <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                CPF/CNPJ
              </th>
              <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Telefone
              </th>
              <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                E-mail
              </th>
              <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Endereço
              </th>
              <th scope="col" className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => {
              const isSelected = company.id === selectedId;
              const displayName = getDisplayName(company);

              return (
                <tr
                  key={company.id}
                  className={cn(
                    'cursor-pointer border-b last:border-0 transition-colors hover:bg-muted/40',
                    isSelected && 'bg-primary/10 hover:bg-primary/15',
                  )}
                  onClick={() => onSelect(isSelected ? null : company)}
                  onDoubleClick={() => onEdit(company)}
                  role="row"
                  aria-selected={isSelected}
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      onEdit(company);
                    }
                    if (event.key === ' ') {
                      event.preventDefault();
                      onSelect(isSelected ? null : company);
                    }
                  }}
                >
                  <td className="px-4 py-3 align-middle">
                    <Avatar className="h-10 w-10">
                      {company.logo ? (
                        <AvatarImage src={company.logo} alt={`Logo da empresa ${displayName}`} />
                      ) : null}
                      <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                    </Avatar>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{displayName}</span>
                      {company.tipo === 'juridica' && company.razaoSocial && (
                        <span className="text-xs text-muted-foreground">{company.razaoSocial}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle text-sm text-muted-foreground">
                    {company.contatoNome}
                  </td>
                  <td className="px-4 py-3 align-middle text-sm text-muted-foreground">
                    {formatDocument(company)}
                  </td>
                  <td className="px-4 py-3 align-middle text-sm text-muted-foreground">
                    {formatPhone(company.contatoTelefone)}
                  </td>
                  <td className="px-4 py-3 align-middle text-sm text-muted-foreground">
                    <span className="truncate" title={company.contatoEmail}>
                      {company.contatoEmail}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-middle text-sm text-muted-foreground">
                    <span className="line-clamp-2" title={formatAddress(company)}>
                      {formatAddress(company)}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-middle text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="link"
                        className="px-0 text-primary"
                        onClick={(event) => {
                          event.stopPropagation();
                          onEdit(company);
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant="link"
                        className="px-0 text-destructive"
                        onClick={(event) => {
                          event.stopPropagation();
                          onDelete(company);
                        }}
                      >
                        Excluir
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const CompanyTable = memo(CompanyTableComponent);



