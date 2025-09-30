// src/components/DentalRecordsSection.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../services/supabase';
import { DentalRecord } from '../types';
import { ActivityIndicator } from 'react-native-paper';

interface DentalRecordsSectionProps {
  patientId: string;
  onAddRecord: () => void;
}

const DentalRecordsSection: React.FC<DentalRecordsSectionProps> = ({ 
  patientId, 
  onAddRecord 
}) => {
  const [records, setRecords] = useState<DentalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecords();
  }, [patientId]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('dental_records')
        .select('*')
        .eq('patient_id', patientId)
        .order('treatment_date', { ascending: false });

      if (error) throw error;

      setRecords(data || []);
    } catch (error) {
      console.error('Error fetching dental records:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    // Parsear fecha manualmente para evitar problemas de zona horaria
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  type ConditionType =
  | 'caries'
  | 'restoration'
  | 'extraction'
  | 'root_canal'
  | 'crown'
  | 'healthy'
  | 'impacted'
  | 'missing';

const conditionLabel = (condition: string) => {
  const labels: Record<ConditionType, string> = {
    caries: 'Caries',
    restoration: 'Restauración',
    extraction: 'Extracción',
    root_canal: 'Endodoncia',
    crown: 'Corona',
    healthy: 'Sano',
    impacted: 'Impactado',
    missing: 'Faltante',
  };
  return labels[condition as ConditionType] || condition;
};

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Historial Dental</Text>
        <TouchableOpacity onPress={onAddRecord}>
          <MaterialIcons name="add" size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      {loading && records.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" />
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.recordItem}>
              <View style={styles.recordHeader}>
                <Text style={styles.toothNumber}>Diente {item.tooth_number}</Text>
                <Text style={styles.recordDate}>{formatDate(item.treatment_date)}</Text>
              </View>
              <Text style={styles.conditionText}>
                {conditionLabel(item.condition)}
              </Text>
              {item.notes && (
                <Text style={styles.notesText}>{item.notes}</Text>
              )}
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay registros dentales</Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  recordItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  toothNumber: {
    fontWeight: 'bold',
    color: '#1e293b',
  },
  recordDate: {
    color: '#64748b',
    fontSize: 12,
  },
  conditionText: {
    color: '#3b82f6',
    marginBottom: 5,
  },
  notesText: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 20,
  },
  emptyText: {
    color: '#94a3b8',
    textAlign: 'center',
    padding: 20,
  },
});

export default DentalRecordsSection;