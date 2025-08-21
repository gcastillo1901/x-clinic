// src/components/PatientPicker.tsx
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface PatientPickerProps {
  patients: Array<{ id: string; full_name: string }>;
  selectedValue: string;
  onValueChange: (value: string) => void;
}

const PatientPicker: React.FC<PatientPickerProps> = ({ 
  patients, 
  selectedValue, 
  onValueChange 
}) => {
  return (
    <View style={styles.container}>
      <Picker
        selectedValue={selectedValue}
        onValueChange={onValueChange}
        style={styles.picker}
        itemStyle={Platform.OS === 'ios' ? styles.pickerItem : undefined}
      >
        <Picker.Item label="Seleccione un paciente..." value="" />
        {patients.map(patient => (
          <Picker.Item 
            key={patient.id} 
            label={patient.full_name} 
            value={patient.id} 
          />
        ))}
      </Picker>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
});

export default PatientPicker;