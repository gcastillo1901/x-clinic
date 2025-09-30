// src/components/DisabledPatientField.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface DisabledPatientFieldProps {
  patientName: string;
}

const DisabledPatientField: React.FC<DisabledPatientFieldProps> = ({ patientName }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.patientName}>{patientName}</Text>
      <MaterialIcons name="lock" size={20} color="#94a3b8" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 15,
    height: 50,
  },
  patientName: {
    fontSize: 16,
    color: '#64748b',
    flex: 1,
  },
});

export default DisabledPatientField;