// src/services/notificationService.ts
import * as Notifications from 'expo-notifications';
import { supabase } from './supabase';
import { Appointment } from '../types';
import { Patient } from '../types';
import { Platform } from 'react-native';

// Configurar notificaciones
Notifications.setNotificationHandler({
  handleNotification: async (): Promise<Notifications.NotificationBehavior> => ({
  shouldShowAlert: true,
  shouldPlaySound: true,
  shouldSetBadge: true,
  shouldShowBanner: true,
  shouldShowList: true,
}),
});

export const registerForPushNotifications = async (userId: string) => {
  try {
    // Verificar si estamos en Expo Go
    const isExpoGo = __DEV__ && !process.env.EXPO_STANDALONE_APP;
    
    if (isExpoGo) {
      console.log('Skipping push notifications in Expo Go - use development build for full functionality');
      return 'expo-go-mock-token';
    }
    
    // Solicitar permisos
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowAnnouncements: false,
        },
      });
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Push notification permissions not granted');
      return null;
    }
    
    console.log('Push notifications registered successfully');
    return 'local-notifications-enabled';
  } catch (error) {
    console.log('Push notifications not available in current environment');
    return null;
  }
};

export const scheduleAppointmentReminder = async (appointment: Appointment, patient: Patient) => {
  try {
    const now = new Date();
    const appointmentDate = new Date(appointment.date);
    const triggerTime = new Date(appointmentDate.getTime() - 60 * 60 * 1000); // 1 hora antes

    // Solo programar si la cita es en el futuro
    if (triggerTime.getTime() <= now.getTime()) {
      console.log('Appointment is too soon or in the past, skipping notification');
      return;
    }

    const secondsUntilTrigger = Math.floor((triggerTime.getTime() - now.getTime()) / 1000);

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Recordatorio de cita',
        body: `Tienes una cita con ${patient.full_name} en 1 hora.`,
        data: { appointmentId: appointment.id },
        sound: true,
      },
      trigger: {
        seconds: secondsUntilTrigger,
      },
    });
    
    console.log('Local notification scheduled with ID:', notificationId);
    return notificationId;
  } catch (error) {
    console.log('Notification scheduling not available in current environment');
    return null;
  }
};

export const cancelAppointmentReminder = async (notificationId: string) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log('Notification cancelled:', notificationId);
  } catch (error) {
    console.error('Error cancelling notification:', error);
  }
};

export const getAllScheduledNotifications = async () => {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log('Scheduled notifications:', notifications.length);
    return notifications;
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
};

