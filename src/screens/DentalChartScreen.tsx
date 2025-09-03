// src/screens/DentalChartScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { DentalChart } from '../components/DentalChart';
import { useDentalRecords } from '../hooks/useDentalRecords';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { Picker } from '@react-native-picker/picker';
import SimplePatientPicker from '../components/SimplePatientPicker';

const DentalChartScreen = ({ route, navigation }: { route: any; navigation: any }) => {
  const { patientId: initialPatientId } = route.params || {};
  const { session } = useAuth();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(initialPatientId || null);
  const [patients, setPatients] = useState<any[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  
  const { records, getToothConditions, addDentalRecord, loading: loadingRecords } = useDentalRecords(selectedPatientId);

  useEffect(() => {
    if (!initialPatientId && session) {
      fetchPatients();
    }
  }, [initialPatientId, session]);

  const fetchPatients = async () => {
    try {
      setLoadingPatients(true);
      const { data, error } = await supabase
        .from('patients')
        .select('id, full_name')
        .eq('clinic_id', session?.user.id)
        .order('full_name', { ascending: true });

      if (error) throw error;
      setPatients(data || []);
      
      // Solo seleccionar el primer paciente por defecto si no hay initialPatientId
      if (data && data.length > 0 && !initialPatientId && !selectedPatientId) {
        setSelectedPatientId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoadingPatients(false);
    }
  };

  const handleToothPress = (toothNumber: number) => {
    if (!selectedPatientId) {
      Alert.alert('Seleccione un paciente', 'Por favor seleccione un paciente antes de agregar registros');
      return;
    }
    console.log('Diente presionado:', toothNumber);
    navigation.navigate('DentalRecordFormScreen', { 
      patientId: selectedPatientId, 
      toothNumber 
    });
  };

  if ((!selectedPatientId && loadingPatients) || loadingRecords) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Solo mostrar mensaje de "no paciente" si hay initialPatientId pero no selectedPatientId
  if (initialPatientId && !selectedPatientId) {
    return (
      <View style={styles.noPatientContainer}>
        <Text style={styles.noPatientText}>No se ha seleccionado ningún paciente</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Patients')}
        >
          <Text style={styles.buttonText}>Seleccionar Paciente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled={true}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Odontograma</Text>
        <Text style={styles.subtitle}>Registros dentales del paciente</Text>
        
        {!initialPatientId && (
          <View style={styles.patientPickerContainer}>
            <Text style={styles.label}>Paciente:</Text>
            <SimplePatientPicker
              patients={patients}
              selectedValue={selectedPatientId || ''}
              onValueChange={setSelectedPatientId}
              placeholder="Buscar paciente..."
            />
          </View>
        )}
      </View>

      {selectedPatientId && (
        <View style={styles.chartContainer}>
          <DentalChart 
            patientId={selectedPatientId} 
            onToothPress={handleToothPress}
          />
        </View>
      )}

      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Leyenda:</Text>
        {Object.entries({
          'healthy': 'Sano',
          'caries': 'Caries',
          'restoration': 'Restauración',
          'extraction': 'Extraído',
          'root_canal': 'Endodoncia',
          'crown': 'Corona',
          'impacted': 'Impactado',
          'missing': 'Faltante',
        }).map(([condition, label]) => (
          <View key={condition} style={styles.legendItem}>
            <View style={[
              styles.legendColor, 
              { backgroundColor: CONDITION_COLORS[condition as keyof typeof CONDITION_COLORS] }
            ]} />
            <Text style={styles.legendText}>{label}</Text>
          </View>
        ))}
      </View>

      {selectedPatientId && (
        <View style={styles.recordsContainer}>
          <Text style={styles.sectionTitle}>Últimos Registros</Text>
          {records.length > 0 ? (
            records.slice(0, 5).map(record => (
              <TouchableOpacity 
                key={record.id} 
                style={styles.recordCard}
                onPress={() => navigation.navigate('DentalRecordDetail', { recordId: record.id })}
              >
                <Text style={styles.recordTooth}>Diente {record.tooth_number}</Text>
                <Text style={styles.recordCondition}>{conditionLabel(record.condition)}</Text>
                <Text style={styles.recordDate}>
                  {new Date(record.treatment_date).toLocaleDateString('es-ES')}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyRecordsText}>No hay registros para este paciente</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
};

// Colores para las condiciones dentales
const CONDITION_COLORS = {
  'healthy': '#90ee90',
  'caries': '#a52a2a',
  'restoration': '#ffd700',
  'extraction': '#000000',
  'root_canal': '#800080',
  'crown': '#c0c0c0',
  'impacted': '#696969',
  'missing': '#ffffff',
};

// Función para traducir condiciones
const conditionLabel = (condition: string) => {
  const labels = {
    'healthy': 'Sano',
    'caries': 'Caries',
    'restoration': 'Restauración',
    'extraction': 'Extraído',
    'root_canal': 'Endodoncia',
    'crown': 'Corona',
    'impacted': 'Impactado',
    'missing': 'Faltante',
  };
  return labels[condition as keyof typeof labels] || condition;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPatientContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noPatientText: {
    fontSize: 18,
    color: '#64748b',
    marginBottom: 20,
    textAlign: 'center',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 5,
  },
  patientPickerContainer: {
    marginTop: 15,
    marginBottom: 20,
    zIndex: 1000,
  },
  label: {
    fontSize: 16,
    color: '#334155',
    marginBottom: 8,
  },
  patientSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: 'white',
    padding: 15,
    height: 50,
  },
  patientSelectorText: {
    fontSize: 16,
    color: '#1e293b',
    flex: 1,
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  legendContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1e293b',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  legendText: {
    fontSize: 14,
    color: '#334155',
  },
  recordsContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    minHeight: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1e293b',
  },
  recordCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  recordTooth: {
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 5,
  },
  recordCondition: {
    color: '#3b82f6',
    marginBottom: 5,
  },
  recordDate: {
    fontSize: 12,
    color: '#64748b',
  },
  emptyRecordsText: {
    color: '#94a3b8',
    textAlign: 'center',
    marginVertical: 20,
  },
  button: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default DentalChartScreen;