export interface CatalogItem {
  id: string;
  type: string;
  name: string;
  description: string | null;
  default_price: number;
  unit: string;
  sku: string | null;
  pn: string | null;
  features: string | null;
  images: string[];
  category_id: string | null;
  active: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type CreateItemInput = Pick<
  CatalogItem,
  'type' | 'name' | 'default_price' | 'unit'
> &
  Partial<
    Pick<CatalogItem, 'description' | 'sku' | 'pn' | 'features' | 'images' | 'category_id'>
  >;

export type UpdateItemInput = Partial<CreateItemInput & { active: number }>;
