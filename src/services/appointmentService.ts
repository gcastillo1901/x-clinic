// src/services/appointmentService.ts
import { supabase } from './supabase';
import { Appointment } from '../types';

export const getAppointments = async (clinicId: string, date: Date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from('appointments')
    .select('*, patient:patients(full_name, phone)')
    .eq('clinic_id', clinicId)
    .gte('date', startOfDay.toISOString())
    .lte('date', endOfDay.toISOString())
    .order('date');

  if (error) throw error;
  return data;
};

export const createAppointment = async (appointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('appointments')
    .insert(appointmentData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateAppointmentStatus = async (id: string, status: 'scheduled' | 'completed' | 'canceled') => {
  const { data, error } = await supabase
    .from('appointments')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};