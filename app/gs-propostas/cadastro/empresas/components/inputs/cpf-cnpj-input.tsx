'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  validateCPF,
  validateCNPJ,
  removeNonNumeric,
  formatCPF,
  formatCNPJ,
} from '@/lib/validators';
import { fetchCNPJData, isCNPJError, type CNPJData } from '@/lib/api-services';

// ============================================
// TYPES
// ============================================

export interface CpfCnpjInputProps {
  tipo: 'fisica' | 'juridica';
  value: string;
  onChange: (value: string) => void;
  onValidationComplete?: (isValid: boolean, data?: CNPJData) => void;
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

export function CpfCnpjInput({
  tipo,
  value,
  onChange,
  onValidationComplete,
  error: externalError,
  disabled = false,
  className,
  label,
  required = true,
}: CpfCnpjInputProps) {
  const [validationState, setValidationState] = useState<ValidationState>('idle');
  const [internalError, setInternalError] = useState<string>('');
  const [isDebouncing, setIsDebouncing] = useState(false);

  // Determina o erro a ser exibido (externo tem prioridade)
  const displayError = externalError || internalError;

  // Label padrão baseado no tipo
  const defaultLabel = tipo === 'fisica' ? 'CPF' : 'CNPJ';
  const displayLabel = label || defaultLabel;

  // Máscara do documento baseado no tipo
  const maskDocument = useCallback(
    (doc: string): string => {
      const clean = removeNonNumeric(doc);

      if (tipo === 'fisica') {
        // Máscara CPF: 000.000.000-00
        if (clean.length <= 3) return clean;
        if (clean.length <= 6) return `${clean.slice(0, 3)}.${clean.slice(3)}`;
        if (clean.length <= 9)
          return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6)}`;
        return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9, 11)}`;
      } else {
        // Máscara CNPJ: 00.000.000/0000-00
        if (clean.length <= 2) return clean;
        if (clean.length <= 5) return `${clean.slice(0, 2)}.${clean.slice(2)}`;
        if (clean.length <= 8)
          return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5)}`;
        if (clean.length <= 12)
          return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8)}`;
        return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8, 12)}-${clean.slice(12, 14)}`;
      }
    },
    [tipo]
  );

  // Validação algorítmica do documento
  const validateDocument = useCallback(
    (doc: string): boolean => {
      const clean = removeNonNumeric(doc);

      if (tipo === 'fisica') {
        return clean.length === 11 && validateCPF(clean);
      } else {
        return clean.length === 14 && validateCNPJ(clean);
      }
    },
    [tipo]
  );

  // Consulta CNPJ na Brasil API com debounce
  const fetchCNPJWithDebounce = useMemo(
    () => {
      let timeoutId: NodeJS.Timeout;

      return async (cnpj: string) => {
        setIsDebouncing(true);
        clearTimeout(timeoutId);

        return new Promise<CNPJData | null>((resolve) => {
          timeoutId = setTimeout(async () => {
            setIsDebouncing(false);
            setValidationState('validating');

            try {
              const result = await fetchCNPJData(cnpj);

              if (isCNPJError(result)) {
                setInternalError(result.error);
                setValidationState('invalid');
                onValidationComplete?.(false);
                resolve(null);
              } else {
                setInternalError('');
                setValidationState('valid');
                onValidationComplete?.(true, result);
                resolve(result);
              }
            } catch (err) {
              setInternalError('Erro ao consultar CNPJ');
              setValidationState('invalid');
              onValidationComplete?.(false);
              resolve(null);
            }
          }, 500); // Debounce de 500ms
        });
      };
    },
    [onValidationComplete]
  );

  // Handler de mudança de valor
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const masked = maskDocument(inputValue);
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

    // Verificar se o documento está completo
    const expectedLength = tipo === 'fisica' ? 11 : 14;

    if (clean.length < expectedLength) {
      setValidationState('idle');
      setInternalError('');
      return;
    }

    // Validação algorítmica
    const isAlgorithmicallyValid = validateDocument(value);

    if (!isAlgorithmicallyValid) {
      setValidationState('invalid');
      setInternalError(
        tipo === 'fisica' ? 'CPF inválido' : 'CNPJ inválido'
      );
      onValidationComplete?.(false);
      return;
    }

    // Se for CPF, apenas validação algorítmica é suficiente
    if (tipo === 'fisica') {
      setValidationState('valid');
      setInternalError('');
      onValidationComplete?.(true);
      return;
    }

    // Se for CNPJ, consultar Brasil API
    if (tipo === 'juridica') {
      fetchCNPJWithDebounce(clean);
    }
  }, [value, tipo, validateDocument, fetchCNPJWithDebounce, onValidationComplete]);

  // Ícone de feedback visual
  const renderFeedbackIcon = () => {
    if (isDebouncing || validationState === 'validating') {
      return (
        <Loader2
          className="h-5 w-5 animate-spin text-muted-foreground"
          aria-label="Validando documento"
        />
      );
    }

    if (validationState === 'valid') {
      return (
        <CheckCircle2
          className="h-5 w-5 text-green-600 dark:text-green-500"
          aria-label="Documento válido"
        />
      );
    }

    if (validationState === 'invalid' && displayError) {
      return (
        <XCircle
          className="h-5 w-5 text-red-600 dark:text-red-500"
          aria-label="Documento inválido"
        />
      );
    }

    return null;
  };

  return (
    <div className={cn('space-y-2', className)}>
      {displayLabel && (
        <Label htmlFor="cpf-cnpj-input">
          {displayLabel}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      <div className="relative">
        <Input
          id="cpf-cnpj-input"
          type="text"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          placeholder={
            tipo === 'fisica' ? '000.000.000-00' : '00.000.000/0000-00'
          }
          maxLength={tipo === 'fisica' ? 14 : 18}
          className={cn(
            'pr-10',
            displayError && 'border-red-500 focus-visible:ring-red-500'
          )}
          aria-invalid={!!displayError}
          aria-describedby={displayError ? 'cpf-cnpj-error' : undefined}
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
          id="cpf-cnpj-error"
          className="text-sm text-red-600 dark:text-red-500"
          role="alert"
        >
          {displayError}
        </p>
      )}
    </div>
  );
}
