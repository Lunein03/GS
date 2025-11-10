export {
  cepSchema,
  cnpjSchema,
  createClienteSchema,
  cpfSchema,
  deleteClienteSchema,
  emailSchema,
  clienteFormSchema,
  filterSchema,
  getClienteByIdSchema,
  getClientesSchema,
  telefoneSchema,
  updateClienteSchema,
  checkDocumentExistsSchema,
  contatoSecundarioSchema,
  createContatoSecundarioSchema,
  updateContatoSecundarioSchema,
  deleteContatoSecundarioSchema,
} from './cliente-schemas';

export type {
  CheckDocumentExistsInput,
  CreateClienteInput,
  DeleteClienteInput,
  ClienteFormSchema,
  FilterSchema,
  GetClienteByIdInput,
  GetClientesInput,
  UpdateClienteInput,
  ContatoSecundarioSchema,
  CreateContatoSecundarioInput,
  UpdateContatoSecundarioInput,
  DeleteContatoSecundarioInput,
  FilterState,
} from './cliente-schemas';

export type Cliente = {
  id: string;
  tipo: 'fisica' | 'juridica';
  cpfCnpj: string;
  nome: string;
  cargo?: string | null;
  // Endereço
  cep: string;
  endereco: string;
  numero: string;
  complemento?: string | null;
  bairro: string;
  cidade: string;
  estado: string;
  // Contato Principal
  contatoNome: string;
  contatoEmail: string;
  contatoTelefone: string;
  // Metadados
  ativo: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  // Contatos Secundários (opcional, carregado separadamente)
  contatosSecundarios?: ContatoSecundario[];
};

export type ContatoSecundario = {
  id: string;
  clientId: string;
  nome: string;
  email?: string | null;
  telefone?: string | null;
  cargo?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ClienteFormData = import('./cliente-schemas').ClienteFormSchema;

export type { CNPJData, AddressData } from '@/shared/lib/api-services';

export type PaginationParams = {
  page: number;
  pageSize: number;
};

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type DocumentValidationResult = {
  isValid: boolean;
  error?: string;
  data?: import('@/shared/lib/api-services').CNPJData;
};

export type CepValidationResult = {
  isValid: boolean;
  error?: string;
  data?: import('@/shared/lib/api-services').AddressData;
};

export type ClienteActionResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

