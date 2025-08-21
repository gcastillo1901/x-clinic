// src/components/AppointmentCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Appointment } from '../types';

interface AppointmentCardProps {
  appointment: Appointment & { patient?: { full_name: string } };
  onPress: () => void;
  onDelete: () => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, onPress }) => {
  const formatTime = (dateString: string|Date) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = () => {
    switch (appointment.status) {
      case 'completed': return '#10b981';
      case 'canceled': return '#ef4444';
      default: return '#3b82f6';
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
      
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{formatTime(appointment.date)}</Text>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.patientName}>
          {appointment.patient?.full_name || 'Paciente desconocido'}
        </Text>
        <Text style={styles.reasonText}>
          {appointment.reason || 'Consulta general'}
        </Text>
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
  statusIndicator: {
    width: 8,
    height: 50,
    borderRadius: 4,
    marginRight: 15,
  },
  timeContainer: {
    marginRight: 15,
    alignItems: 'center',
  },
  timeText: {
    fontWeight: 'bold',
    color: '#3b82f6',
    fontSize: 16,
  },
  infoContainer: {
    flex: 1,
  },
  patientName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
    color: '#1e293b',
  },
  reasonText: {
    fontSize: 14,
    color: '#64748b',
  },
});

export default AppointmentCard;