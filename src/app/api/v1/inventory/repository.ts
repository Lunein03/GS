import { createSupabaseAdmin } from '../_lib/supabase-server';
import type { Equipment, InventoryEvent, EventEquipment, EquipmentStatus } from './types';
import type { z } from 'zod';
import type {
  createEquipmentSchema, updateEquipmentSchema,
  createEventSchema, updateEventSchema,
} from './schemas';

type CreateEquipmentInput = z.infer<typeof createEquipmentSchema>;
type UpdateEquipmentInput = z.infer<typeof updateEquipmentSchema>;
type CreateEventInput = z.infer<typeof createEventSchema>;
type UpdateEventInput = z.infer<typeof updateEventSchema>;

// --- Equipment ---

export async function findAllEquipment(): Promise<Equipment[]> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from('equipment').select('*').is('deleted_at', null)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Equipment[];
}

export async function findEquipmentById(id: string): Promise<Equipment | null> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from('equipment').select('*').eq('id', id).is('deleted_at', null).maybeSingle();
  if (error) throw error;
  return data as Equipment | null;
}

export async function insertEquipment(input: CreateEquipmentInput): Promise<Equipment> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase.from('equipment').insert(input).select().single();
  if (error) throw error;
  return data as Equipment;
}

export async function updateEquipmentById(id: string, input: UpdateEquipmentInput): Promise<Equipment> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase.from('equipment').update(input).eq('id', id).select().single();
  if (error) throw error;
  return data as Equipment;
}

export async function softDeleteEquipment(id: string): Promise<void> {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from('equipment')
    .update({ deleted_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

export async function updateEquipmentStatus(id: string, status: EquipmentStatus): Promise<void> {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from('equipment').update({ status }).eq('id', id);
  if (error) throw error;
}

// --- Events ---

export async function findAllEvents(): Promise<InventoryEvent[]> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from('events').select('*').is('deleted_at', null)
    .order('start_date', { ascending: false });
  if (error) throw error;
  return data as InventoryEvent[];
}

export async function findEventById(id: string): Promise<InventoryEvent | null> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from('events').select('*').eq('id', id).is('deleted_at', null).maybeSingle();
  if (error) throw error;
  return data as InventoryEvent | null;
}

export async function insertEvent(input: Omit<CreateEventInput, 'equipment'>): Promise<InventoryEvent> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase.from('events').insert(input).select().single();
  if (error) throw error;
  return data as InventoryEvent;
}

export async function updateEventById(id: string, input: UpdateEventInput): Promise<InventoryEvent> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase.from('events').update(input).eq('id', id).select().single();
  if (error) throw error;
  return data as InventoryEvent;
}

export async function softDeleteEvent(id: string): Promise<void> {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from('events')
    .update({ deleted_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

// --- Event Equipment ---

export async function findEventEquipment(eventId: string): Promise<(EventEquipment & { equipment: Equipment })[]> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from('event_equipment')
    .select('*, equipment(*)')
    .eq('event_id', eventId);
  if (error) throw error;
  return data as (EventEquipment & { equipment: Equipment })[];
}

export async function addEquipmentToEvent(eventId: string, equipmentId: string, quantity: number): Promise<EventEquipment> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from('event_equipment')
    .upsert({ event_id: eventId, equipment_id: equipmentId, quantity })
    .select()
    .single();
  if (error) throw error;
  return data as EventEquipment;
}

export async function removeEquipmentFromEvent(eventId: string, equipmentId: string): Promise<void> {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase
    .from('event_equipment')
    .delete()
    .eq('event_id', eventId)
    .eq('equipment_id', equipmentId);
  if (error) throw error;
}

export async function findActiveEventsForEquipment(equipmentId: string, excludeEventId?: string): Promise<EventEquipment[]> {
  const supabase = createSupabaseAdmin();
  let query = supabase
    .from('event_equipment')
    .select('*, events!inner(status, deleted_at)')
    .eq('equipment_id', equipmentId)
    .eq('events.status', 'pending')
    .is('events.deleted_at', null);

  if (excludeEventId) {
    query = query.neq('event_id', excludeEventId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as EventEquipment[];
}

export async function findAllInUseEquipmentIds(): Promise<string[]> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from('equipment')
    .select('id')
    .eq('status', 'in-use')
    .is('deleted_at', null);
  if (error) throw error;
  return (data as { id: string }[]).map(d => d.id);
}
