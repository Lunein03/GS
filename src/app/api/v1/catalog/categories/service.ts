import * as repo from './repository';
import { notFound, conflict } from '../../_lib/errors';
import type { CreateCategoryInput, UpdateCategoryInput, Category } from './types';

export async function listCategories(): Promise<Category[]> {
  return repo.findAll();
}

export async function createCategory(input: CreateCategoryInput): Promise<Category> {
  const existing = await repo.findByName(input.name);
  if (existing) throw conflict(`Categoria "${input.name}" já existe`);
  return repo.insert(input);
}

export async function updateCategory(
  id: string,
  input: UpdateCategoryInput
): Promise<Category> {
  const existing = await repo.findById(id);
  if (!existing) throw notFound('Categoria');

  if (input.name && input.name.toLowerCase() !== existing.name.toLowerCase()) {
    const duplicate = await repo.findByName(input.name);
    if (duplicate) throw conflict(`Categoria "${input.name}" já existe`);
  }

  return repo.updateById(id, input);
}

export async function deleteCategory(id: string): Promise<void> {
  const existing = await repo.findById(id);
  if (!existing) throw notFound('Categoria');
  return repo.softDelete(id);
}
