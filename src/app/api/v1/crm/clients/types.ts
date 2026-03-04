export type EmpresaTipo = 'fisica' | 'juridica';

export interface Client {
  id: string;
  tipo: EmpresaTipo;
  cpf_cnpj: string;
  nome: string | null;
  cargo: string | null;
  cep: string;
  endereco: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  estado: string;
  contato_nome: string;
  contato_email: string;
  contato_telefone: string;
  ativo: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ClientSecondaryContact {
  id: string;
  client_id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  cargo: string | null;
  created_at: string;
  updated_at: string;
}

export type CreateClientInput = Omit<Client, 'id' | 'ativo' | 'created_at' | 'updated_at' | 'deleted_at'>;
export type UpdateClientInput = Partial<CreateClientInput>;

export type CreateContactInput = Pick<ClientSecondaryContact, 'nome'> &
  Partial<Pick<ClientSecondaryContact, 'email' | 'telefone' | 'cargo'>>;
export type UpdateContactInput = Partial<CreateContactInput>;
