import { z } from 'zod';

// ============================================
// ENUMS E TIPOS
// ============================================

export type ItemType = 'product' | 'service';
export type ItemUnit = 'unidade' | 'hora' | 'minuto' | 'peca' | 'metro' | 'kg';

// ============================================
// INTERFACES
// ============================================

export interface Category {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Item {
  id: string;
  type: ItemType;
  categoryId: string;
  name: string;
  unit: ItemUnit;
  defaultPrice: number;
  sku?: string;
  pn?: string;
  description?: string;
  features?: string;
  images: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  category?: Category;
}

export interface ItemFormData {
  type: ItemType;
  categoryId: string;
  name: string;
  unit: ItemUnit;
  defaultPrice: number;
  sku?: string;
  pn?: string;
  description?: string;
  features?: string;
  images: string[];
}

export interface CategoryFormData {
  name: string;
  color: string;
}

// ============================================
// SCHEMAS DE VALIDAÇÃO ZOD
// ============================================

export const itemFormSchema = z.object({
  type: z.enum(['product', 'service'], {
    required_error: 'Tipo é obrigatório',
  }),
  categoryId: z.string({
    required_error: 'Categoria é obrigatória',
  }).min(1, 'Categoria é obrigatória'),
  name: z.string({
    required_error: 'Nome é obrigatório',
  })
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  unit: z.enum(['unidade', 'hora', 'minuto', 'peca', 'metro', 'kg'], {
    required_error: 'Unidade é obrigatória',
  }),
  defaultPrice: z.number({
    required_error: 'Valor é obrigatório',
  })
    .positive('Valor deve ser maior que zero')
    .max(999999.99, 'Valor muito alto'),
  sku: z.string().max(50, 'SKU deve ter no máximo 50 caracteres').optional(),
  pn: z.string().max(50, 'PN deve ter no máximo 50 caracteres').optional(),
  description: z.string().max(2000, 'Descrição deve ter no máximo 2000 caracteres').optional(),
  features: z.string().max(2000, 'Funcionalidades devem ter no máximo 2000 caracteres').optional(),
  images: z.array(z.string().min(1, 'URL de imagem inválida')).max(5, 'Máximo de 5 imagens'),
});

export const categoryFormSchema = z.object({
  name: z.string({
    required_error: 'Nome é obrigatório',
  })
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres'),
  color: z.string({
    required_error: 'Cor é obrigatória',
  })
    .regex(/^#[0-9A-F]{6}$/i, 'Cor inválida (use formato hex: #RRGGBB)'),
});

// ============================================
// TIPOS DE ERRO
// ============================================

export const itemErrors = {
  ITEM_NOT_FOUND: {
    code: 'ITEM_NOT_FOUND',
    message: 'Item não encontrado',
  },
  ITEM_IN_USE: {
    code: 'ITEM_IN_USE',
    message: 'Item está sendo utilizado em propostas ativas',
  },
  CATEGORY_NOT_FOUND: {
    code: 'CATEGORY_NOT_FOUND',
    message: 'Categoria não encontrada',
  },
  CATEGORY_IN_USE: {
    code: 'CATEGORY_IN_USE',
    message: 'Categoria está sendo utilizada por itens',
  },
  DUPLICATE_SKU: {
    code: 'DUPLICATE_SKU',
    message: 'SKU já cadastrado para outro item',
  },
  DUPLICATE_CATEGORY_NAME: {
    code: 'DUPLICATE_CATEGORY_NAME',
    message: 'Já existe uma categoria com este nome',
  },
  INVALID_IMAGE: {
    code: 'INVALID_IMAGE',
    message: 'Formato de imagem inválido. Use JPG, PNG ou WebP',
  },
  IMAGE_TOO_LARGE: {
    code: 'IMAGE_TOO_LARGE',
    message: 'Imagem excede o tamanho máximo de 5MB',
  },
  MAX_IMAGES_EXCEEDED: {
    code: 'MAX_IMAGES_EXCEEDED',
    message: 'Máximo de 5 imagens por item',
  },
} as const;

// ============================================
// CONSTANTES
// ============================================

export const ITEM_TYPES = [
  { value: 'product', label: 'Produto' },
  { value: 'service', label: 'Serviço' },
] as const;

export const ITEM_UNITS = [
  { value: 'unidade', label: 'Unidade' },
  { value: 'hora', label: 'Hora' },
  { value: 'minuto', label: 'Minuto' },
  { value: 'peca', label: 'Peça' },
  { value: 'metro', label: 'Metro' },
  { value: 'kg', label: 'Quilograma' },
] as const;

export const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { name: 'Acessibilidade em Festivais', color: '#3B82F6' },
  { name: 'Interpretação', color: '#10B981' },
  { name: 'Tradução', color: '#F59E0B' },
  { name: 'Voz', color: '#8B5CF6' },
  { name: 'Sem Categoria', color: '#6B7280' },
];
