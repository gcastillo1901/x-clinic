// src/screens/PatientFormScreen.tsx
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
  Image,
  TextInput,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../services/supabase";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from 'expo-file-system';
import { Picker } from "@react-native-picker/picker";
import CustomPicker from '../components/CustomPicker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Patient } from "../types";
import { useDataRefresh } from '../contexts/DataContext';

interface PatientFormScreenProps {
  route: any;
  navigation: any;
}

const PatientFormScreen: React.FC<PatientFormScreenProps> = ({
  route,
  navigation,
}) => {
  const { session } = useAuth();
  const { refreshTrigger, triggerRefresh } = useDataRefresh();
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Patient>({
    defaultValues: {
      full_name: "",
      birth_date: "",
      gender: undefined,
      phone: "",
      address: "",
      email: "",
      notes: "",
      ...route.params?.patient,
    },
  });

  useEffect(() => {
    if (route.params?.patient?.photo_url) {
      setImageUri(route.params.patient.photo_url);
    }
    if (route.params?.patient?.birth_date) {
      // Parsear fecha de BD (YYYY-MM-DD) como fecha local
      const [year, month, day] = route.params.patient.birth_date.split('-');
      const localDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      setBirthDate(localDate);
      setValue('birth_date', localDate.toLocaleDateString('es-ES'));
    }
  }, [route.params?.patient]);

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permiso requerido",
          "Necesitamos acceso a tus fotos para subir una imagen"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'Images' as any,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "No se pudo seleccionar la imagen");
    }
  };

  const convertImageToBase64 = async (uri: string) => {
    try {
      // Leer archivo como base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Crear data URL
      const dataUrl = `data:image/jpeg;base64,${base64}`;
      
      return dataUrl;
    } catch (error) {
      console.error("Error converting image:", error);
      throw error;
    }
  };

  const onSubmit = async (data: Patient) => {
    try {
      setLoading(true);

      // Formatear fecha de nacimiento
      let birth_date = null;
      if (data.birth_date) {
        const [day, month, year] = data.birth_date.split('/');
        if (day && month && year) {
          // Crear fecha local y formatear para BD
          const localDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          birth_date = localDate.getFullYear() + '-' + 
            String(localDate.getMonth() + 1).padStart(2, '0') + '-' + 
            String(localDate.getDate()).padStart(2, '0');
        }
      }

      let photo_url = imageUri;

      // Convertir imagen a base64 si es una URI local
      if (imageUri && imageUri.startsWith("file://")) {
        photo_url = await convertImageToBase64(imageUri);
      }

      const patientData = {
        ...data,
        birth_date, // ← Usar la fecha formateada
        clinic_id: session?.user.id,
        photo_url,
        updated_at: new Date().toISOString(),
      };



      // Limpiar propiedades undefined
      Object.keys(patientData).forEach(key => {
        if (patientData[key as keyof Patient] === undefined) {
          delete patientData[key as keyof Patient];
        }
      });

      if (route.params?.patient?.id) {
        // Actualizar paciente existente
        const { error } = await supabase
          .from("patients")
          .update(patientData)
          .eq("id", route.params.patient.id);

        if (error) throw error;
        Alert.alert("Éxito", "Paciente actualizado correctamente");
      } else {
        // Crear nuevo paciente
        const { error } = await supabase.from("patients").insert(patientData);

        if (error) throw error;
        Alert.alert("Éxito", "Paciente creado correctamente");
      }

      // Actualizar el estado local con la nueva URL de la imagen
      if (photo_url && photo_url !== imageUri) {
        setImageUri(photo_url);
      }

      // Trigger refresh para actualizar otras pantallas
      triggerRefresh();

      navigation.goBack();
    } catch (error) {
      console.error("Error saving patient:", error);
      Alert.alert("Error", "No se pudo guardar el paciente");
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
          {route.params?.patient?.id ? "Editar Paciente" : "Nuevo Paciente"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.formContainer} 
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={false}
      >

      {/* Sección de foto */}
      <View style={styles.photoSection}>
        <TouchableOpacity onPress={pickImage}>
          <View style={styles.photoContainer}>
            {imageUri ? (
              <Image 
                source={{ uri: imageUri }} 
                style={styles.photo}
              />
            ) : (
              <MaterialIcons name="add-a-photo" size={40} color="#94a3b8" />
            )}
          </View>
        </TouchableOpacity>
        <Text style={styles.photoLabel}>Foto del paciente</Text>
      </View>

      {/* Formulario */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Nombre completo *</Text>
        <Controller
          control={control}
          name="full_name"
          rules={{ required: "Este campo es obligatorio" }}
          render={({ field: { value, onChange } }) => (
            <>
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChange}
                placeholder="Nombre completo"
                placeholderTextColor="#94a3b8"
              />
              {errors.full_name && (
                <Text style={styles.errorText}>{errors.full_name.message}</Text>
              )}
            </>
          )}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Fecha de nacimiento</Text>
        <Controller
          control={control}
          name="birth_date"
          render={({ field: { value, onChange } }) => (
            <>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <MaterialIcons name="calendar-today" size={20} color="#3b82f6" />
                <Text style={styles.dateButtonText}>
                  {value || 'Seleccionar fecha de nacimiento'}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={birthDate || new Date()}
                  mode="date"
                  display="default"
                  maximumDate={new Date()}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      setBirthDate(selectedDate);
                      // Crear fecha local para evitar problemas de zona horaria
                      const localDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
                      onChange(localDate.toLocaleDateString('es-ES'));
                    }
                  }}
                />
              )}
            </>
          )}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Género</Text>
        <Controller
          control={control}
          name="gender"
          render={({ field: { value, onChange } }) => (
            <CustomPicker
              items={[
                { label: "Seleccionar...", value: undefined },
                { label: "Masculino", value: "male" },
                { label: "Femenino", value: "female" },
                { label: "Otro", value: "other" }
              ]}
              selectedValue={value}
              onValueChange={onChange}
              placeholder="Seleccionar género..."
            />
          )}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Teléfono *</Text>
        <Controller
          control={control}
          name="phone"
          rules={{ required: "Este campo es obligatorio" }}
          render={({ field: { value, onChange } }) => (
            <>
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChange}
                placeholder="Número de teléfono"
                keyboardType="phone-pad"
                placeholderTextColor="#94a3b8"
              />
              {errors.phone && (
                <Text style={styles.errorText}>{errors.phone.message}</Text>
              )}
            </>
          )}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Email</Text>
        <Controller
          control={control}
          name="email"
          rules={{
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Email inválido",
            },
          }}
          render={({ field: { value, onChange } }) => (
            <>
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChange}
                placeholder="Correo electrónico"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#94a3b8"
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email.message}</Text>
              )}
            </>
          )}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Dirección</Text>
        <Controller
          control={control}
          name="address"
          render={({ field: { value, onChange } }) => (
            <TextInput
              style={[styles.input, { height: 100 }]}
              value={value}
              onChangeText={onChange}
              placeholder="Dirección completa"
              placeholderTextColor="#94a3b8"
            />
          )}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Notas médicas</Text>
        <Controller
          control={control}
          name="notes"
          render={({ field: { value, onChange } }) => (
            <TextInput
              style={[styles.input, { height: 100 }]}
              value={value}
              onChangeText={onChange}
              placeholder="Notas importantes sobre el paciente..."
              multiline
              textAlignVertical="top"
              placeholderTextColor="#94a3b8"
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
            {route.params?.patient?.id ? "Actualizar" : "Crear"} Paciente
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
  photoSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoLabel: {
    marginTop: 10,
    color: "#64748b",
    fontSize: 14,
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
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderColor: '#cbd5e1',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: 'white',
  },
  dateButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#1e293b',
    flex: 1,
  },
});

export default PatientFormScreen;
