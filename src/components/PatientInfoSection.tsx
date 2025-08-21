// src/components/PatientInfoSection.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Patient } from '../types';

interface PatientInfoSectionProps {
  patient: Patient;
}

const PatientInfoSection: React.FC<PatientInfoSectionProps> = ({ patient }) => {
  const getAge = (birthDate?: string) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información Básica</Text>
        
        <View style={styles.infoRow}>
          <MaterialIcons name="person" size={20} color="#64748b" style={styles.icon} />
          <Text style={styles.infoText}>{patient.full_name}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <MaterialIcons name="cake" size={20} color="#64748b" style={styles.icon} />
          <Text style={styles.infoText}>
            {patient.birth_date ? `${getAge(patient.birth_date)} años` : 'Edad no especificada'}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <MaterialIcons name="male" size={20} color="#64748b" style={styles.icon} />
          <Text style={styles.infoText}>
            {patient.gender === 'male' ? 'Masculino' : 
             patient.gender === 'female' ? 'Femenino' : 'No especificado'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contacto</Text>
        
        <View style={styles.infoRow}>
          <MaterialIcons name="phone" size={20} color="#64748b" style={styles.icon} />
          <Text style={styles.infoText}>{patient.phone}</Text>
        </View>
        
        {patient.email && (
          <View style={styles.infoRow}>
            <MaterialIcons name="email" size={20} color="#64748b" style={styles.icon} />
            <Text style={styles.infoText}>{patient.email}</Text>
          </View>
        )}
        
        {patient.address && (
          <View style={styles.infoRow}>
            <MaterialIcons name="home" size={20} color="#64748b" style={styles.icon} />
            <Text style={styles.infoText}>{patient.address}</Text>
          </View>
        )}
      </View>

      {patient.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notas</Text>
          <Text style={styles.notesText}>{patient.notes}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1e293b',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    marginRight: 15,
    width: 20,
  },
  infoText: {
    flex: 1,
    color: '#334155',
  },
  notesText: {
    color: '#64748b',
    lineHeight: 22,
  },
});

export default PatientInfoSection;