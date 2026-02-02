const CURRENCY_SYMBOL_REGEX = /[R$\u00A0\s]/gi;
const NUMBER_EXTRACTOR = /-?[0-9][0-9.,]*/;
const ACQUISITION_LINE_REGEX = /valor de aquisi[cç][aã]o:\s*([^\n\r]+)/i;

function normalizeNumericString(raw: string): string {
  const value = raw.trim();
  const hasComma = value.includes(',');
  const hasDot = value.includes('.');

  if (hasComma && hasDot) {
    return value.replace(/\./g, '').replace(/,/g, '.');
  }

  if (hasComma) {
    const lastComma = value.lastIndexOf(',');
    const decimalLength = value.length - lastComma - 1;
    if (decimalLength > 0 && decimalLength <= 2) {
      return value.replace(/\./g, '').replace(/,/g, '.');
    }
    return value.replace(/,/g, '');
  }

  if (hasDot) {
    const lastDot = value.lastIndexOf('.');
    const decimalLength = value.length - lastDot - 1;
    if (decimalLength > 0 && decimalLength <= 2) {
      return value;
    }
    return value.replace(/\./g, '');
  }

  return value;
}

function toNumber(value: string): number {
  const sanitized = value.replace(CURRENCY_SYMBOL_REGEX, '');
  const match = sanitized.match(NUMBER_EXTRACTOR);
  if (!match) {
    return 0;
  }

  const normalized = normalizeNumericString(match[0]);
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function parseBRLToCents(input: string | number | bigint): number {
  if (typeof input === 'number' && Number.isFinite(input)) {
    return Math.round(input * 100);
  }

  if (typeof input === 'bigint') {
    return Number(input);
  }

  const trimmed = String(input).trim();
  if (!trimmed) {
    return 0;
  }

  return Math.round(toNumber(trimmed) * 100);
}

export function formatCentsToBRL(cents: number | bigint): string {
  const value = Number(cents) / 100;
  return value.toLocaleString('pt-BR', { currency: 'BRL', style: 'currency' });
}

export function sumCents(values: Array<number | bigint>): number {
  let accumulator = BigInt(0);

  for (const value of values) {
    const normalized = Math.trunc(Number(value));
    if (!Number.isFinite(normalized)) {
      continue;
    }
    accumulator += BigInt(normalized);
  }

  return Number(accumulator);
}

export function coerceCents(value: unknown): number | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.trunc(value);
  }

  if (typeof value === 'bigint') {
    return Number(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return undefined;
    }

    if (/^-?\d+$/.test(trimmed)) {
      const parsed = Number.parseInt(trimmed, 10);
      return Number.isFinite(parsed) ? parsed : undefined;
    }

    const parsed = parseBRLToCents(trimmed);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

export function extractAcquisitionCentsFromNotes(notes?: string | null): number | undefined {
  if (!notes) {
    return undefined;
  }

  const match = notes.match(ACQUISITION_LINE_REGEX);
  if (!match) {
    return undefined;
  }

  const raw = match[1]?.trim();
  if (!raw) {
    return undefined;
  }

  const cents = parseBRLToCents(raw);
  return Number.isFinite(cents) ? cents : undefined;
}

/**
 * Formata um valor de entrada para o formato BRL enquanto o usuário digita.
 * Remove caracteres não numéricos e aplica máscara R$ 1.234,56
 * 
 * @param value - Valor de entrada (pode conter letras, símbolos, etc.)
 * @returns Valor formatado no padrão BRL
 * 
 * @example
 * formatBRLInput('1234567') // 'R$ 12.345,67'
 * formatBRLInput('R$ 1.234,56') // 'R$ 1.234,56'
 * formatBRLInput('abc123def') // 'R$ 1,23'
 */
export function formatBRLInput(value: string): string {
  // Remove tudo exceto dígitos
  const digits = value.replace(/\D/g, '');
  
  if (!digits) {
    return '';
  }
  
  // Converte para número em centavos
  const cents = Number(digits);
  
  // Converte centavos para reais
  const reais = cents / 100;
  
  // Formata no padrão brasileiro
  return reais.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
