// src/components/AppointmentCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Appointment } from '../types';

interface AppointmentCardProps {
  appointment: Appointment & { patient?: { full_name: string } };
  onPress: () => void;
  onDelete: () => void;
  onCancel: () => void;
  onComplete: () => void;
  onEdit: () => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ 
  appointment, 
  onPress, 
  onCancel, 
  onComplete, 
  onEdit 
}) => {
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

  const getStatusText = () => {
    switch (appointment.status) {
      case 'completed': return 'Completada';
      case 'canceled': return 'Cancelada';
      default: return 'Programada';
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
      
      <TouchableOpacity style={styles.mainContent} onPress={onPress}>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(appointment.date)}</Text>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.patientName}>
            {appointment.patient?.full_name || 'Paciente desconocido'}
          </Text>
          <Text style={styles.reasonText}>
            {appointment.reason || 'Consulta general'}
          </Text>
        </View>
      </TouchableOpacity>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]} 
          onPress={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          <MaterialIcons name="edit" size={16} color="#3b82f6" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.completeButton]} 
          onPress={(e) => {
            e.stopPropagation();
            onComplete();
          }}
        >
          <MaterialIcons name="check" size={16} color="#10b981" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.cancelButton]} 
          onPress={(e) => {
            e.stopPropagation();
            onCancel();
          }}
        >
          <MaterialIcons name="close" size={16} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
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
  mainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 10,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  editButton: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  completeButton: {
    backgroundColor: '#f0fdf4',
    borderColor: '#10b981',
  },
  cancelButton: {
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
  },
});

export default AppointmentCard;