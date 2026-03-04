export type EmpresaTipo = 'fisica' | 'juridica';

export interface Company {
  id: string;
  tipo: EmpresaTipo;
  cpf_cnpj: string;
  nome: string | null;
  razao_social: string | null;
  nome_fantasia: string | null;
  logo: string | null;
  contato_nome: string;
  contato_email: string;
  contato_telefone: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  estado: string;
  ativo: number;
  assinatura_tipo: string | null;
  assinatura_status: string | null;
  assinatura_cpf_titular: string | null;
  assinatura_nome_titular: string | null;
  assinatura_govbr_identifier: string | null;
  assinatura_validado_em: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type CreateCompanyInput = Omit<
  Company,
  | 'id' | 'ativo' | 'created_at' | 'updated_at' | 'deleted_at'
  | 'assinatura_tipo' | 'assinatura_status' | 'assinatura_cpf_titular'
  | 'assinatura_nome_titular' | 'assinatura_govbr_identifier' | 'assinatura_validado_em'
>;

export type UpdateCompanyInput = Partial<
  Omit<Company, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>
>;
