'use client';

import { useState, useEffect, useMemo } from 'react';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { removeNonNumeric } from '@/lib/validators';
import { fetchAddressByCEP, isAddressError, type AddressData } from '@/lib/api-services';

// ============================================
// TYPES
// ============================================

export interface CepInputProps {
  value: string;
  onChange: (value: string) => void;
  onAddressFound?: (address: AddressData) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
  required?: boolean;
}

type ValidationState = 'idle' | 'validating' | 'valid' | 'invalid';

// ============================================
// COMPONENT
// ============================================

export function CepInput({
  value,
  onChange,
  onAddressFound,
  error: externalError,
  disabled = false,
  className,
  label = 'CEP',
  required = true,
}: CepInputProps) {
  const [validationState, setValidationState] = useState<ValidationState>('idle');
  const [internalError, setInternalError] = useState<string>('');
  const [isDebouncing, setIsDebouncing] = useState(false);

  // Determina o erro a ser exibido (externo tem prioridade)
  const displayError = externalError || internalError;

  // Máscara do CEP: 00000-000
  const maskCEP = (cep: string): string => {
    const clean = removeNonNumeric(cep);

    if (clean.length <= 5) return clean;
    return `${clean.slice(0, 5)}-${clean.slice(5, 8)}`;
  };

  // Consulta CEP na ViaCEP com debounce
  const fetchCEPWithDebounce = useMemo(
    () => {
      let timeoutId: NodeJS.Timeout;

      return async (cep: string) => {
        setIsDebouncing(true);
        clearTimeout(timeoutId);

        return new Promise<AddressData | null>((resolve) => {
          timeoutId = setTimeout(async () => {
            setIsDebouncing(false);
            setValidationState('validating');

            try {
              const result = await fetchAddressByCEP(cep);

              if (isAddressError(result)) {
                setInternalError(result.error);
                setValidationState('invalid');
                resolve(null);
              } else {
                setInternalError('');
                setValidationState('valid');
                onAddressFound?.(result);
                resolve(result);
              }
            } catch (err) {
              setInternalError('Erro ao consultar CEP');
              setValidationState('invalid');
              resolve(null);
            }
          }, 500); // Debounce de 500ms
        });
      };
    },
    [onAddressFound]
  );

  // Handler de mudança de valor
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const masked = maskCEP(inputValue);
    onChange(masked);
  };

  // Efeito para validação em tempo real
  useEffect(() => {
    const clean = removeNonNumeric(value);

    // Resetar estado se campo estiver vazio
    if (!clean) {
      setValidationState('idle');
      setInternalError('');
      return;
    }

    // Verificar se o CEP está completo (8 dígitos)
    if (clean.length < 8) {
      setValidationState('idle');
      setInternalError('');
      return;
    }

    // Validar formato básico (apenas números e tamanho correto)
    if (clean.length !== 8) {
      setValidationState('invalid');
      setInternalError('CEP deve ter 8 dígitos');
      return;
    }

    // Consultar ViaCEP
    fetchCEPWithDebounce(clean);
  }, [value, fetchCEPWithDebounce]);

  // Ícone de feedback visual
  const renderFeedbackIcon = () => {
    if (isDebouncing || validationState === 'validating') {
      return (
        <Loader2
          className="h-5 w-5 animate-spin text-muted-foreground"
          aria-label="Validando CEP"
        />
      );
    }

    if (validationState === 'valid') {
      return (
        <CheckCircle2
          className="h-5 w-5 text-green-600 dark:text-green-500"
          aria-label="CEP válido"
        />
      );
    }

    if (validationState === 'invalid' && displayError) {
      return (
        <XCircle
          className="h-5 w-5 text-red-600 dark:text-red-500"
          aria-label="CEP inválido"
        />
      );
    }

    return null;
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor="cep-input">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      <div className="relative">
        <Input
          id="cep-input"
          type="text"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          placeholder="00000-000"
          maxLength={9}
          className={cn(
            'pr-10',
            displayError && 'border-red-500 focus-visible:ring-red-500'
          )}
          aria-invalid={!!displayError}
          aria-describedby={displayError ? 'cep-error' : undefined}
          aria-required={required}
        />

        {/* Ícone de feedback */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {renderFeedbackIcon()}
        </div>
      </div>

      {/* Mensagem de erro */}
      {displayError && (
        <p
          id="cep-error"
          className="text-sm text-red-600 dark:text-red-500"
          role="alert"
        >
          {displayError}
        </p>
      )}
    </div>
  );
}
