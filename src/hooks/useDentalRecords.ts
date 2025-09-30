// src/hooks/useDentalRecords.ts
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { DentalRecord, ToothCondition } from '../types';
import { useDataRefresh } from '../contexts/DataContext';

export const useDentalRecords = (patientId: string | null) => {
  const { refreshTrigger } = useDataRefresh();
  const [records, setRecords] = useState<DentalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Obtener registros dentales del paciente
  const fetchDentalRecords = async () => {
    if (!patientId) return;
    
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('dental_records')
        .select('*')
        .eq('patient_id', patientId)
        .order('treatment_date', { ascending: false });

      if (supabaseError) {
        throw supabaseError;
      }

      setRecords(data || []);
    } catch (err) {
      console.error('Error fetching dental records:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dental records');
    } finally {
      setLoading(false);
    }
  };

  // Cargar registros al montar el componente o cambiar patientId
  useEffect(() => {
    fetchDentalRecords();
  }, [patientId, refreshTrigger]);

  // Agregar un nuevo registro dental
  const addDentalRecord = async (record: Omit<DentalRecord, 'id' | 'created_at' | 'clinic_id'>) => {
    if (!patientId) return;

    try {
      setLoading(true);
      
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        throw new Error('User not authenticated');
      }

      const newRecord = {
        ...record,
        patient_id: patientId,
        clinic_id: session.session.user.id,
      };

      const { data, error: insertError } = await supabase
        .from('dental_records')
        .insert(newRecord)
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      setRecords(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error adding dental record:', err);
      setError(err instanceof Error ? err.message : 'Failed to add dental record');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Obtener condiciones específicas de un diente
  const getToothConditions = (toothNumber: number): ToothCondition[] => {
    return records
      .filter(record => record.tooth_number === toothNumber)
      .map(record => ({
        condition: record.condition,
        treatment_date: record.treatment_date,
        notes: record.notes,
        images: record.images,
      }));
  };

  // Actualizar un registro dental
  const updateDentalRecord = async (recordId: string, updates: Partial<DentalRecord>) => {
    try {
      setLoading(true);
      
      const { data, error: updateError } = await supabase
        .from('dental_records')
        .update(updates)
        .eq('id', recordId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      setRecords(prev => 
        prev.map(record => record.id === recordId ? data : record)
      );
      return data;
    } catch (err) {
      console.error('Error updating dental record:', err);
      setError(err instanceof Error ? err.message : 'Failed to update dental record');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar un registro dental
  const deleteDentalRecord = async (recordId: string) => {
    try {
      setLoading(true);
      
      const { error: deleteError } = await supabase
        .from('dental_records')
        .delete()
        .eq('id', recordId);

      if (deleteError) {
        throw deleteError;
      }

      setRecords(prev => prev.filter(record => record.id !== recordId));
    } catch (err) {
      console.error('Error deleting dental record:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete dental record');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    records,
    loading,
    error,
    refetch: fetchDentalRecords,
    addDentalRecord,
    updateDentalRecord,
    deleteDentalRecord,
    getToothConditions,
  };
};