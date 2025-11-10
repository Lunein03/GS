/**
 * @deprecated Este Context Provider está deprecated e será removido em breve.
 * Use os hooks React Query em vez disso:
 * - useEquipmentList() em vez de equipment
 * - useEventsList() em vez de events
 * - useCreateEquipment() em vez de addEquipment
 * - useUpdateEquipment() em vez de updateEquipment
 * - useDeleteEquipment() em vez de deleteEquipment
 * - useCreateEvent() em vez de addEvent
 * - useDeleteEvent() em vez de deleteEvent
 * 
 * Exemplo de migração:
 * ```tsx
 * // Antes:
 * const { equipment, addEquipment } = useEquipment();
 * 
 * // Depois:
 * import { useEquipmentList, useCreateEquipment } from '@/features/patrimonio/hooks/use-equipment';
 * const { data: equipment = [] } = useEquipmentList();
 * const createMutation = useCreateEquipment();
 * ```
 */
'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { generateId } from '@/shared/lib/utils';
import {
  generateEquipmentCode,
  loadEquipment,
  loadEvents,
  saveEquipment,
  saveEvents,
} from '@/features/patrimonio/domain/equipment-storage';
import type {
  Equipment,
  EquipmentFormData,
  Event,
} from '@/features/patrimonio/domain/types/equipment';

const EquipmentContext = createContext<EquipmentContextValue | null>(null);

export function EquipmentProvider({ children }: EquipmentProviderProps) {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const storedEquipment = loadEquipment();
    const storedEvents = loadEvents();

    setEquipment(storedEquipment);
    setEvents(storedEvents);
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    saveEquipment(equipment);
  }, [equipment, isHydrated]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    saveEvents(events);
  }, [events, isHydrated]);

  const addEquipment = useCallback((data: EquipmentFormData): Equipment => {
    const now = new Date().toISOString();
    let created: Equipment | undefined;

    setEquipment((prev) => {
      const newEquipment: Equipment = {
        id: createId(),
        code: generateEquipmentCode(prev.length),
        ...data,
        createdAt: now,
        updatedAt: now,
      };

      created = newEquipment;
      return [...prev, newEquipment];
    });

    return created!;
  }, []);

  const updateEquipment = useCallback((id: string, partial: Partial<Equipment>) => {
    setEquipment((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, ...partial, updatedAt: new Date().toISOString() }
          : item
      )
    );
  }, []);

  const deleteEquipment = useCallback((id: string) => {
    setEquipment((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const addEvent = useCallback((data: Omit<Event, 'id' | 'createdAt'>): Event => {
    let created: Event | undefined;

    setEvents((prev) => {
      const event: Event = {
        ...data,
        id: createId(),
        createdAt: new Date().toISOString(),
      };

      created = event;
      return [...prev, event];
    });

    return created!;
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((event) => event.id !== id));
  }, []);

  const getEquipmentById = useCallback(
    (id: string) => equipment.find((item) => item.id === id),
    [equipment]
  );

  const value = useMemo<EquipmentContextValue>(
    () => ({
      equipment,
      events,
      isHydrated,
      addEquipment,
      updateEquipment,
      deleteEquipment,
      addEvent,
      deleteEvent,
      getEquipmentById,
    }),
    [
      equipment,
      events,
      isHydrated,
      addEquipment,
      updateEquipment,
      deleteEquipment,
      addEvent,
      deleteEvent,
      getEquipmentById,
    ]
  );

  return <EquipmentContext.Provider value={value}>{children}</EquipmentContext.Provider>;
}

export function useEquipment() {
  const context = useContext(EquipmentContext);

  if (!context) {
    throw new Error('useEquipment must be used within EquipmentProvider');
  }

  return context;
}

interface EquipmentProviderProps {
  children: ReactNode;
}

interface EquipmentContextValue {
  equipment: Equipment[];
  events: Event[];
  isHydrated: boolean;
  addEquipment: (data: EquipmentFormData) => Equipment;
  updateEquipment: (id: string, data: Partial<Equipment>) => void;
  deleteEquipment: (id: string) => void;
  addEvent: (data: Omit<Event, 'id' | 'createdAt'>) => Event;
  deleteEvent: (id: string) => void;
  getEquipmentById: (id: string) => Equipment | undefined;
}

function createId(): string {
  return generateId();
}


