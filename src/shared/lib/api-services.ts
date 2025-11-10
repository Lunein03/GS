/**
 * Serviços de integração com APIs externas
 * - Brasil API: Validação de CNPJ e consulta de dados da Receita Federal
 * - ViaCEP: Validação de CEP e consulta de endereços
 */

import { removeNonNumeric } from './validators';

// ============================================
// TIPOS
// ============================================

/**
 * Resposta da Brasil API para consulta de CNPJ
 */
export type CNPJData = {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  cnae_fiscal: number;
  cnae_fiscal_descricao: string;
  descricao_tipo_logradouro: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cep: string;
  uf: string;
  codigo_municipio: number;
  municipio: string;
  ddd_telefone_1: string;
  ddd_telefone_2?: string;
  ddd_fax?: string;
  qualificacao_do_responsavel: number;
  capital_social: number;
  porte: string;
  opcao_pelo_simples?: boolean;
  data_opcao_pelo_simples?: string;
  data_exclusao_do_simples?: string;
  opcao_pelo_mei?: boolean;
  situacao_especial?: string;
  data_situacao_especial?: string;
  descricao_situacao_cadastral: string;
  data_situacao_cadastral: string;
  data_inicio_atividade: string;
  nome_cidade_exterior?: string;
  codigo_natureza_juridica: number;
  data_entrada_sociedade?: string;
  motivo_situacao_cadastral: number;
  ente_federativo_responsavel?: string;
  identificador_matriz_filial: number;
  qualificacao_do_responsavel_descricao: string;
  descricao_porte: string;
  descricao_natureza_juridica: string;
  descricao_identificador_matriz_filial: string;
  qsa?: Array<{
    identificador_de_socio: number;
    nome_socio: string;
    cnpj_cpf_do_socio: string;
    codigo_qualificacao_socio: number;
    percentual_capital_social: number;
    data_entrada_sociedade: string;
    cpf_representante_legal?: string;
    nome_representante_legal?: string;
    codigo_qualificacao_representante_legal?: number;
  }>;
};

/**
 * Resposta da ViaCEP para consulta de CEP
 */
export type AddressData = {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia?: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
};

/**
 * Resultado de erro para APIs
 */
export type APIError = {
  error: string;
};

// ============================================
// BRASIL API - CNPJ
// ============================================

/**
 * Consulta dados de CNPJ na Brasil API
 * @param cnpj - CNPJ com ou sem formatação
 * @returns Dados da empresa ou erro
 */
export async function fetchCNPJData(
  cnpj: string
): Promise<CNPJData | APIError> {
  const cleanCnpj = removeNonNumeric(cnpj);
  
  if (cleanCnpj.length !== 14) {
    return { error: 'CNPJ deve ter 14 dígitos' };
  }
  
  try {
    const response = await fetch(
      `https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      if (response.status === 404) {
        return { error: 'CNPJ não encontrado na Receita Federal' };
      }
      if (response.status === 429) {
        return { error: 'Muitas requisições. Tente novamente em alguns segundos' };
      }
      return { error: 'Erro ao consultar CNPJ' };
    }
    
    const data: CNPJData = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao consultar Brasil API:', error);
    return { error: 'Erro de conexão com Brasil API' };
  }
}

/**
 * Verifica se o resultado é um erro
 */
export function isCNPJError(result: CNPJData | APIError): result is APIError {
  return 'error' in result;
}

// ============================================
// VIACEP - CEP
// ============================================

/**
 * Consulta endereço por CEP na ViaCEP
 * @param cep - CEP com ou sem formatação
 * @returns Dados do endereço ou erro
 */
export async function fetchAddressByCEP(
  cep: string
): Promise<AddressData | APIError> {
  const cleanCep = removeNonNumeric(cep);
  
  if (cleanCep.length !== 8) {
    return { error: 'CEP deve ter 8 dígitos' };
  }
  
  try {
    const response = await fetch(
      `https://viacep.com.br/ws/${cleanCep}/json/`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      return { error: 'Erro ao consultar CEP' };
    }
    
    const data: AddressData = await response.json();
    
    if (data.erro) {
      return { error: 'CEP não encontrado' };
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao consultar ViaCEP:', error);
    return { error: 'Erro de conexão com ViaCEP' };
  }
}

/**
 * Verifica se o resultado é um erro
 */
export function isAddressError(result: AddressData | APIError): result is APIError {
  return 'error' in result;
}

// ============================================
// CACHE (OPCIONAL - PARA MELHOR PERFORMANCE)
// ============================================

/**
 * Cache simples em memória para CNPJs consultados
 * Expira após 24 horas
 */
const cnpjCache = new Map<string, { data: CNPJData; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

/**
 * Consulta CNPJ com cache
 * @param cnpj - CNPJ com ou sem formatação
 * @returns Dados da empresa ou erro
 */
export async function fetchCNPJDataWithCache(
  cnpj: string
): Promise<CNPJData | APIError> {
  const cleanCnpj = removeNonNumeric(cnpj);
  
  // Verifica cache
  const cached = cnpjCache.get(cleanCnpj);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  // Busca da API
  const result = await fetchCNPJData(cleanCnpj);
  
  // Armazena em cache se não for erro
  if (!isCNPJError(result)) {
    cnpjCache.set(cleanCnpj, { data: result, timestamp: Date.now() });
  }
  
  return result;
}

/**
 * Limpa o cache de CNPJs
 */
export function clearCNPJCache(): void {
  cnpjCache.clear();
}
