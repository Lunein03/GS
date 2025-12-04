import { fetchApi, HttpError } from '@/shared/lib/api-client';
import type { Opportunity, OpportunityStatus } from '@/features/gs-propostas/domain/types';

type ApiOpportunity = {
  id: string;
  title: string;
  description?: string | null;
  value: string | number | null;
  status: OpportunityStatus;
  probability?: number | null;
  next_step?: string | null;
  client_name?: string | null;
  client_email?: string | null;
  responsible_user?: string | null;
  tags?: string[] | null;
  created_at: string;
  updated_at: string;
};

type CreateOpportunityPayload = {
  title: string;
  description?: string | null;
  value: string;
  probability?: number | null;
  nextStep?: string | null;
  clientName?: string | null;
  clientEmail?: string | null;
  responsibleUser?: string | null;
  tags?: string[];
};

type UpdateOpportunityStatusPayload = {
  id: string;
  status: OpportunityStatus;
  userId?: string;
};

const mapOpportunity = (input: ApiOpportunity): Opportunity => ({
  id: input.id,
  title: input.title,
  description: input.description ?? null,
  value: typeof input.value === 'number' ? input.value.toString() : input.value ?? '0',
  status: input.status,
  probability: input.probability ?? null,
  nextStep: input.next_step ?? null,
  clientName: input.client_name ?? null,
  clientEmail: input.client_email ?? null,
  responsibleUser: input.responsible_user ?? null,
  tags: input.tags ?? [],
  createdAt: new Date(input.created_at),
  updatedAt: new Date(input.updated_at),
});

export async function listOpportunities(): Promise<Opportunity[]> {
  try {
    const response = await fetchApi<ApiOpportunity[]>('/crm/opportunities');
    return response.map(mapOpportunity);
  } catch (error) {
    if (error instanceof HttpError) {
      throw new Error(error.message);
    }
    throw error;
  }
}

export async function createOpportunity(payload: CreateOpportunityPayload): Promise<Opportunity> {
  try {
    const response = await fetchApi<ApiOpportunity>('/crm/opportunities', {
      method: 'POST',
      body: JSON.stringify({
        title: payload.title,
        description: payload.description ?? undefined,
        value: payload.value,
        probability: payload.probability ?? undefined,
        next_step: payload.nextStep ?? undefined,
        client_name: payload.clientName ?? undefined,
        client_email: payload.clientEmail ?? undefined,
        responsible_user: payload.responsibleUser ?? undefined,
        tags: payload.tags?.length ? payload.tags : undefined,
      }),
    });

    return mapOpportunity(response);
  } catch (error) {
    if (error instanceof HttpError) {
      throw new Error(error.message);
    }
    throw error;
  }
}

export async function updateOpportunityStatus(
  payload: UpdateOpportunityStatusPayload
): Promise<Opportunity> {
  try {
    const response = await fetchApi<ApiOpportunity>(
      `/crm/opportunities/${payload.id}/status`,
      {
        method: 'POST',
        body: JSON.stringify({
          new_status: payload.status,
          user_id: payload.userId ?? 'system',
        }),
      }
    );

    return mapOpportunity(response);
  } catch (error) {
    if (error instanceof HttpError) {
      throw new Error(error.message);
    }
    throw error;
  }
}

export async function listOpportunityStatuses(): Promise<{ id: OpportunityStatus; title: string; color: string }[]> {
  try {
    return await fetchApi<{ id: OpportunityStatus; title: string; color: string }[]>('/crm/opportunities/statuses');
  } catch (error) {
    if (error instanceof HttpError) {
      throw new Error(error.message);
    }
    throw error;
  }
}

export async function updateOpportunity(
  id: string,
  payload: Partial<CreateOpportunityPayload>
): Promise<Opportunity> {
  try {
    const response = await fetchApi<ApiOpportunity>(`/crm/opportunities/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        title: payload.title,
        description: payload.description,
        value: payload.value,
        probability: payload.probability,
        next_step: payload.nextStep,
        client_name: payload.clientName,
        client_email: payload.clientEmail,
        responsible_user: payload.responsibleUser,
        tags: payload.tags,
      }),
    });

    return mapOpportunity(response);
  } catch (error) {
    if (error instanceof HttpError) {
      throw new Error(error.message);
    }
    throw error;
  }
}

export async function deleteOpportunity(id: string): Promise<void> {
  try {
    await fetchApi(`/crm/opportunities/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    if (error instanceof HttpError) {
      throw new Error(error.message);
    }
    throw error;
  }
}
