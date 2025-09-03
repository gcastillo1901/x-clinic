// src/screens/PaymentsScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import PaymentCard from '../components/PaymentCard';
import DateRangePicker from '../components/DateRangePicker';
import { Payment } from '../types';
import { useDataRefresh } from '../contexts/DataContext';
import { useFocusEffect } from '@react-navigation/native';

const PaymentsScreen = ({ navigation }: {navigation: any;}) => {
  const { session } = useAuth();
  const { refreshTrigger } = useDataRefresh();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(1)), // Primer día del mes
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), // Último día del mes
  });
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    if (session) {
      fetchPayments();
    }
  }, [session, dateRange, refreshTrigger]);

  useFocusEffect(
    React.useCallback(() => {
      if (session) {
        fetchPayments();
      }
    }, [session, dateRange, refreshTrigger])
  );

  const fetchPayments = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching payments with date range:', {
        start: dateRange.startDate.toISOString().split('T')[0],
        end: dateRange.endDate.toISOString().split('T')[0]
      });
      
      const { data, error } = await supabase
        .from('payments')
        .select('*, patient:patients(full_name), appointment:appointments(date)')
        .eq('clinic_id', session?.user.id)
        .gte('payment_date', dateRange.startDate.toISOString().split('T')[0])
        .lte('payment_date', dateRange.endDate.toISOString().split('T')[0])
        .order('payment_date', { ascending: false });

      console.log('Payments data:', data);
      console.log('Payments error:', error);

      if (error) throw error;

      setPayments(data || []);

      // Calcular total de ingresos manualmente
      const totalSum = (data || []).reduce((sum, payment) => sum + (payment.amount || 0), 0);
      setTotalRevenue(totalSum);
      
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = () => {
    navigation.navigate('PaymentForm');
  };

  const formatDateRange = () => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' } as Intl.DateTimeFormatOptions;;
    return `${dateRange.startDate.toLocaleDateString('es-ES', options)} - ${dateRange.endDate.toLocaleDateString('es-ES', options)}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pagos</Text>
        <Text style={styles.dateRange}>{formatDateRange()}</Text>
        <Text style={styles.revenue}>Total: ${totalRevenue.toLocaleString()}</Text>
      </View>

      <DateRangePicker 
        dateRange={dateRange}
        onChange={setDateRange}
      />

      {loading && payments.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={payments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PaymentCard 
              payment={item} 
              onPress={() => navigation.navigate('PaymentDetail', { id: item.id })}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="attach-money" size={50} color="#cbd5e1" />
              <Text style={styles.emptyText}>No hay pagos registrados</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity style={styles.addButton} onPress={handleAddPayment}>
        <MaterialIcons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 5,
  },
  dateRange: {
    color: '#64748b',
    fontSize: 14,
    marginBottom: 5,
  },
  revenue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  emptyText: {
    marginTop: 15,
    color: '#94a3b8',
    fontSize: 16,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
});

export default PaymentsScreen;