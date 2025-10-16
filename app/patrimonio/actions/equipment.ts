'use server';

import { actionClient } from '@/app/actions/safe-action';
import { generateEquipmentCode } from '@/app/patrimonio/lib/equipment-code';
import { mapEquipmentEntity } from '@/app/patrimonio/lib/mappers';
import { ensureSerialNumberIsUnique } from '@/app/patrimonio/lib/services/equipment-service';
import {
  createEquipmentSchema,
  deleteEquipmentSchema,
  equipmentFiltersSchema,
  updateEquipmentSchema,
  type CreateEquipmentInput,
  type DeleteEquipmentInput,
  type EquipmentFiltersInput,
  type UpdateEquipmentInput,
} from '@/app/patrimonio/lib/validators';
import {
  createEquipment,
  findEquipmentById,
  hardDeleteEquipment,
  listEquipment,
  softDeleteEquipment,
  updateEquipmentById,
} from '@/app/patrimonio/lib/repositories/equipment-repository';
import type { Equipment as EquipmentView } from '@/app/patrimonio/types/equipment';
import type { ActionResponse } from '@/types/actions';
import { appErrors } from '@/types/actions';

const handleUnexpectedError = <T>(error: unknown): ActionResponse<T> => {
  console.error('Erro inesperado em ação de equipamento', error);
  return { success: false, error: appErrors.UNEXPECTED_ERROR };
};

export const listEquipmentAction = actionClient(
  equipmentFiltersSchema.optional(),
  async (input: EquipmentFiltersInput | undefined): Promise<ActionResponse<EquipmentView[]>> => {
    try {
      const filters: EquipmentFiltersInput = input ?? {};
      const records = await listEquipment(filters);
      return {
        success: true,
        data: records.map(mapEquipmentEntity),
      };
    } catch (error) {
      return handleUnexpectedError<EquipmentView[]>(error);
    }
  }
);

export const createEquipmentAction = actionClient(
  createEquipmentSchema,
  async (input: CreateEquipmentInput): Promise<ActionResponse<EquipmentView>> => {
    try {
      if (input.serialNumber) {
        const serialError = await ensureSerialNumberIsUnique(input.serialNumber);
        if (serialError) {
          return { success: false, error: serialError };
        }
      }

      const code = await generateEquipmentCode();
      const equipmentCreated = await createEquipment({
        ...input,
        acquisitionDate: input.acquisitionDate,
        code,
      });

      return {
        success: true,
        data: mapEquipmentEntity(equipmentCreated),
      };
    } catch (error) {
      return handleUnexpectedError<EquipmentView>(error);
    }
  }
);

export const updateEquipmentAction = actionClient(
  updateEquipmentSchema,
  async (input: UpdateEquipmentInput): Promise<ActionResponse<EquipmentView>> => {
    try {
      const { id, data } = input;
      if (data.serialNumber) {
        const serialError = await ensureSerialNumberIsUnique(data.serialNumber, id);
        if (serialError) {
          return { success: false, error: serialError };
        }
      }

      const updated = await updateEquipmentById(id, {
        ...data,
        acquisitionDate: data.acquisitionDate,
      });

      if (!updated) {
        return { success: false, error: appErrors.NOT_FOUND };
      }

      return {
        success: true,
        data: mapEquipmentEntity(updated),
      };
    } catch (error) {
      return handleUnexpectedError<EquipmentView>(error);
    }
  }
);

export const deleteEquipmentAction = actionClient(
  deleteEquipmentSchema,
  async (input: DeleteEquipmentInput): Promise<ActionResponse<{ id: string }>> => {
    try {
      const { id, softDelete } = input;
      const existing = await findEquipmentById(id);
      if (!existing) {
        return { success: false, error: appErrors.NOT_FOUND };
      }

      if (softDelete) {
        await softDeleteEquipment(id);
        return { success: true, data: { id } };
      }

      await hardDeleteEquipment(id);
      return { success: true, data: { id } };
    } catch (error) {
      return handleUnexpectedError<{ id: string }>(error);
    }
  }
);
