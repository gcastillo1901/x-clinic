// src/screens/DentalRecordFormScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../services/supabase";
import { Picker } from "@react-native-picker/picker";
import CustomPicker from '../components/CustomPicker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DentalRecord } from '../types';
import SearchablePatientPicker from '../components/SearchablePatientPicker';
import MultipleToothPicker from '../components/MultipleToothPicker';

interface DentalRecordFormScreenProps {
  route: any;
  navigation: any;
}

const DentalRecordFormScreen: React.FC<DentalRecordFormScreenProps> = ({
  route,
  navigation,
}) => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedTeeth, setSelectedTeeth] = useState<number[]>(route.params?.toothNumber ? [route.params.toothNumber] : []);
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<DentalRecord>({
    defaultValues: {
      id: route.params?.record?.id || "",
      patient_id: route.params?.patientId || "",
      clinic_id: session?.user.id || "",
      tooth_numbers: route.params?.toothNumber ? [route.params.toothNumber] : [],
      condition: "",
      notes: "",
      images: [],
      treatment_date: new Date().toISOString().split('T')[0],
      next_appointment: "",
      created_at: new Date().toISOString(),
      ...route.params?.record,
    },
  });

  const conditions = [
    { label: "Seleccionar condición...", value: "" },
    { label: "Sano", value: "healthy" },
    { label: "Caries", value: "caries" },
    { label: "Restauración", value: "restoration" },
    { label: "Extraído", value: "extraction" },
    { label: "Endodoncia", value: "root_canal" },
    { label: "Corona", value: "crown" },
    { label: "Impactado", value: "impacted" },
    { label: "Faltante", value: "missing" },
  ];

  const toothNumbers = [
    // Cuadrante 1 (Superior derecho): 11-18
    ...Array.from({ length: 8 }, (_, i) => ({ label: `Diente ${11 + i}`, value: 11 + i })),
    // Cuadrante 2 (Superior izquierdo): 21-28
    ...Array.from({ length: 8 }, (_, i) => ({ label: `Diente ${21 + i}`, value: 21 + i })),
    // Cuadrante 3 (Inferior izquierdo): 31-38
    ...Array.from({ length: 8 }, (_, i) => ({ label: `Diente ${31 + i}`, value: 31 + i })),
    // Cuadrante 4 (Inferior derecho): 41-48
    ...Array.from({ length: 8 }, (_, i) => ({ label: `Diente ${41 + i}`, value: 41 + i }))
  ];

  const [showNextAppointmentPicker, setShowNextAppointmentPicker] = useState(false);
  const [showNextAppointmentTimePicker, setShowNextAppointmentTimePicker] = useState(false);
  const [nextAppointmentDate, setNextAppointmentDate] = useState<Date | null>(null);
  const [showTreatmentDatePicker, setShowTreatmentDatePicker] = useState(false);
  const [treatmentDate, setTreatmentDate] = useState<Date>(new Date());

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, full_name')
        .eq('clinic_id', session?.user.id)
        .order('full_name');

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const checkAppointmentConflict = async (appointmentDateTime: string) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('id')
        .eq('clinic_id', session?.user.id)
        .eq('date', appointmentDateTime);

      if (error) throw error;
      return (data || []).length > 0;
    } catch (error) {
      console.error('Error checking appointment conflict:', error);
      return false;
    }
  };

  const createAppointment = async (patientId: string, appointmentDateTime: string) => {
    try {
      const appointmentData = {
        patient_id: patientId,
        clinic_id: session?.user.id,
        date: appointmentDateTime,
        duration: 30,
        reason: 'Seguimiento dental',
        status: 'scheduled',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('appointments')
        .insert(appointmentData);

      if (error) throw error;
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  };

const handleNextAppointmentChange = (event: any, selectedDate?: Date) => {
  setShowNextAppointmentPicker(false);
  if (selectedDate) {
    const currentTime = nextAppointmentDate || new Date();
    selectedDate.setHours(currentTime.getHours());
    selectedDate.setMinutes(currentTime.getMinutes());
    setNextAppointmentDate(selectedDate);
    setValue('next_appointment', selectedDate.toISOString());
  }
};

const handleNextAppointmentTimeChange = (event: any, selectedTime?: Date) => {
  setShowNextAppointmentTimePicker(false);
  if (selectedTime && nextAppointmentDate) {
    const newDateTime = new Date(nextAppointmentDate);
    newDateTime.setHours(selectedTime.getHours());
    newDateTime.setMinutes(selectedTime.getMinutes());
    setNextAppointmentDate(newDateTime);
    setValue('next_appointment', newDateTime.toISOString());
  }
};

const handleTreatmentDateChange = (event: any, selectedDate?: Date) => {
  setShowTreatmentDatePicker(false);
  if (selectedDate) {
    setTreatmentDate(selectedDate);
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    setValue('treatment_date', `${year}-${month}-${day}`);
  }
};


  const onSubmit = async (data: DentalRecord) => {
    try {
      setLoading(true);

      if (selectedTeeth.length === 0) {
        Alert.alert("Error", "Debe seleccionar al menos un diente");
        return;
      }

      // Crear un registro para cada diente seleccionado
      const recordsData = selectedTeeth.map(toothNumber => ({
        patient_id: data.patient_id,
        clinic_id: session?.user.id,
        tooth_number: toothNumber,
        condition: data.condition,
        notes: data.notes || null,
        images: data.images || [],
        treatment_date: data.treatment_date,
        next_appointment: data.next_appointment || null,
      }));

      if (route.params?.record?.id) {
        // Actualizar registro existente (solo un diente)
        const { error } = await supabase
          .from("dental_records")
          .update(recordsData[0])
          .eq("id", route.params.record.id);

        if (error) throw error;
        Alert.alert("Éxito", "Registro dental actualizado correctamente");
      } else {
        // Crear nuevos registros
        const { error } = await supabase
          .from("dental_records")
          .insert(recordsData);

        if (error) throw error;

        // Crear cita automáticamente si hay fecha de próxima cita
        if (data.next_appointment && nextAppointmentDate) {
          const appointmentDateTime = nextAppointmentDate.toISOString();
          
          // Verificar conflictos
          const hasConflict = await checkAppointmentConflict(appointmentDateTime);
          
          if (hasConflict) {
            Alert.alert(
              "Conflicto de cita", 
              "Ya existe una cita programada para esa fecha y hora. ¿Desea continuar sin crear la cita?",
              [
                { text: "Continuar", style: "default" },
                { 
                  text: "Crear cita de todas formas", 
                  onPress: async () => {
                    await createAppointment(data.patient_id, appointmentDateTime);
                  }
                }
              ]
            );
          } else {
            await createAppointment(data.patient_id, appointmentDateTime);
          }
        }

        Alert.alert("Éxito", `${selectedTeeth.length} registro(s) dental(es) creado(s) correctamente`);
      }

      navigation.goBack();
    } catch (error) {
      console.error("Error saving dental record:", error);
      Alert.alert("Error", "No se pudo guardar el registro dental");
    } finally {
      setLoading(false);
    }
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
          {route.params?.record?.id ? "Editar Registro" : "Nuevo Registro Dental"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.formContainer} 
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={false}
      >
        {!route.params?.patientId && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Paciente *</Text>
            <Controller
              control={control}
              name="patient_id"
              rules={{ required: "Este campo es obligatorio" }}
              render={({ field: { value, onChange }, fieldState: { error } }) => (
                <>
                  <SearchablePatientPicker
                    patients={patients}
                    selectedValue={value}
                    onValueChange={onChange}
                    placeholder="Buscar y seleccionar paciente..."
                  />
                  {error && (
                    <Text style={styles.errorText}>{error.message}</Text>
                  )}
                </>
              )}
            />
          </View>
        )}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Dientes *</Text>
          <MultipleToothPicker
            selectedTeeth={selectedTeeth}
            onSelectionChange={setSelectedTeeth}
          />
          {selectedTeeth.length === 0 && (
            <Text style={styles.errorText}>Debe seleccionar al menos un diente</Text>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Condición *</Text>
          <Controller
            control={control}
            name="condition"
            rules={{ required: "Este campo es obligatorio" }}
            render={({ field: { value, onChange } }) => (
              <>
                <CustomPicker
                  items={conditions.map(condition => ({
                    label: condition.label,
                    value: condition.value
                  }))}
                  selectedValue={value}
                  onValueChange={onChange}
                  placeholder="Seleccionar condición..."
                />
                {errors.condition && (
                  <Text style={styles.errorText}>{errors.condition.message}</Text>
                )}
              </>
            )}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Fecha de tratamiento *</Text>
          <Controller
            control={control}
            name="treatment_date"
            rules={{ required: "Este campo es obligatorio" }}
            render={({ field: { value, onChange } }) => (
              <>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setShowTreatmentDatePicker(true)}
                >
                  <MaterialIcons name="calendar-today" size={20} color="#3b82f6" />
                  <Text style={styles.dateButtonText}>
                    {value ? new Date(value + 'T00:00:00').toLocaleDateString('es-ES') : 'Seleccionar fecha'}
                  </Text>
                </TouchableOpacity>
                {showTreatmentDatePicker && (
                  <DateTimePicker
                    value={treatmentDate}
                    mode="date"
                    display="default"
                    onChange={handleTreatmentDateChange}
                    maximumDate={new Date()}
                  />
                )}
                {errors.treatment_date && (
                  <Text style={styles.errorText}>{errors.treatment_date.message}</Text>
                )}
              </>
            )}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Próxima cita</Text>
          <Controller
            control={control}
            name="next_appointment"
            render={({ field: { value, onChange } }) => (
              <>
                <View style={styles.dateTimeRow}>
                  <TouchableOpacity 
                    style={[styles.dateButton, { flex: 1, marginRight: 10 }]}
                    onPress={() => setShowNextAppointmentPicker(true)}
                  >
                    <MaterialIcons name="calendar-today" size={20} color="#3b82f6" />
                    <Text style={styles.dateButtonText}>
                      {nextAppointmentDate ? nextAppointmentDate.toLocaleDateString('es-ES') : 'Fecha'}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.dateButton, { flex: 1 }]}
                    onPress={() => setShowNextAppointmentTimePicker(true)}
                    disabled={!nextAppointmentDate}
                  >
                    <MaterialIcons name="access-time" size={20} color={nextAppointmentDate ? "#3b82f6" : "#94a3b8"} />
                    <Text style={[styles.dateButtonText, !nextAppointmentDate && { color: '#94a3b8' }]}>
                      {nextAppointmentDate ? nextAppointmentDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : 'Hora'}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                {showNextAppointmentPicker && (
                  <DateTimePicker
                    value={nextAppointmentDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={handleNextAppointmentChange}
                    minimumDate={new Date()}
                  />
                )}
                
                {showNextAppointmentTimePicker && nextAppointmentDate && (
                  <DateTimePicker
                    value={nextAppointmentDate}
                    mode="time"
                    display="default"
                    onChange={handleNextAppointmentTimeChange}
                  />
                )}
              </>
            )}
          />
        </View>


        <View style={styles.formGroup}>
          <Text style={styles.label}>Notas</Text>
          <Controller
            control={control}
            name="notes"
            render={({ field: { value, onChange } }) => (
              <TextInput
                style={[styles.input, { height: 100 }]}
                value={value}
                onChangeText={onChange}
                placeholder="Observaciones sobre el tratamiento..."
                multiline
                textAlignVertical="top"
              />
            )}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>
              {route.params?.record?.id ? "Actualizar" : "Crear"} Registro
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
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
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1e293b",
  },
  input: {
    height: 50,
    borderColor: "#cbd5e1",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: "white",
    fontSize: 16,
  },
  pickerContainer: {
    borderColor: "#cbd5e1",
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "white",
    overflow: "hidden",
    height: Platform.OS === 'ios' ? 180 : 50,
  },
  picker: {
    height: Platform.OS === 'ios' ? 180 : 50,
    backgroundColor: "transparent",
  },
  pickerItem: {
    height: 180,
    fontSize: 16,
    color: "#1e293b",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 5,
  },
  submitButton: {
    height: 50,
    backgroundColor: "#3b82f6",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  disabledButton: {
    backgroundColor: "#94a3b8",
  },
  submitButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  dateButton: {
  height: 50,
  borderColor: "#cbd5e1",
  borderWidth: 1,
  borderRadius: 8,
  paddingHorizontal: 15,
  backgroundColor: "white",
  flexDirection: "row",
  alignItems: "center",
},
dateButtonText: {
  fontSize: 16,
  color: "#1e293b",
  marginLeft: 10,
},
dateTimeRow: {
  flexDirection: 'row',
  alignItems: 'center',
},
});

export default DentalRecordFormScreen;
