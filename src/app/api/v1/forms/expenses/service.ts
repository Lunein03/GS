import * as repo from './repository';
import { notFound } from '../../_lib/errors';
import type { CreateExpenseInput, UpdateExpenseInput, ExpenseReport } from './types';

export async function listExpenseReports(): Promise<ExpenseReport[]> {
  return repo.findAll();
}

export async function createExpenseReport(
  input: CreateExpenseInput
): Promise<ExpenseReport> {
  return repo.insert(input);
}

export async function updateExpenseReport(
  id: string,
  input: UpdateExpenseInput
): Promise<ExpenseReport> {
  const existing = await repo.findById(id);
  if (!existing) throw notFound('Relatório de despesa');
  return repo.updateById(id, input);
}

export async function deleteExpenseReport(id: string): Promise<void> {
  const existing = await repo.findById(id);
  if (!existing) throw notFound('Relatório de despesa');
  return repo.deleteById(id);
}
