export interface Category {
  id: string;
  name: string;
  color: string;
  optional_field: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type CreateCategoryInput = Pick<Category, 'name' | 'color'> &
  Partial<Pick<Category, 'optional_field'>>;

export type UpdateCategoryInput = Partial<CreateCategoryInput>;
