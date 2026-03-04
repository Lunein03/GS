import * as repo from './repository';
import { notFound } from '../../_lib/errors';
import type { CreateItemInput, UpdateItemInput, CatalogItem } from './types';

export async function listItems(): Promise<CatalogItem[]> {
  return repo.findAll();
}

export async function createItem(input: CreateItemInput): Promise<CatalogItem> {
  return repo.insert(input);
}

export async function updateItem(
  id: string,
  input: UpdateItemInput
): Promise<CatalogItem> {
  const existing = await repo.findById(id);
  if (!existing) throw notFound('Item');
  return repo.updateById(id, input);
}

export async function deleteItem(id: string): Promise<void> {
  const existing = await repo.findById(id);
  if (!existing) throw notFound('Item');
  return repo.softDelete(id);
}
