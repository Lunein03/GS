'use client';

import { useContext } from 'react';

import { DriveQrContext } from '../context/drive-qr-provider';

export function useDriveQrContext() {
  const context = useContext(DriveQrContext);

  if (!context) {
    throw new Error('useDriveQrContext deve ser utilizado dentro de DriveQrProvider.');
  }

  return context;
}
