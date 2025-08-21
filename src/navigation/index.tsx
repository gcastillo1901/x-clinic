// src/navigation/index.tsx
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "../contexts/AuthContext";

// Importar pantallas
import HomeScreen from "../screens/HomeScreen";
import PatientsScreen from "../screens/PatientsScreen";
import AppointmentsScreen from "../screens/AppointmentsScreen";
import DentalChartScreen from "../screens/DentalChartScreen";
import PaymentsScreen from "../screens/PaymentsScreen";
import LoginScreen from "../screens/LoginScreen";
import PatientDetailScreen from "../screens/PatientDetailScreen";
import LoadingScreen from "../screens/LoadingScreen";
import AppointmentFormScreen from "../screens/AppointmentFormScreen";
import PatientFormScreen from "../screens/PatientFormScreen";
import DentalRecordFormScreen from "../screens/DentalRecordFormScreen";
import PaymentFormScreen from "../screens/PaymentFormScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ title: "Inicio" }}
      />
      <Tab.Screen
        name="PatientsTab"
        component={PatientsScreen}
        options={{ title: "Pacientes" }}
      />
      <Tab.Screen
        name="AppointmentsTab"
        component={AppointmentsScreen}
        options={{ title: "Citas" }}
      />
      <Tab.Screen
        name="DentalChartTab"
        component={DentalChartScreen}
        options={{ title: "Odontograma" }}
      />
      <Tab.Screen
        name="PaymentsTab"
        component={PaymentsScreen}
        options={{ title: "Pagos" }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator>
      {!session ? (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      ) : (
        <>
          <Stack.Screen
            name="Main"
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="PatientDetail"
            component={PatientDetailScreen as any}
            options={{ title: "Detalle del Paciente" }}
          />
          <Stack.Screen
            name="AppointmentForm"
            component={AppointmentFormScreen}
            options={{ title: "Gestión de Cita" }}
          />
          <Stack.Screen
            name="PatientForm"
            component={PatientFormScreen}
            options={{ title: "Formulario de Paciente" }}
          />
          <Stack.Screen
            name="DentalRecordForm"
            component={DentalRecordFormScreen}
          />
          <Stack.Screen
            name="DentalChart"
            component={DentalChartScreen}
            options={{ title: "Odontograma" }}
          />
          <Stack.Screen
            name="Payments"
            component={PaymentsScreen}
            options={{ title: "Pagos" }}
          />
          <Stack.Screen
            name="HomeScreen"
            component={HomeScreen}
            options={{ title: "Panel Principal" }}
          />
          <Stack.Screen
            name="PatientsScreen"
            component={PatientsScreen}
            options={{ title: "Pacientes" }}
          />
          <Stack.Screen
            name="AppointmentsScreen"
            component={AppointmentsScreen}
            options={{ title: "Citas" }}
          />
          <Stack.Screen
            name="PaymentsScreen"
            component={PaymentsScreen}
            options={{ title: "Pagos" }}
          />
          <Stack.Screen
            name="DentalChartScreen"
            component={DentalChartScreen}
            options={{ title: "Odontograma" }}
          />
          <Stack.Screen
            name="DentalRecordFormScreen"
            component={DentalRecordFormScreen}
            options={{ title: "Registro Dental" }}
          />
          <Stack.Screen name="PaymentForm" component={PaymentFormScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};
