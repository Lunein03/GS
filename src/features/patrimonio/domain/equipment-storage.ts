/**
 * @deprecated Este módulo de storage local está deprecated.
 * Os dados agora são gerenciados pela API FastAPI.
 * Use os clientes API em @/features/patrimonio/api/ em vez disso.
 * 
 * Este arquivo será removido após a migração completa dos componentes.
 */

import type { Equipment, Event } from '@/features/patrimonio/domain/types/equipment';

const EQUIPMENT_KEY = 'gs-patrimonio-equipment';
const EVENTS_KEY = 'gs-patrimonio-events';

export function generateEquipmentCode(count: number): string {
  const year = new Date().getFullYear().toString().slice(-2);
  const paddedCount = (count + 1).toString().padStart(5, '0');
  return `PAT${year}${paddedCount}`;
}

export function loadEquipment(): Equipment[] {
  return readItem<Equipment[]>(EQUIPMENT_KEY, []);
}

export function saveEquipment(equipment: Equipment[]): void {
  writeItem(EQUIPMENT_KEY, equipment);
}

export function loadEvents(): Event[] {
  return readItem<Event[]>(EVENTS_KEY, []);
}

export function saveEvents(events: Event[]): void {
  writeItem(EVENTS_KEY, events);
}

function readItem<T>(key: string, fallback: T): T {
  const storage = getStorage();
  if (!storage) {
    return fallback;
  }

  try {
    const raw = storage.getItem(key);
    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`Failed to read "${key}" from localStorage`, error);
    return fallback;
  }
}

function writeItem<T>(key: string, value: T): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  try {
    storage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to persist "${key}" in localStorage`, error);
  }
}

function getStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage;
  } catch (error) {
    console.warn('localStorage is unavailable, persistence disabled.', error);
    return null;
  }
}

