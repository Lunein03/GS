'use client';

import { memo } from 'react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { cn } from '@/shared/lib/utils';
import type { PaymentMode } from '../types';

const percentFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const EMPTY_STATE_MESSAGE = 'Nenhum modo de pagamento cadastrado ate o momento.';

type PaymentModeTableProps = {
  paymentModes: PaymentMode[];
  selectedId?: string | null;
  isLoading?: boolean;
  onSelect: (paymentMode: PaymentMode | null) => void;
  onEdit: (paymentMode: PaymentMode) => void;
};

function formatPercent(value: number): string {
  return percentFormatter.format((value || 0) / 100);
}

function PaymentModeTableComponent({
  paymentModes,
  selectedId,
  isLoading = false,
  onSelect,
  onEdit,
}: PaymentModeTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-lg border bg-card py-12">
        <span className="text-muted-foreground">Carregando modos de pagamento...</span>
      </div>
    );
  }

  if (paymentModes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border bg-card py-12 text-center">
        <p className="text-muted-foreground">{EMPTY_STATE_MESSAGE}</p>
        <p className="text-sm text-muted-foreground">
          Clique em "Cadastrar Modo de Pagamento" para adicionar a primeira forma de pagamento.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-4 py-3 text-sm text-muted-foreground">
        Clique duas vezes para editar ou selecione uma linha e use os botoes de acao.
      </div>
      <div className="overflow-x-auto">
        <table className="w-full" role="table" aria-label="Lista de modos de pagamento">
          <thead className="bg-muted/40">
            <tr className="border-b">
              <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Nome
              </th>
              <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Prestacoes
              </th>
              <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Taxa de juros
              </th>
              <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Ajuste
              </th>
              <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Descricao
              </th>
              <th scope="col" className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                Acoes
              </th>
            </tr>
          </thead>
          <tbody>
            {paymentModes.map((paymentMode) => {
              const isSelected = paymentMode.id === selectedId;

              return (
                <tr
                  key={paymentMode.id}
                  className={cn(
                    'cursor-pointer border-b last:border-0 transition-colors hover:bg-muted/40',
                    isSelected && 'bg-primary/10 hover:bg-primary/15',
                  )}
                  onClick={() => onSelect(isSelected ? null : paymentMode)}
                  onDoubleClick={() => onEdit(paymentMode)}
                  role="row"
                  aria-selected={isSelected}
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      onEdit(paymentMode);
                    }
                    if (event.key === ' ') {
                      event.preventDefault();
                      onSelect(isSelected ? null : paymentMode);
                    }
                  }}
                >
                  <td className="px-4 py-3 align-middle">
                    <span className="font-medium text-foreground">{paymentMode.name}</span>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <Badge variant="secondary" className="font-medium">
                      {paymentMode.installments}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 align-middle text-sm text-muted-foreground">
                    {formatPercent(paymentMode.interestRate)}
                  </td>
                  <td className="px-4 py-3 align-middle text-sm text-muted-foreground">
                    {formatPercent(paymentMode.adjustmentRate)}
                  </td>
                  <td className="px-4 py-3 align-middle">
                    {paymentMode.description ? (
                      <p className="max-w-xl text-sm text-muted-foreground line-clamp-2">
                        {paymentMode.description}
                      </p>
                    ) : (
                      <span className="text-sm text-muted-foreground">Sem descricao</span>
                    )}
                  </td>
                  <td className="px-4 py-3 align-middle text-right">
                    <Button
                      type="button"
                      variant="link"
                      className="px-0 text-primary"
                      onClick={(event) => {
                        event.stopPropagation();
                        onEdit(paymentMode);
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

export const PaymentModeTable = memo(PaymentModeTableComponent);


