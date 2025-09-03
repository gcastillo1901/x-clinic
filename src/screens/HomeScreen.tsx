// src/screens/HomeScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { MaterialIcons } from "@expo/vector-icons";
import { supabase } from "../services/supabase";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Appointment } from "../types";
import { useDataRefresh } from "../contexts/DataContext";
import MonthlyChart from "../components/MonthlyChart";

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const { session, signOut } = useAuth();
  const { refreshTrigger } = useDataRefresh();
  const [stats, setStats] = useState({
    patients: 0,
    appointments: 0,
    revenue: 0,
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    (Appointment & { patient: { full_name: string } })[]
  >([]);
  const [userProfile, setUserProfile] = useState<{ full_name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchDashboardData();
    }
  }, [session, refreshTrigger]);

  useFocusEffect(
    React.useCallback(() => {
      if (session) {
        fetchDashboardData();
      }
    }, [session, refreshTrigger])
  );

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Obtener perfil del usuario
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', session?.user.id)
        .single();

      if (!profileError && profile) {
        setUserProfile(profile);
      }

      // Obtener estadísticas
      const { count: patients, error: patientsError } = await supabase
        .from("patients")
        .select("*", { count: "exact" })
        .eq("clinic_id", session?.user.id);


      const currentDate = new Date().toISOString();
      
      const { count: appointments, error: appointmentsError } = await supabase
        .from("appointments")
        .select("*", { count: "exact" })
        .eq("clinic_id", session?.user.id)
        .gte("date", currentDate);


      // Obtener todos los pagos del mes actual
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const { data: revenueData, error: revenueError } = await supabase
        .from("payments")
        .select("amount, payment_date")
        .eq("clinic_id", session?.user.id)
        .gte("payment_date", startOfMonth.toISOString().split('T')[0]);

      console.log('Revenue data:', revenueData);
      console.log('Revenue error:', revenueError);

      // Luego calcular la suma manualmente:
      const totalRevenue =
        revenueData?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
      
      console.log('Total revenue calculated:', totalRevenue);

      // Obtener próximas citas
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const { data: appointmentsData, error: appointmentsDataError } = await supabase
        .from("appointments")
        .select("*, patient:patients(full_name)")
        .eq("clinic_id", session?.user.id)
        .gte("date", currentDate)
        .lte("date", nextWeek.toISOString())
        .order("date", { ascending: true })
        .limit(5);


      setStats({
        patients: patients || 0,
        appointments: appointments || 0,
        revenue: totalRevenue || 0,
      });
      setUpcomingAppointments(appointmentsData || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: Date | string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const formatTime = (dateString: Date | string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro que deseas cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar Sesión",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
          } catch (error) {
            console.error("Logout failed:", error);
            Alert.alert("Error", "No se pudo cerrar sesión");
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.greeting}>
            {getGreeting()}{userProfile?.full_name ? `, ${userProfile.full_name}` : ''}
          </Text>
          <Text style={styles.title}>Panel Principal</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <MaterialIcons name="logout" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>

      {/* Estadísticas */}
      <View style={styles.statsContainer}>
        <StatCard
          icon="people"
          value={stats.patients}
          label="Pacientes"
          color="#3b82f6"
          onPress={() => navigation.navigate("PatientsScreen")}
        />
        <StatCard
          icon="event"
          value={stats.appointments}
          label="Citas próximas"
          color="#10b981"
          onPress={() => navigation.navigate("AppointmentsScreen")}
        />
        <StatCard
          icon="attach-money"
          value={`$${stats.revenue.toLocaleString()}`}
          label="Ingresos"
          color="#f59e0b"
          onPress={() => navigation.navigate("PaymentsScreen")}
        />
      </View>

      {/* Próximas citas */}
      <Text style={styles.sectionTitle}>Próximas Citas</Text>
      {upcomingAppointments.length > 0 ? (
        <View style={styles.appointmentsContainer}>
          {upcomingAppointments.map((appointment, index) => (
            <TouchableOpacity
              key={appointment.id}
              style={[
                styles.appointmentCard,
                index === upcomingAppointments.length - 1 && {
                  marginBottom: 0,
                },
              ]}
              onPress={() =>
                navigation.navigate("AppointmentFormScreen", { id: appointment.id })
              }
            >
              <View style={styles.appointmentTime}>
                <Text style={styles.dateText}>
                  {formatDate(appointment.date)}
                </Text>
                <Text style={styles.timeText}>
                  {formatTime(appointment.date)}
                </Text>
              </View>
              <View style={styles.appointmentInfo}>
                <Text style={styles.patientName}>
                  {appointment.patient.full_name}
                </Text>
                <Text style={styles.reasonText}>
                  {appointment.reason || "Consulta general"}
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#94a3b8" />
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <MaterialIcons name="event-available" size={40} color="#cbd5e1" />
          <Text style={styles.emptyText}>No hay citas próximas</Text>
        </View>
      )}

      {/* Gráfica mensual */}
      <MonthlyChart />
    </ScrollView>
  );
};

const StatCard = ({
  icon,
  value,
  label,
  color,
  onPress,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  value: number | string;
  label: string;
  color: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[
      styles.statCard,
      { backgroundColor: `${color}20`, borderColor: color },
    ]}
    onPress={onPress}
  >
    <View style={[styles.statIcon, { backgroundColor: color }]}>
      <MaterialIcons name={icon} size={20} color="white" />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  titleContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  statCard: {
    width: "30%",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#1e293b",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#1e293b",
  },
  appointmentsContainer: {
    marginBottom: 30,
  },
  appointmentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  appointmentTime: {
    marginRight: 15,
    alignItems: "center",
    minWidth: 80,
  },
  dateText: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 2,
  },
  timeText: {
    fontWeight: "bold",
    color: "#3b82f6",
    fontSize: 16,
  },
  appointmentInfo: {
    flex: 1,
  },
  patientName: {
    fontWeight: "bold",
    marginBottom: 5,
    color: "#1e293b",
  },
  reasonText: {
    color: "#64748b",
    fontSize: 12,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: "white",
    borderRadius: 10,
  },
  emptyText: {
    marginTop: 10,
    color: "#94a3b8",
    fontSize: 16,
  },
});

export default HomeScreen;
