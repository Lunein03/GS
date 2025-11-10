// Query keys para React Query - pode ser usado no cliente
export const opportunityQueryKeys = {
  all: ['opportunities'] as const,
  lists: () => [...opportunityQueryKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...opportunityQueryKeys.lists(), filters] as const,
  details: () => [...opportunityQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...opportunityQueryKeys.details(), id] as const,
};
