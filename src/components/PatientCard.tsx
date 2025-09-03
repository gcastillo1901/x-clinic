// src/components/PatientCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Patient } from '../types';

interface PatientCardProps {
  patient: Patient;
  onPress: () => void;
}

const PatientCard: React.FC<PatientCardProps> = ({ patient, onPress }) => {
  const getInitials = (name: string) => {
    if (!name || typeof name !== 'string') return 'N/A';
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
  };

  if (!patient || !patient.full_name) {
    return null;
  }

  const cleanName = String(patient.full_name || '').trim() || 'Sin nombre';
  const cleanPhone = String(patient.phone || '').trim() || 'Sin teléfono';
  const cleanEmail = patient.email ? String(patient.email).trim() : '';

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{getInitials(cleanName)}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{cleanName}</Text>
        <Text style={styles.phone}>{cleanPhone}</Text>
        {cleanEmail ? <Text style={styles.email}>{cleanEmail}</Text> : null}
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#94a3b8" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 3,
    color: '#1e293b',
  },
  phone: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 3,
  },
  email: {
    fontSize: 12,
    color: '#94a3b8',
  },
});

export default PatientCard;