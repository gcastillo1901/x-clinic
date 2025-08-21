// src/screens/AppointmentFormScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, StyleSheet, TouchableOpacity, Alert, TextInput, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { Picker } from '@react-native-picker/picker';
import PatientPicker from '../components/PatientPicker';
import { Patient, Appointment } from '../types';

interface AppointmentFormScreenProps {
  route: any;
  navigation: any;
}

const AppointmentFormScreen: React.FC<AppointmentFormScreenProps> = ({ route, navigation }) => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const { control, handleSubmit, setValue, watch } = useForm<Appointment>({
    defaultValues: {
      patient_id: route.params?.patientId || '',
      clinic_id: session?.user.id || '',
      date: new Date(),
      duration: 30,
      status: 'scheduled',
      reason: '',
      notes: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  });

  const selectedDate = watch('date');

  useEffect(() => {
    fetchPatients();
    
    // Si estamos editando una cita existente, cargamos los datos
    if (route.params?.appointmentId) {
      fetchAppointment();
    }
  }, [route.params?.appointmentId]);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, full_name, clinic_id, phone, created_at, updated_at')
        .eq('clinic_id', session?.user.id)
        .order('full_name');

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      Alert.alert('Error', 'No se pudieron cargar los pacientes');
    }
  };

  const fetchAppointment = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', route.params.appointmentId)
        .single();

      if (error) throw error;

      // Establecer valores del formulario
      setValue('patient_id', data.patient_id);
      setValue('date', new Date(data.date));
      setValue('duration', data.duration);
      setValue('reason', data.reason || '');
      setValue('notes', data.notes || '');
    } catch (error) {
      console.error('Error fetching appointment:', error);
      Alert.alert('Error', 'No se pudo cargar la cita');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      // Mantener la hora actual al cambiar solo la fecha
      const currentDate = new Date(watch('date'));
      selectedDate.setHours(currentDate.getHours());
      selectedDate.setMinutes(currentDate.getMinutes());
      setValue('date', selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      // Mantener la fecha actual al cambiar solo la hora
      const currentDate = new Date(watch('date'));
      currentDate.setHours(selectedTime.getHours());
      currentDate.setMinutes(selectedTime.getMinutes());
      setValue('date', currentDate);
    }
  };

  const onSubmit = async (data: Appointment) => {
    try {
      setLoading(true);
      
      const appointmentData = {
        patient_id: data.patient_id,
        clinic_id: session?.user.id,
        date: typeof data.date === 'string' ? data.date : data.date.toISOString(),
        duration: data.duration,
        reason: data.reason,
        notes: data.notes,
        status: data.status,
        updated_at: new Date().toISOString(),
      };

      if (route.params?.appointmentId) {
        // Actualizar cita existente
        const { error } = await supabase
          .from('appointments')
          .update(appointmentData)
          .eq('id', route.params.appointmentId);

        if (error) throw error;
        Alert.alert('Éxito', 'Cita actualizada correctamente');
      } else {
        // Crear nueva cita
        const { error } = await supabase
          .from('appointments')
          .insert(appointmentData);

        if (error) throw error;
        Alert.alert('Éxito', 'Cita creada correctamente');
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error saving appointment:', error);
      Alert.alert('Error', 'No se pudo guardar la cita');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#3b82f6" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {route.params?.appointmentId ? 'Editar Cita' : 'Nueva Cita'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.formContainer} 
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={false}
      >

      <View style={styles.formGroup}>
        <Text style={styles.label}>Paciente</Text>
        <Controller
          control={control}
          name="patient_id"
          rules={{ required: 'Se requiere un paciente' }}
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <>
              <PatientPicker
                patients={patients}
                selectedValue={value}
                onValueChange={onChange}
              />
              {error && <Text style={styles.errorText}>{error.message}</Text>}
            </>
          )}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Fecha</Text>
        <TouchableOpacity 
          style={styles.dateTimeButton}
          onPress={() => setShowDatePicker(true)}
        >
          <MaterialIcons name="calendar-today" size={20} color="#3b82f6" />
          <Text style={styles.dateTimeText}>{formatDate(selectedDate)}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Hora</Text>
        <TouchableOpacity 
          style={styles.dateTimeButton}
          onPress={() => setShowTimePicker(true)}
        >
          <MaterialIcons name="access-time" size={20} color="#3b82f6" />
          <Text style={styles.dateTimeText}>{formatTime(selectedDate)}</Text>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Duración (minutos)</Text>
        <Controller
          control={control}
          name="duration"
          render={({ field: { value, onChange } }) => (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={value}
                onValueChange={onChange}
                style={styles.picker}
                itemStyle={Platform.OS === 'ios' ? styles.pickerItem : undefined}
              >
                <Picker.Item label="30 minutos" value={30} />
                <Picker.Item label="45 minutos" value={45} />
                <Picker.Item label="60 minutos" value={60} />
                <Picker.Item label="90 minutos" value={90} />
                <Picker.Item label="120 minutos" value={120} />
              </Picker>
            </View>
          )}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Motivo</Text>
        <Controller
          control={control}
          name="reason"
          render={({ field: { value, onChange } }) => (
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={onChange}
              placeholder="Ej: Limpieza dental, revisión general..."
            />
          )}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Notas adicionales</Text>
        <Controller
          control={control}
          name="notes"
          render={({ field: { value, onChange } }) => (
            <TextInput
              style={[styles.input, { height: 100 }]}
              value={value}
              onChangeText={onChange}
              placeholder="Notas importantes sobre la cita..."
              multiline
            />
          )}
        />
      </View>

      <TouchableOpacity 
        style={styles.saveButton} 
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>
          {loading ? 'Guardando...' : 'Guardar Cita'}
        </Text>
      </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#334155',
    fontWeight: '500',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  dateTimeText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#1e293b',
  },
  pickerContainer: {
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: 'white',
    overflow: 'hidden',
    height: Platform.OS === 'ios' ? 180 : 50,
  },
  picker: {
    height: Platform.OS === 'ios' ? 180 : 50,
    backgroundColor: 'transparent',
  },
  pickerItem: {
    height: 180,
    fontSize: 16,
    color: '#1e293b',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: '#ef4444',
    marginTop: 5,
    fontSize: 14,
  },
});

export default AppointmentFormScreen;