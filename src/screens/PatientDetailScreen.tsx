// src/screens/PatientDetailScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../services/supabase";
import PatientInfoSection from "../components/PatientInfoSection";
import AppointmentSection from "../components/AppointmentSection";
import DentalRecordsSection from "../components/DentalRecordsSection";
import PaymentsSection from "../components/PaymentsSection";
import { ActivityIndicator } from "react-native-paper";
import { Patient } from "../types";
import { useDataRefresh } from '../contexts/DataContext';
import { useFocusEffect } from '@react-navigation/native';

const PatientDetailScreen = ({
  route,
  navigation,
}: {
  route: { params: { patientId: string } };
  navigation: any;
}) => {
  const { patientId } = route.params;
  const { session } = useAuth();
  const { refreshTrigger } = useDataRefresh();
  const [patient, setPatient] = useState<Patient>();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info");

  useEffect(() => {
    fetchPatient();
  }, [patientId, refreshTrigger]);

  useFocusEffect(
    React.useCallback(() => {
      fetchPatient();
    }, [patientId, refreshTrigger])
  );

  const fetchPatient = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("id", patientId)
        .single();

      if (error) throw error;

      setPatient(data);
    } catch (error) {
      console.error("Error fetching patient:", error);
      Alert.alert("Error", "No se pudo cargar la información del paciente");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate("PatientForm", { patient });
  };

  if (loading || !patient) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#3b82f6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{patient.full_name}</Text>
        <TouchableOpacity onPress={handleEdit}>
          <MaterialIcons name="edit" size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "info" && styles.activeTab]}
          onPress={() => setActiveTab("info")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "info" && styles.activeTabText,
            ]}
          >
            Información
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "appointments" && styles.activeTab]}
          onPress={() => setActiveTab("appointments")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "appointments" && styles.activeTabText,
            ]}
          >
            Citas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "dental" && styles.activeTab]}
          onPress={() => setActiveTab("dental")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "dental" && styles.activeTabText,
            ]}
          >
            Dental
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "payments" && styles.activeTab]}
          onPress={() => setActiveTab("payments")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "payments" && styles.activeTabText,
            ]}
          >
            Pagos
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "info" && <PatientInfoSection patient={patient} />}
        {activeTab === "appointments" && (
          <AppointmentSection
            patientId={patientId}
            onAddAppointment={() =>
              navigation.navigate("AppointmentForm", { patientId })
            }
          />
        )}
        {activeTab === "dental" && (
          <DentalRecordsSection
            patientId={patientId}
            onAddRecord={() =>
              navigation.navigate("DentalRecordForm", { patientId })
            }
          />
        )}
        {activeTab === "payments" && (
          <PaymentsSection
            patientId={patientId}
            onAddPayment={() =>
              navigation.navigate("PaymentForm", { patientId })
            }
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  tab: {
    flex: 1,
    padding: 15,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#3b82f6",
  },
  tabText: {
    color: "#64748b",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#3b82f6",
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 15,
  },
});

export default PatientDetailScreen;
