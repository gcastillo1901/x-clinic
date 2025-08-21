// src/screens/AppointmentsScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import AppointmentCard from '../components/AppointmentCard';
import { Appointment } from '../types';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const AppointmentsScreen = () => {
  const navigation = useNavigation<any>();
  const { session } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      fetchAppointments();
    }
  }, [session, selectedDate]);

  useFocusEffect(
    React.useCallback(() => {
      if (session) {
        fetchAppointments();
      }
    }, [session, selectedDate])
  );

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('appointments')
        .select('*, patient:patients(full_name, phone)')
        .eq('clinic_id', session?.user.id)
        .gte('date', startOfDay.toISOString())
        .lte('date', endOfDay.toISOString())
        .order('date');

      if (error) throw error;

      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      Alert.alert('Error', 'No se pudieron cargar las citas');
    } finally {
      setLoading(false);
    }
  };

  const handleDayPress = (day: DateData) => {
    setSelectedDate(new Date(day.dateString));
  };

  const handleAddAppointment = () => {
    navigation.navigate('AppointmentForm');
  };

  const handleEditAppointment = (appointmentId: string) => {
    navigation.navigate('AppointmentForm', { appointmentId });
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId);

      if (error) throw error;

      Alert.alert('Éxito', 'Cita eliminada correctamente');
      fetchAppointments();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      Alert.alert('Error', 'No se pudo eliminar la cita');
    } finally {
      setLoading(false);
    }
  };

  const formatDateHeader = (date: Date) => {
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
  };

  const confirmDelete = (appointmentId: string) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que quieres eliminar esta cita?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', onPress: () => handleDeleteAppointment(appointmentId) }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Calendar
        current={selectedDate.toISOString().split('T')[0]}
        onDayPress={handleDayPress}
        markedDates={{
          [selectedDate.toISOString().split('T')[0]]: { 
            selected: true,
            selectedColor: '#3b82f6'
          }
        }}
        theme={{
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#64748b',
          selectedDayBackgroundColor: '#3b82f6',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#3b82f6',
          dayTextColor: '#1e293b',
          textDisabledColor: '#cbd5e1',
          arrowColor: '#3b82f6',
          monthTextColor: '#1e293b',
          indicatorColor: '#3b82f6',
          textDayFontWeight: '400',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '500',
          textDayFontSize: 14,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 14,
        }}
      />

      <View style={styles.header}>
        <Text style={styles.dateText}>
          {formatDateHeader(selectedDate)}
        </Text>
        <Text style={styles.countText}>
          {appointments.length} {appointments.length === 1 ? 'cita' : 'citas'}
        </Text>
      </View>

      {loading && appointments.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AppointmentCard 
              appointment={item} 
              onPress={() => handleEditAppointment(item.id)}
              onDelete={() => confirmDelete(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="event-available" size={50} color="#e2e8f0" />
              <Text style={styles.emptyText}>No hay citas programadas</Text>
              <TouchableOpacity 
                style={styles.addButtonSmall}
                onPress={handleAddAppointment}
              >
                <Text style={styles.addButtonText}>Agregar Cita</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      <TouchableOpacity 
        style={styles.addButton}
        onPress={handleAddAppointment}
      >
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    textTransform: 'capitalize',
  },
  countText: {
    fontSize: 14,
    color: '#64748b',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 15,
    paddingBottom: 80,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: '#94a3b8',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addButtonSmall: {
    marginTop: 20,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default AppointmentsScreen;