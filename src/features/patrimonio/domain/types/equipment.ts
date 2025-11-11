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
  startDate: string;
  endDate: string;
  location: string;
  equipmentIds: string[];
  createdAt: string;
  notes?: string;
  status: 'pending' | 'completed';
}

export type EquipmentFormData = Omit<Equipment, 'id' | 'code' | 'createdAt' | 'updatedAt'>;
