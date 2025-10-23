export {
	cepSchema,
	cnpjSchema,
	createEmpresaSchema,
	cpfSchema,
	deleteEmpresaSchema,
	emailSchema,
	empresaFormSchema,
	filterSchema,
	getEmpresaByIdSchema,
	getEmpresasSchema,
	logoUploadSchema,
	telefoneSchema,
	updateEmpresaSchema,
	checkDocumentExistsSchema,
} from './empresa-schemas';

export type {
	CheckDocumentExistsInput,
	CreateEmpresaInput,
	DeleteEmpresaInput,
	EmpresaFormSchema,
	FilterSchema,
	GetEmpresaByIdInput,
	GetEmpresasInput,
	LogoUploadSchema,
	UpdateEmpresaInput,
} from './empresa-schemas';

export type Empresa = {
	id: string;
	tipo: 'fisica' | 'juridica';
	cpfCnpj: string;
	nome?: string | null;
	razaoSocial?: string | null;
	nomeFantasia?: string | null;
	logo?: string | null;
	contatoNome: string;
	contatoEmail: string;
	contatoTelefone: string;
	cep: string;
	endereco: string;
	numero: string;
	complemento?: string | null;
	bairro: string;
	cidade: string;
	estado: string;
	ativo: number;
	createdAt: Date;
	updatedAt: Date;
	deletedAt?: Date | null;
};

export type EmpresaFormData = Omit<Empresa, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>;

export type { CNPJData, AddressData } from '@/lib/api-services';

export type FilterState = {
	search: string;
	tipo?: 'fisica' | 'juridica' | 'all';
	status?: 'ativo' | 'inativo' | 'all';
	estado?: string;
};

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
	data?: import('@/lib/api-services').CNPJData;
};

export type CepValidationResult = {
	isValid: boolean;
	error?: string;
	data?: import('@/lib/api-services').AddressData;
};

export type EmpresaActionResult<T = void> = {
	success: boolean;
	data?: T;
	error?: string;
};
