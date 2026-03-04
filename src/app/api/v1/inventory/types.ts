export type EquipmentStatus = 'available' | 'in-use' | 'maintenance' | 'retired';
export type EventStatus = 'pending' | 'completed';

export interface Equipment {
  id: string;
  code: string;
  name: string;
  category: string;
  brand: string | null;
  model: string | null;
  serial_number: string | null;
  acquisition_date: string;
  status: EquipmentStatus;
  location: string | null;
  notes: string | null;
  quantity: number;
  unit_value_cents: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface InventoryEvent {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  location: string;
  notes: string | null;
  status: EventStatus;
  created_at: string;
  deleted_at: string | null;
}

export interface EventEquipment {
  event_id: string;
  equipment_id: string;
  quantity: number;
  created_at: string;
}

export type CreateEquipmentInput = Omit<Equipment, 'id' | 'status' | 'created_at' | 'updated_at' | 'deleted_at'>;
export type UpdateEquipmentInput = Partial<Omit<Equipment, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>;

export type CreateEventInput = Omit<InventoryEvent, 'id' | 'status' | 'created_at' | 'deleted_at'>;
export type UpdateEventInput = Partial<CreateEventInput & { status: EventStatus }>;
