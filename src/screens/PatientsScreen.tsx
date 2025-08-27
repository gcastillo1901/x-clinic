// src/screens/PatientsScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../services/supabase';
import PatientCard from '../components/PatientCard';
import SearchBar from '../components/SearchBar';
import { Patient } from '../types';
import { useDataRefresh } from '../contexts/DataContext';
import { useFocusEffect } from '@react-navigation/native';

const PatientsScreen = ({ navigation }: {navigation: any;}) => {
  const { session } = useAuth();
  const { refreshTrigger } = useDataRefresh();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (session) {
      fetchPatients();
    }
  }, [session, refreshTrigger]);

  useFocusEffect(
    React.useCallback(() => {
      if (session) {
        fetchPatients();
      }
    }, [session, refreshTrigger])
  );

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('clinic_id', session?.user.id)
        .order('full_name');

      if (error) throw error;

      setPatients(data);
      setFilteredPatients(data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 0) {
      const filtered = patients.filter(patient => 
        patient.full_name.toLowerCase().includes(query.toLowerCase()) ||
        patient.phone.includes(query)
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients(patients);
    }
  };

  const handleAddPatient = () => {
    navigation.navigate('PatientForm');
  };

  const handleEditPatient = (patient: Patient) => {
  navigation.navigate('PatientForm', { patient });
};

  if (loading && patients.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SearchBar 
        value={searchQuery}
        onChangeText={handleSearch}
        placeholder="Buscar pacientes..."
      />

      <FlatList
        data={filteredPatients}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PatientCard 
            patient={item} 
            onPress={() => navigation.navigate('PatientDetail', { patientId: item.id })}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="people-outline" size={50} color="#cbd5e1" />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No se encontraron pacientes' : 'No hay pacientes registrados'}
            </Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.addButton} onPress={handleAddPatient}>
        <MaterialIcons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  emptyText: {
    marginTop: 15,
    color: '#94a3b8',
    fontSize: 16,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
});

export default PatientsScreen;