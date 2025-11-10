import { pgTable, text, timestamp, uuid, decimal, integer, pgEnum, primaryKey } from 'drizzle-orm/pg-core';

// ============================================
// ENUMS
// ============================================

// GS Propostas
export const opportunityStatusEnum = pgEnum('opportunity_status', ['OPEN', 'IN_PROGRESS', 'WON', 'LOST']);
export const proposalStatusEnum = pgEnum('proposal_status', ['DRAFT', 'OPEN', 'SENT', 'WON', 'LOST']);
export const activityStatusEnum = pgEnum('activity_status', ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']);
export const activityPriorityEnum = pgEnum('activity_priority', ['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
export const empresaTipoEnum = pgEnum('empresa_tipo', ['fisica', 'juridica']);
export const proposalNoteModeEnum = pgEnum('proposal_note_mode', ['manual', 'automatic']);
export const proposalSignatureTypeEnum = pgEnum('proposal_signature_type', ['govbr', 'custom']);
export const proposalSignatureStatusEnum = pgEnum('proposal_signature_status', ['pending', 'verified', 'revoked']);

// Patrimônio
export const equipmentStatusEnum = pgEnum('equipment_status', ['available', 'in-use', 'maintenance', 'retired']);

// Opportunities (Oportunidades)
export const opportunities = pgTable('opportunities', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  value: decimal('value', { precision: 12, scale: 2 }).notNull().default('0'),
  status: opportunityStatusEnum('status').notNull().default('OPEN'),
  probability: integer('probability').default(50), // 0-100
  nextStep: text('next_step'),
  clientName: text('client_name'),
  clientEmail: text('client_email'),
  responsibleUser: text('responsible_user'),
  tags: text('tags').array(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Opportunity Activities (Histórico de movimentações)
export const opportunityActivities = pgTable('opportunity_activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  opportunityId: uuid('opportunity_id').notNull().references(() => opportunities.id, { onDelete: 'cascade' }),
  action: text('action').notNull(), // 'status_changed', 'created', 'updated', 'note_added'
  fromStatus: opportunityStatusEnum('from_status'),
  toStatus: opportunityStatusEnum('to_status'),
  notes: text('notes'),
  userId: text('user_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Proposals (Propostas Comerciais)
export const proposals = pgTable('proposals', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(),
  title: text('title').notNull(),
  opportunityId: uuid('opportunity_id').references(() => opportunities.id),
  status: proposalStatusEnum('status').notNull().default('DRAFT'),
  clientName: text('client_name').notNull(),
  clientEmail: text('client_email'),
  clientPhone: text('client_phone'),
  companyName: text('company_name'),
  paymentMode: text('payment_mode'),
  validUntil: timestamp('valid_until'),
  totalValue: decimal('total_value', { precision: 12, scale: 2 }).notNull().default('0'),
  discount: decimal('discount', { precision: 12, scale: 2 }).default('0'),
  notes: text('notes'),
  tags: text('tags').array(),
  responsibleUser: text('responsible_user'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Proposal Items (Itens da Proposta)
export const proposalItems = pgTable('proposal_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  proposalId: uuid('proposal_id').notNull().references(() => proposals.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'product' or 'service'
  name: text('name').notNull(),
  description: text('description'),
  quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull().default('1'),
  unitPrice: decimal('unit_price', { precision: 12, scale: 2 }).notNull(),
  discount: decimal('discount', { precision: 12, scale: 2 }).default('0'),
  total: decimal('total', { precision: 12, scale: 2 }).notNull(),
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Activities (Atividades/Tarefas)
export const activities = pgTable('activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  status: activityStatusEnum('status').notNull().default('PENDING'),
  priority: activityPriorityEnum('priority').notNull().default('MEDIUM'),
  proposalId: uuid('proposal_id').references(() => proposals.id, { onDelete: 'cascade' }),
  opportunityId: uuid('opportunity_id').references(() => opportunities.id, { onDelete: 'cascade' }),
  assignedTo: text('assigned_to'),
  dueDate: timestamp('due_date'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Clients (Clientes - Cadastro Completo)
export const clients = pgTable('clients', {
  id: uuid('id').primaryKey().defaultRandom(),
  tipo: empresaTipoEnum('tipo').notNull(),
  cpfCnpj: text('cpf_cnpj').notNull().unique(),
  nome: text('nome'), // Nome completo (PF) ou Nome/Empresa (PJ)
  cargo: text('cargo'), // Cargo do contato principal
  // Endereço
  cep: text('cep').notNull(),
  endereco: text('endereco').notNull(),
  numero: text('numero').notNull(),
  complemento: text('complemento'),
  bairro: text('bairro').notNull(),
  cidade: text('cidade').notNull(),
  estado: text('estado').notNull(),
  // Contato Principal
  contatoNome: text('contato_nome').notNull(),
  contatoEmail: text('contato_email').notNull(),
  contatoTelefone: text('contato_telefone').notNull(),
  // Metadados
  ativo: integer('ativo').notNull().default(1), // 1 = ativo, 0 = inativo
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'), // Soft delete
});

// Client Secondary Contacts (Contatos Secundários dos Clientes)
export const clientSecondaryContacts = pgTable('client_secondary_contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  nome: text('nome').notNull(),
  email: text('email'),
  telefone: text('telefone'),
  cargo: text('cargo'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Empresas (Cadastro de Empresas - PF/PJ)
export const empresas = pgTable('empresas', {
  id: uuid('id').primaryKey().defaultRandom(),
  tipo: empresaTipoEnum('tipo').notNull(),
  cpfCnpj: text('cpf_cnpj').notNull().unique(),
  nome: text('nome'), // Nome completo (PF)
  razaoSocial: text('razao_social'), // Razão social (PJ)
  nomeFantasia: text('nome_fantasia'), // Nome fantasia (PJ)
  logo: text('logo'), // URL ou path da logo
  contatoNome: text('contato_nome').notNull(),
  contatoEmail: text('contato_email').notNull(),
  contatoTelefone: text('contato_telefone').notNull(),
  cep: text('cep').notNull(),
  endereco: text('endereco').notNull(),
  numero: text('numero').notNull(),
  complemento: text('complemento'),
  bairro: text('bairro').notNull(),
  cidade: text('cidade').notNull(),
  estado: text('estado').notNull(),
  ativo: integer('ativo').notNull().default(1), // 1 = ativo, 0 = inativo
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'), // Soft delete
});

// Categories (Categorias para Produtos/Serviços)
export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  color: text('color').notNull(), // Hex color code
  optionalField: text('optional_field'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'), // Soft delete
});

// Proposal Notes (Blocos de texto padrao para propostas)
export const proposalNotes = pgTable('proposal_notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  inclusionMode: proposalNoteModeEnum('inclusion_mode').notNull().default('manual'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

// Payment Modes (Formas de pagamento disponiveis nas propostas)
export const paymentModes = pgTable('payment_modes', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  installments: integer('installments').notNull().default(1),
  interestRate: decimal('interest_rate', { precision: 8, scale: 4 }).notNull().default('0'),
  adjustmentRate: decimal('adjustment_rate', { precision: 8, scale: 4 }).notNull().default('0'),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

// Proposal Signatures (Assinaturas utilizadas nas propostas comerciais)
export const proposalSignatures = pgTable('proposal_signatures', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  cpf: text('cpf').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  signatureType: proposalSignatureTypeEnum('signature_type').notNull(),
  status: proposalSignatureStatusEnum('status').notNull().default('pending'),
  govbrIdentifier: text('govbr_identifier'),
  govbrLastValidatedAt: timestamp('govbr_last_validated_at'),
  signatureImage: text('signature_image'),
  signatureImageMime: text('signature_image_mime'),
  signatureImageWidth: integer('signature_image_width'),
  signatureImageHeight: integer('signature_image_height'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

// Items Master (Produtos/Serviços Cadastrados)
export const items = pgTable('items', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: text('type').notNull(), // 'product' or 'service'
  name: text('name').notNull(),
  description: text('description'),
  defaultPrice: decimal('default_price', { precision: 12, scale: 2 }).notNull(),
  category: text('category'),
  active: integer('active').notNull().default(1), // 1 = active, 0 = inactive
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================
// MÓDULO PATRIMÔNIO
// ============================================

// Equipment (Equipamentos)
export const equipment = pgTable('equipment', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  brand: text('brand'),
  model: text('model'),
  serialNumber: text('serial_number'),
  acquisitionDate: timestamp('acquisition_date').notNull(),
  status: equipmentStatusEnum('status').notNull().default('available'),
  location: text('location'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'), // Soft delete
});

// Events (Eventos)
export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  date: timestamp('date').notNull(),
  location: text('location').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'), // Soft delete
});

// Event Equipment (Relação Muitos-para-Muitos entre Eventos e Equipamentos)
export const eventEquipment = pgTable('event_equipment', {
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  equipmentId: uuid('equipment_id').notNull().references(() => equipment.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.eventId, table.equipmentId] }),
}));

// ============================================
// MÓDULO INTRANET - FORMULÁRIOS
// ============================================

// Overtime Requests (Solicitações de Horas Extras)
export const overtimeRequests = pgTable('overtime_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  employeeName: text('employee_name').notNull(),
  overtimeDate: timestamp('overtime_date').notNull(),
  startTime: text('start_time').notNull(), // Formato HH:MM
  endTime: text('end_time').notNull(), // Formato HH:MM
  justification: text('justification').notNull(),
  status: text('status').notNull().default('pending'), // pending, approved, rejected
  approvedBy: text('approved_by'),
  approvedAt: timestamp('approved_at'),
  rejectionReason: text('rejection_reason'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Expense Reports (Prestação de Contas - Cartão Corporativo)
export const expenseReports = pgTable('expense_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  employeeName: text('employee_name').notNull(),
  expenseDate: timestamp('expense_date').notNull(),
  category: text('category').notNull(), // Uber, Alimentação, Outro
  categoryOther: text('category_other'), // Descrição quando categoria = Outro
  eventName: text('event_name').notNull(),
  transportType: text('transport_type'), // Casa para trabalho, Trabalho para casa, Outro
  transportOther: text('transport_other'), // Descrição quando transporte = Outro
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  status: text('status').notNull().default('pending'), // pending, approved, rejected
  approvedBy: text('approved_by'),
  approvedAt: timestamp('approved_at'),
  rejectionReason: text('rejection_reason'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});