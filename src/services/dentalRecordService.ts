// src/services/dentalRecordService.ts
import { supabase } from './supabase';
import { DentalRecord } from '../types';

export const getDentalRecords = async (patientId: string) => {
  const { data, error } = await supabase
    .from('dental_records')
    .select('*')
    .eq('patient_id', patientId)
    .order('treatment_date', { ascending: false });

  if (error) throw error;
  return data;
};

export const getToothConditions = async (patientId: string, toothNumber: number) => {
  const { data, error } = await supabase
    .from('dental_records')
    .select('*')
    .eq('patient_id', patientId)
    .eq('tooth_number', toothNumber)
    .order('treatment_date', { ascending: false });

  if (error) throw error;
  return data;
};

export const addDentalRecord = async (recordData: Omit<DentalRecord, 'id' | 'created_at'>) => {
  const { data, error } = await supabase.from('dental_records').insert(recordData).select().single();

  if (error) throw error;
  return data;
};