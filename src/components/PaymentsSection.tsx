// src/components/PaymentsSection.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../services/supabase';
import { Payment } from '../types';
import { ActivityIndicator } from 'react-native-paper';

interface PaymentsSectionProps {
  patientId: string;
  onAddPayment: () => void;
}

const PaymentsSection: React.FC<PaymentsSectionProps> = ({ 
  patientId, 
  onAddPayment 
}) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchPayments();
  }, [patientId]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('patient_id', patientId)
        .order('payment_date', { ascending: false });

      if (error) throw error;

      setPayments(data || []);

      // Calcular total
      const { data: sumData } = await supabase
  .from('payments')
  .select('sum(amount)', { head: false })
  .eq('patient_id', patientId);

const sum = Array.isArray(sumData) && sumData.length > 0
  ? Number(sumData[0].sum) || 0
  : 0;

setTotal(sum);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const formatPaymentMethod = (method: string) => {
    switch (method) {
      case 'cash': return 'Efectivo';
      case 'credit_card': return 'Tarjeta Crédito';
      case 'debit_card': return 'Tarjeta Débito';
      case 'transfer': return 'Transferencia';
      default: return method;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Historial de Pagos</Text>
          <Text style={styles.totalText}>Total: ${total.toFixed(2)}</Text>
        </View>
        <TouchableOpacity onPress={onAddPayment}>
          <MaterialIcons name="add" size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      {loading && payments.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" />
        </View>
      ) : (
        <FlatList
          data={payments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.paymentItem}>
              <View style={styles.paymentHeader}>
                <Text style={styles.paymentAmount}>${item.amount.toFixed(2)}</Text>
                <Text style={styles.paymentDate}>{formatDate(item.payment_date)}</Text>
              </View>
              <Text style={styles.paymentMethod}>
                {formatPaymentMethod(item.payment_method)}
              </Text>
              {item.notes && (
                <Text style={styles.notesText}>{item.notes}</Text>
              )}
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay pagos registrados</Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  totalText: {
    color: '#10b981',
    fontSize: 14,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  paymentItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  paymentAmount: {
    fontWeight: 'bold',
    color: '#10b981',
  },
  paymentDate: {
    color: '#64748b',
    fontSize: 12,
  },
  paymentMethod: {
    color: '#3b82f6',
    marginBottom: 5,
  },
  notesText: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 20,
  },
  emptyText: {
    color: '#94a3b8',
    textAlign: 'center',
    padding: 20,
  },
});

export default PaymentsSection;