// src/components/PaymentCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Payment } from '../types';

interface PaymentCardProps {
  payment: Payment & { patient?: { full_name: string } };
  onPress: () => void;
}

const PaymentCard: React.FC<PaymentCardProps> = ({ payment, onPress }) => {
  const formatDate = (dateString: string) => {
    // Extraer solo la parte de fecha para evitar problemas de timezone
    const dateOnly = dateString.split('T')[0];
    const [year, month, day] = dateOnly.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const getPaymentMethodIcon = () => {
    switch (payment.payment_method) {
      case 'cash': return 'attach-money';
      case 'credit_card': return 'credit-card';
      case 'debit_card': return 'credit-card';
      case 'transfer': return 'account-balance';
      default: return 'payment';
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.iconContainer}>
        <MaterialIcons 
          name={getPaymentMethodIcon()} 
          size={24} 
          color="#3b82f6" 
        />
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.patientName}>
          {payment.patient?.full_name || 'Paciente desconocido'}
        </Text>
        <Text style={styles.paymentMethod}>
          {payment.payment_method === 'cash' ? 'Efectivo' : 
           payment.payment_method === 'credit_card' ? 'Tarjeta Crédito' :
           payment.payment_method === 'debit_card' ? 'Tarjeta Débito' : 'Transferencia'}
        </Text>
      </View>
      
      <View style={styles.amountContainer}>
        <Text style={styles.amountText}>${payment.amount.toFixed(2)}</Text>
        <Text style={styles.dateText}>{formatDate(payment.payment_date)}</Text>
      </View>
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
  iconContainer: {
    marginRight: 15,
  },
  infoContainer: {
    flex: 1,
  },
  patientName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 3,
    color: '#1e293b',
  },
  paymentMethod: {
    fontSize: 14,
    color: '#64748b',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#10b981',
    marginBottom: 3,
  },
  dateText: {
    fontSize: 12,
    color: '#94a3b8',
  },
});

export default PaymentCard;