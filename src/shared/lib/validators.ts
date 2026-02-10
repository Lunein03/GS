/**
 * Utilitários de validação para CPF, CNPJ e CEP
 */

/**
 * Remove caracteres não numéricos de uma string
 */
export function removeNonNumeric(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Valida CPF usando algoritmo de dígitos verificadores
 * @param cpf - CPF com ou sem formatação
 * @returns true se o CPF é válido
 */
export function validateCPF(cpf: string): boolean {
  const cleanCpf = removeNonNumeric(cpf);
  
  // CPF deve ter 11 dígitos
  if (cleanCpf.length !== 11) {
    return false;
  }
  
  // Rejeita CPFs com todos os dígitos iguais
  if (/^(\d)\1{10}$/.test(cleanCpf)) {
    return false;
  }
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf.charAt(9))) {
    return false;
  }
  
  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf.charAt(10))) {
    return false;
  }
  
  return true;
}

/**
 * Valida CNPJ usando algoritmo de dígitos verificadores
 * @param cnpj - CNPJ com ou sem formatação
 * @returns true se o CNPJ é válido
 */
export function validateCNPJ(cnpj: string): boolean {
  const cleanCnpj = removeNonNumeric(cnpj);
  
  // CNPJ deve ter 14 dígitos
  if (cleanCnpj.length !== 14) {
    return false;
  }
  
  // Rejeita CNPJs com todos os dígitos iguais
  if (/^(\d)\1{13}$/.test(cleanCnpj)) {
    return false;
  }
  
  // Validação do primeiro dígito verificador
  let length = cleanCnpj.length - 2;
  let numbers = cleanCnpj.substring(0, length);
  const digits = cleanCnpj.substring(length);
  let sum = 0;
  let pos = length - 7;
  
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) {
    return false;
  }
  
  // Validação do segundo dígito verificador
  length = length + 1;
  numbers = cleanCnpj.substring(0, length);
  sum = 0;
  pos = length - 7;
  
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) {
    return false;
  }
  
  return true;
}

/**
 * Valida formato de CEP (8 dígitos)
 * @param cep - CEP com ou sem formatação
 * @returns true se o CEP tem formato válido
 */
export function validateCEP(cep: string): boolean {
  const cleanCep = removeNonNumeric(cep);
  return cleanCep.length === 8;
}

/**
 * Formata CPF para o padrão 000.000.000-00
 * @param cpf - CPF sem formatação
 * @returns CPF formatado
 */
export function formatCPF(cpf: string): string {
  const cleanCpf = removeNonNumeric(cpf);
  if (cleanCpf.length !== 11) return cpf;
  
  return cleanCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata CNPJ para o padrão 00.000.000/0000-00
 * @param cnpj - CNPJ sem formatação
 * @returns CNPJ formatado
 */
export function formatCNPJ(cnpj: string): string {
  const cleanCnpj = removeNonNumeric(cnpj);
  if (cleanCnpj.length !== 14) return cnpj;
  
  return cleanCnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

/**
 * Formata CEP para o padrão 00000-000
 * @param cep - CEP sem formatação
 * @returns CEP formatado
 */
export function formatCEP(cep: string): string {
  const cleanCep = removeNonNumeric(cep);
  if (cleanCep.length !== 8) return cep;
  
  return cleanCep.replace(/(\d{5})(\d{3})/, '$1-$2');
}

/**
 * Formata telefone brasileiro com DDI +55
 * @param phone - Telefone sem formatação
 * @returns Telefone formatado +55 (00) 00000-0000 ou +55 (00) 0000-0000
 */
export function formatPhone(phone: string): string {
  const cleanPhone = removeNonNumeric(phone);
  
  // Remove +55 se já estiver presente
  const phoneWithoutCountryCode = cleanPhone.startsWith('55') ? cleanPhone.substring(2) : cleanPhone;
  
  if (phoneWithoutCountryCode.length === 11) {
    // Celular: +55 (00) 00000-0000
    return phoneWithoutCountryCode.replace(/(\d{2})(\d{5})(\d{4})/, '+55 ($1) $2-$3');
  } else if (phoneWithoutCountryCode.length === 10) {
    // Fixo: +55 (00) 0000-0000
    return phoneWithoutCountryCode.replace(/(\d{2})(\d{4})(\d{4})/, '+55 ($1) $2-$3');
  }
  
  return phone;
}

/**
 * Capitaliza a primeira letra de cada palavra (Title Case)
 * Mantém preposições/artigos em minúsculo (de, da, do, dos, das, e)
 * @param value - string para capitalizar
 * @returns string capitalizada
 */
export function toTitleCase(value: string): string {
  const lowerWords = new Set(['de', 'da', 'do', 'dos', 'das', 'e', 'em', 'com', 'para', 'por']);
  return value
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      if (!word) return word;
      if (index > 0 && lowerWords.has(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}
