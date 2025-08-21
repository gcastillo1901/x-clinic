// src/services/patientService.ts
import { supabase } from './supabase';
import { Patient } from '../types';

export const getPatients = async (clinicId: string) => {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('full_name');

  if (error) throw error;
  return data;
};

export const searchPatients = async (clinicId: string, query: string) => {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('clinic_id', clinicId)
    .or(`full_name.ilike.%${query}%,phone.ilike.%${query}%`)
    .order('full_name');

  if (error) throw error;
  return data;
};

export const createPatient = async (patientData: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase.from('patients').insert(patientData).select().single();

  if (error) throw error;
  return data;
};

export const updatePatient = async (id: string, patientData: Partial<Patient>) => {
  const { data, error } = await supabase
    .from('patients')
    .update({ ...patientData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const uploadPatientPhoto = async (patientId: string, uri: string) => {
  const fileExt = uri.split('.').pop();
  const fileName = `${patientId}.${fileExt}`;
  const filePath = `patient_photos/${fileName}`;

  const response = await fetch(uri);
const blob = await response.blob();

const { data: uploadData, error: uploadError } = await supabase.storage
  .from('patient-photos')
  .upload(filePath, blob);


  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage.from('patient-photos').getPublicUrl(filePath);

  return urlData.publicUrl;
};