export interface Equipment {
  id: string;
  code: string;
  name: string;
  category: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  acquisitionDate: string;
  status: 'available' | 'in-use' | 'maintenance' | 'retired';
  location?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  equipmentIds: string[];
  createdAt: string;
  notes?: string;
}

export type EquipmentFormData = Omit<Equipment, 'id' | 'code' | 'createdAt' | 'updatedAt'>;
