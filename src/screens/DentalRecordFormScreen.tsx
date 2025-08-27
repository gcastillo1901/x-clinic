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
import DateTimePicker from '@react-native-community/datetimepicker';
import { DentalRecord } from '../types';

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
      tooth_number: route.params?.toothNumber || 1,
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
const [nextAppointmentDate, setNextAppointmentDate] = useState<Date | null>(null);

const handleNextAppointmentChange = (event: any, selectedDate?: Date) => {
  setShowNextAppointmentPicker(false);
  if (selectedDate) {
    setNextAppointmentDate(selectedDate);
    setValue('next_appointment', selectedDate.toISOString().split('T')[0]);
  }
};


  const onSubmit = async (data: DentalRecord) => {
    try {
      setLoading(true);

      const recordData = {
        patient_id: data.patient_id,
        clinic_id: session?.user.id,
        tooth_number: data.tooth_number,
        condition: data.condition,
        notes: data.notes || null,
        images: data.images || [],
        treatment_date: data.treatment_date,
        next_appointment: data.next_appointment || null,
      };

      if (route.params?.record?.id) {
        // Actualizar registro existente
        const { error } = await supabase
          .from("dental_records")
          .update(recordData)
          .eq("id", route.params.record.id);

        if (error) throw error;
        Alert.alert("Éxito", "Registro dental actualizado correctamente");
      } else {
        // Crear nuevo registro
        const { error } = await supabase
          .from("dental_records")
          .insert(recordData);

        if (error) throw error;
        Alert.alert("Éxito", "Registro dental creado correctamente");
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
        <View style={styles.formGroup}>
          <Text style={styles.label}>Número de diente *</Text>
          <Controller
            control={control}
            name="tooth_number"
            rules={{ required: "Este campo es obligatorio" }}
            render={({ field: { value, onChange } }) => (
              <>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={value}
                    onValueChange={onChange}
                    style={styles.picker}
                    itemStyle={Platform.OS === 'ios' ? styles.pickerItem : undefined}
                  >
                    {toothNumbers.map((tooth) => (
                      <Picker.Item
                        key={tooth.value}
                        label={tooth.label}
                        value={tooth.value}
                      />
                    ))}
                  </Picker>
                </View>
                {errors.tooth_number && (
                  <Text style={styles.errorText}>{errors.tooth_number.message}</Text>
                )}
              </>
            )}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Condición *</Text>
          <Controller
            control={control}
            name="condition"
            rules={{ required: "Este campo es obligatorio" }}
            render={({ field: { value, onChange } }) => (
              <>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={value}
                    onValueChange={onChange}
                    style={styles.picker}
                    itemStyle={Platform.OS === 'ios' ? styles.pickerItem : undefined}
                  >
                    {conditions.map((condition) => (
                      <Picker.Item
                        key={condition.value}
                        label={condition.label}
                        value={condition.value}
                      />
                    ))}
                  </Picker>
                </View>
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
                <TextInput
                  style={styles.input}
                  value={value}
                  onChangeText={onChange}
                  placeholder="YYYY-MM-DD"
                  keyboardType="numbers-and-punctuation"
                />
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
        <TouchableOpacity 
          style={styles.dateButton}
          onPress={() => setShowNextAppointmentPicker(true)}
        >
          <MaterialIcons name="calendar-today" size={20} color="#3b82f6" />
          <Text style={styles.dateButtonText}>
            {value ? new Date(value).toLocaleDateString('es-ES') : 'Seleccionar fecha'}
          </Text>
        </TouchableOpacity>
        {showNextAppointmentPicker && (
          <DateTimePicker
            value={nextAppointmentDate || new Date()}
            mode="date"
            display="default"
            onChange={handleNextAppointmentChange}
            minimumDate={new Date()}
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
});

export default DentalRecordFormScreen;
