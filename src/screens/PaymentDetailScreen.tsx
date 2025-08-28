// src/screens/PaymentDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { Payment } from '../types';

interface PaymentDetailScreenProps {
  route: { params: { id: string } };
  navigation: any;
}

const PaymentDetailScreen: React.FC<PaymentDetailScreenProps> = ({ route, navigation }) => {
  const { id } = route.params;
  const { session } = useAuth();
  const [payment, setPayment] = useState<Payment & { patient?: { full_name: string }, appointment?: { date: string, reason: string } } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayment();
  }, [id]);

  const fetchPayment = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          patient:patients(full_name),
          appointment:appointments(date, reason)
        `)
        .eq('id', id)
        .eq('clinic_id', session?.user.id)
        .single();

      if (error) throw error;
      setPayment(data);
    } catch (error) {
      console.error('Error fetching payment:', error);
      Alert.alert('Error', 'No se pudo cargar el pago');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('PaymentForm', { payment });
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que quieres eliminar este pago?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: deletePayment }
      ]
    );
  };

  const deletePayment = async () => {
    try {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      Alert.alert('Éxito', 'Pago eliminado correctamente');
      navigation.goBack();
    } catch (error) {
      console.error('Error deleting payment:', error);
      Alert.alert('Error', 'No se pudo eliminar el pago');
    }
  };

  const getCurrencySymbol = (currency: string) => {
    return currency === 'USD' ? '$' : 'C$';
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods = {
      'cash': 'Efectivo',
      'debit_card': 'Tarjeta de débito',
      'credit_card': 'Tarjeta de crédito',
      'transfer': 'Transferencia'
    };
    return methods[method as keyof typeof methods] || method;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!payment) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Pago no encontrado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#3b82f6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle del Pago</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleEdit} style={styles.actionButton}>
            <MaterialIcons name="edit" size={24} color="#3b82f6" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
            <MaterialIcons name="delete" size={24} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <View style={styles.amountSection}>
            <Text style={styles.amountLabel}>Monto</Text>
            <Text style={styles.amountValue}>
              {getCurrencySymbol(payment.currency)}{payment.amount.toLocaleString()}
            </Text>
            <Text style={styles.currencyLabel}>
              {payment.currency === 'USD' ? 'Dólares' : 'Córdobas'}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.infoRow}>
            <MaterialIcons name="person" size={20} color="#64748b" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Paciente</Text>
              <Text style={styles.infoValue}>
                {payment.patient?.full_name || 'No especificado'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="payment" size={20} color="#64748b" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Método de pago</Text>
              <Text style={styles.infoValue}>
                {getPaymentMethodLabel(payment.payment_method)}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="calendar-today" size={20} color="#64748b" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Fecha de pago</Text>
              <Text style={styles.infoValue}>
                {new Date(payment.payment_date).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </View>
          </View>

          {payment.appointment && (
            <View style={styles.infoRow}>
              <MaterialIcons name="event" size={20} color="#64748b" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Cita asociada</Text>
                <Text style={styles.infoValue}>
                  {new Date(payment.appointment.date).toLocaleDateString('es-ES')}
                </Text>
                {payment.appointment.reason && (
                  <Text style={styles.infoSubValue}>
                    {payment.appointment.reason}
                  </Text>
                )}
              </View>
            </View>
          )}

          {payment.notes && (
            <View style={styles.infoRow}>
              <MaterialIcons name="note" size={20} color="#64748b" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Notas</Text>
                <Text style={styles.infoValue}>{payment.notes}</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 15,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  amountSection: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  amountLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 5,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 5,
  },
  currencyLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  infoContent: {
    flex: 1,
    marginLeft: 15,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  infoSubValue: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
});

export default PaymentDetailScreen;