// src/screens/PaymentFormScreen.tsx
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
import { Payment } from '../types';
import SearchablePatientPicker from '../components/SearchablePatientPicker';
import DisabledPatientField from '../components/DisabledPatientField';
import { useDataRefresh } from '../contexts/DataContext';

interface PaymentFormScreenProps {
  route: any;
  navigation: any;
}

const PaymentFormScreen: React.FC<PaymentFormScreenProps> = ({
  route,
  navigation,
}) => {
  const { session } = useAuth();
  const { triggerRefresh } = useDataRefresh();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [paymentDate, setPaymentDate] = useState(new Date());

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Payment>({
    defaultValues: {
      patient_id: route.params?.patientId || "",
      clinic_id: session?.user.id || "",
      appointment_id: route.params?.appointmentId || "",
      amount: 0,
      currency: "NIO",
      payment_method: "cash",
      payment_date: new Date().toISOString().split('T')[0],
      notes: "",
      ...route.params?.payment,
    },
  });

  const selectedPatientId = watch('patient_id');

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (selectedPatientId) {
      fetchAppointments(selectedPatientId);
    }
  }, [selectedPatientId]);

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

  const fetchAppointments = async (patientId: string) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('id, date, reason')
        .eq('patient_id', patientId)
        .eq('clinic_id', session?.user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const paymentMethods = [
    { label: "Efectivo", value: "cash" },
    { label: "Tarjeta de débito", value: "debit_card" },
    { label: "Tarjeta de crédito", value: "credit_card" },
    { label: "Transferencia", value: "transfer" },
  ];

  const currencies = [
    { label: "Córdobas (C$)", value: "NIO" },
    { label: "Dólares ($)", value: "USD" },
  ];

  const getCurrencySymbol = (currency: string) => {
    return currency === "USD" ? "$" : "C$";
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setPaymentDate(selectedDate);
      // Guardar solo la fecha sin timezone
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      setValue('payment_date', `${year}-${month}-${day}`);
    }
  };

  const onSubmit = async (data: Payment) => {
    try {
      setLoading(true);

      // Asegurar que payment_date esté en formato YYYY-MM-DD
      const paymentDateFormatted = typeof data.payment_date === 'string' 
        ? data.payment_date.split('T')[0] 
        : new Date(data.payment_date).toISOString().split('T')[0];
      
      const paymentData = {
        patient_id: data.patient_id,
        clinic_id: session?.user.id,
        appointment_id: data.appointment_id || null,
        amount: data.amount,
        currency: data.currency,
        payment_method: data.payment_method,
        payment_date: paymentDateFormatted,
        notes: data.notes || null,
      };
      
      console.log('Saving payment data:', paymentData);

      if (route.params?.payment?.id) {
        // Actualizar pago existente
        const { error } = await supabase
          .from("payments")
          .update(paymentData)
          .eq("id", route.params.payment.id);

        if (error) throw error;
        Alert.alert("Éxito", "Pago actualizado correctamente");
        triggerRefresh();
      } else {
        // Crear nuevo pago
        const { error } = await supabase
          .from("payments")
          .insert(paymentData);

        if (error) throw error;
        Alert.alert("Éxito", "Pago registrado correctamente");
        triggerRefresh();
      }

      navigation.goBack();
    } catch (error) {
      console.error("Error saving payment:", error);
      Alert.alert("Error", "No se pudo guardar el pago");
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
          {route.params?.payment?.id ? "Editar Pago" : "Nuevo Pago"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.formContainer} 
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formGroup}>
          <Text style={styles.label}>Paciente *</Text>
          <Controller
            control={control}
            name="patient_id"
            rules={{ required: "Este campo es obligatorio" }}
            render={({ field: { value, onChange } }) => (
              <>
                {route.params?.patientId ? (
                  <DisabledPatientField
                    patientName={patients.find(p => p.id === value)?.full_name || 'Paciente seleccionado'}
                  />
                ) : (
                  <SearchablePatientPicker
                    patients={patients}
                    selectedValue={value}
                    onValueChange={onChange}
                    placeholder="Buscar y seleccionar paciente..."
                  />
                )}
                {errors.patient_id && (
                  <Text style={styles.errorText}>{errors.patient_id.message}</Text>
                )}
              </>
            )}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Cita (opcional)</Text>
          <Controller
            control={control}
            name="appointment_id"
            render={({ field: { value, onChange } }) => (
              <CustomPicker
                items={[
                  { label: "Sin cita asociada", value: "" },
                  ...appointments.map(appointment => ({
                    label: `${new Date(appointment.date).toLocaleDateString('es-ES')} - ${appointment.reason || 'Consulta'}`,
                    value: appointment.id
                  }))
                ]}
                selectedValue={value}
                onValueChange={onChange}
                placeholder="Seleccionar cita..."
              />
            )}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Moneda *</Text>
          <Controller
            control={control}
            name="currency"
            rules={{ required: "Este campo es obligatorio" }}
            render={({ field: { value, onChange } }) => (
              <>
                <CustomPicker
                  items={currencies.map(currency => ({
                    label: currency.label,
                    value: currency.value
                  }))}
                  selectedValue={value}
                  onValueChange={onChange}
                  placeholder="Seleccionar moneda..."
                />
                {errors.currency && (
                  <Text style={styles.errorText}>{errors.currency.message}</Text>
                )}
              </>
            )}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Monto *</Text>
          <Controller
            control={control}
            name="amount"
            rules={{ 
              required: "Este campo es obligatorio",
              min: { value: 0.01, message: "El monto debe ser mayor a 0" }
            }}
            render={({ field: { value, onChange } }) => (
              <>
                <View style={styles.amountContainer}>
                  <Text style={styles.currencySymbol}>
                    {getCurrencySymbol(watch('currency'))}
                  </Text>
                  <TextInput
                    style={[styles.input, styles.amountInput]}
                    value={value?.toString() || ""}
                    onChangeText={(text) => onChange(parseFloat(text) || 0)}
                    placeholder="0.00"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                  />
                </View>
                {errors.amount && (
                  <Text style={styles.errorText}>{errors.amount.message}</Text>
                )}
              </>
            )}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Método de pago *</Text>
          <Controller
            control={control}
            name="payment_method"
            rules={{ required: "Este campo es obligatorio" }}
            render={({ field: { value, onChange } }) => (
              <>
                <CustomPicker
                  items={paymentMethods.map(method => ({
                    label: method.label,
                    value: method.value
                  }))}
                  selectedValue={value}
                  onValueChange={onChange}
                  placeholder="Seleccionar método..."
                />
                {errors.payment_method && (
                  <Text style={styles.errorText}>{errors.payment_method.message}</Text>
                )}
              </>
            )}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Fecha de pago *</Text>
          <Controller
            control={control}
            name="payment_date"
            rules={{ required: "Este campo es obligatorio" }}
            render={({ field: { value, onChange } }) => (
              <>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <MaterialIcons name="calendar-today" size={20} color="#3b82f6" />
                  <Text style={styles.dateButtonText}>
                    {new Date(value).toLocaleDateString('es-ES')}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={paymentDate}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                  />
                )}
                {errors.payment_date && (
                  <Text style={styles.errorText}>{errors.payment_date.message}</Text>
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
                style={[styles.input, { height: 80 }]}
                value={value}
                onChangeText={onChange}
                placeholder="Observaciones sobre el pago..."
                placeholderTextColor="#94a3b8"
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
              {route.params?.payment?.id ? "Actualizar" : "Registrar"} Pago
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
    color: "#1e293b",
    includeFontPadding: false,
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
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#cbd5e1",
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "white",
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3b82f6",
    paddingHorizontal: 15,
  },
  amountInput: {
    flex: 1,
    borderWidth: 0,
    paddingLeft: 0,
  },
});

export default PaymentFormScreen;