// src/components/MonthlyChart.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { useDataRefresh } from '../contexts/DataContext';

const screenWidth = Dimensions.get('window').width;

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    color: (opacity?: number) => string;
    strokeWidth: number;
  }[];
}

const WeeklyChart: React.FC = () => {
  const { session } = useAuth();
  const { refreshTrigger } = useDataRefresh();
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchWeeklyData();
    }
  }, [session, refreshTrigger]);

  const fetchWeeklyData = async () => {
    try {
      setLoading(true);
      
      const now = new Date();
      const currentDay = now.getDay(); // 0 = domingo, 1 = lunes, etc.
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - currentDay); // Ir al domingo de esta semana
      
      // Crear arrays para los 7 días de la semana
      const weekDays = [];
      const labels = [];
      const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        weekDays.push(date.toISOString().split('T')[0]);
        labels.push(dayNames[i]);
      }
      
      const startDate = weekDays[0];
      const endDate = weekDays[6];

      // Obtener citas de la semana
      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select('date')
        .eq('clinic_id', session?.user.id)
        .gte('date', startDate)
        .lte('date', endDate + 'T23:59:59');

      // Obtener ingresos de la semana
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('amount, payment_date')
        .eq('clinic_id', session?.user.id)
        .gte('payment_date', startDate)
        .lte('payment_date', endDate);

      const appointmentsPerDay = weekDays.map(date => {
        return appointmentsData?.filter(a => 
          a.date.startsWith(date)
        ).length || 0;
      });

      const revenuePerDay = weekDays.map(date => {
        return paymentsData?.filter(p => 
          p.payment_date.startsWith(date)
        ).reduce((sum, p) => sum + p.amount, 0) || 0;
      });

      // Normalizar ingresos (dividir por 100 para mejor visualización)
      const normalizedRevenue = revenuePerDay.map(r => Math.round(r / 100));
      setChartData({
        labels,
        datasets: [
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
        <Text style={styles.title}>Actividad de la semana actual</Text>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando gráfica...</Text>
        </View>
      </View>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Actividad de la semana actual</Text>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Gráfica disponible solo en móvil</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Actividad de la semana actual</Text>
      
      <LineChart
        data={chartData}
        width={screenWidth - 70}
        height={200}
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
    padding: 10,
    marginBottom: 20,
    marginHorizontal: 5,
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
    alignSelf: 'center',
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

export default WeeklyChart;