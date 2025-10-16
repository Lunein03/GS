'use server';

import { createSafeActionClient } from 'next-safe-action';

export const actionClient = createSafeActionClient({
  handleServerErrorLog(error: Error) {
    console.error('Erro em server action', error);
  },
});
