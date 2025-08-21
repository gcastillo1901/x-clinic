// src/components/AppointmentSection.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ActivityIndicator } from 'react-native-paper';
import { supabase } from '../services/supabase';
import AppointmentCard from './AppointmentCard';
import { Appointment } from '../types';

interface AppointmentSectionProps {
  patientId: string;
  onAddAppointment: () => void;
}

const AppointmentSection: React.FC<AppointmentSectionProps> = ({ 
  patientId, 
  onAddAppointment 
}) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, [patientId]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patientId)
        .order('date', { ascending: false });

      if (error) throw error;

      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string|Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Historial de Citas</Text>
        <TouchableOpacity onPress={onAddAppointment}>
          <MaterialIcons name="add" size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      {loading && appointments.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" />
        </View>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.appointmentItem}>
              <Text style={styles.appointmentDate}>{formatDate(item.date)}</Text>
              <Text style={styles.appointmentReason}>
                {item.reason || 'Consulta general'}
              </Text>
              <Text style={[
                styles.appointmentStatus,
                item.status === 'completed' && { color: '#10b981' },
                item.status === 'canceled' && { color: '#ef4444' },
              ]}>
                {item.status === 'scheduled' ? 'Programada' : 
                 item.status === 'completed' ? 'Completada' : 'Cancelada'}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay citas registradas</Text>
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
  appointmentItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  appointmentDate: {
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 5,
  },
  appointmentReason: {
    color: '#64748b',
    marginBottom: 5,
  },
  appointmentStatus: {
    color: '#3b82f6',
    fontSize: 12,
  },
  emptyText: {
    color: '#94a3b8',
    textAlign: 'center',
    padding: 20,
  },
});

export default AppointmentSection;