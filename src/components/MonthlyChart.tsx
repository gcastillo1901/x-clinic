// src/components/MonthlyChart.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';

const screenWidth = Dimensions.get('window').width;

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    color: (opacity?: number) => string;
    strokeWidth: number;
  }[];
}

const MonthlyChart: React.FC = () => {
  const { session } = useAuth();
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchMonthlyData();
    }
  }, [session]);

  const fetchMonthlyData = async () => {
    try {
      setLoading(true);
      
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      
      // Crear arrays para todos los días del mes actual
      const monthDays = [];
      const labels = [];
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        monthDays.push(date.toISOString().split('T')[0]);
        labels.push(day.toString());
      }
      
      const startOfMonth = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
      const endOfMonth = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

      // Obtener pacientes nuevos del mes
      const { data: patientsData } = await supabase
        .from('patients')
        .select('created_at')
        .eq('clinic_id', session?.user.id)
        .gte('created_at', startOfMonth)
        .lte('created_at', endOfMonth + 'T23:59:59');

      // Obtener citas del mes
      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select('date')
        .eq('clinic_id', session?.user.id)
        .gte('date', startOfMonth)
        .lte('date', endOfMonth + 'T23:59:59');

      // Obtener ingresos del mes
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('amount, payment_date')
        .eq('clinic_id', session?.user.id)
        .gte('payment_date', startOfMonth)
        .lte('payment_date', endOfMonth);

      // Procesar datos por día del mes
      const newPatientsPerDay = monthDays.map(date => {
        return patientsData?.filter(p => 
          p.created_at.startsWith(date)
        ).length || 0;
      });

      const appointmentsPerDay = monthDays.map(date => {
        return appointmentsData?.filter(a => 
          a.date.startsWith(date)
        ).length || 0;
      });

      const revenuePerDay = monthDays.map(date => {
        return paymentsData?.filter(p => 
          p.payment_date.startsWith(date)
        ).reduce((sum, p) => sum + p.amount, 0) || 0;
      });

      console.log('New Patients Per Day:', newPatientsPerDay);
      console.log('Appointments Per Day:', appointmentsPerDay);
      console.log('Revenue Per Day:', revenuePerDay);

      // Normalizar ingresos (dividir por 100 para mejor visualización)
      const normalizedRevenue = revenuePerDay.map(r => Math.round(r / 100));
      setChartData({
        labels,
        datasets: [
          {
            data: newPatientsPerDay,
            color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // Azul
            strokeWidth: 2,
          },
          {
            data: appointmentsPerDay,
            color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Verde
            strokeWidth: 2,
          },
          {
            data: normalizedRevenue,
            color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`, // Amarillo
            strokeWidth: 2,
          },
        ],
      });
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !chartData) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Actividad del mes actual</Text>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando gráfica...</Text>
        </View>
      </View>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Actividad del mes actual</Text>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Gráfica disponible solo en móvil</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Actividad del mes actual</Text>
      
      <LineChart
        data={chartData}
        width={screenWidth - 40}
        height={220}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '4',
            strokeWidth: '2',
          },
        }}
        bezier
        style={styles.chart}
      />
      
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#3b82f6' }]} />
          <Text style={styles.legendText}>Pacientes nuevos</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#10b981' }]} />
          <Text style={styles.legendText}>Citas del día</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#f59e0b' }]} />
          <Text style={styles.legendText}>Ingresos (x100)</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1e293b',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#64748b',
  },
  loadingContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 14,
  },
});

export default MonthlyChart;