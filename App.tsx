// src/App.tsx
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from 'styled-components/native';
import { LogBox } from 'react-native';
import * as Notifications from 'expo-notifications';
import { AuthProvider } from './src/contexts/AuthContext';
import { DataProvider } from './src/contexts/DataContext';
import { AppNavigator } from './src/navigation/index';
import ErrorBoundary from './src/components/ErrorBoundary';

// Suprimir warnings mientras mantenemos funcionalidad
LogBox.ignoreLogs([
  'VirtualizedLists should never be nested inside plain ScrollViews',
  'expo-notifications',
  'Push notifications',
  'Remote notifications',
  'Invalid Refresh Token',
  'refresh_token_not_found',
  'VirtualizedList: You have a large list',
]);

// Definición del tema (opcional)
const theme = {
  colors: {
    primary: '#3b82f6',
    secondary: '#10b981',
    danger: '#ef4444',
    background: '#f8fafc',
    text: '#1e293b',
    muted: '#64748b',
    border: '#e2e8f0',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
};

const App = () => {
  useEffect(() => {
    // Configurar el listener para notificaciones recibidas
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Configurar el listener para cuando el usuario toca una notificación
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      // Aquí puedes navegar a la pantalla específica de la cita
      const appointmentId = response.notification.request.content.data?.appointmentId;
      if (appointmentId) {
        console.log('Navigate to appointment:', appointmentId);
      }
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider theme={theme}>
          <AuthProvider>
            <DataProvider>
              <NavigationContainer>
                <StatusBar style="auto" />
                <AppNavigator />
              </NavigationContainer>
            </DataProvider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
};

export default App;