// src/services/notificationService.ts
import * as Notifications from 'expo-notifications';
import { supabase } from './supabase';
import { Appointment } from '../types';
import { Patient } from '../types';

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
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    return null;
  }
  
  const tokenData = await Notifications.getExpoPushTokenAsync();
  const token = tokenData.data;
  
  // Guardar el token en Supabase
  const { error } = await supabase
    .from('user_push_tokens')
    .upsert({
      user_id: userId,
      expo_push_token: token,
      updated_at: new Date().toISOString(),
    });
  
  if (error) {
    console.error('Error saving push token:', error);
    return null;
  }
  
  return token;
};

export const scheduleAppointmentReminder = async (appointment: Appointment, patient: Patient) => {
  const now = new Date();
  const triggerTime = new Date(appointment.date);
  triggerTime.setHours(triggerTime.getHours() - 1); // Notificar 1 hora antes

  const secondsUntilTrigger = Math.max(1, Math.floor((triggerTime.getTime() - now.getTime()) / 1000));

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Recordatorio de cita',
      body: `Tienes una cita con ${patient.full_name} en 1 hora.`,
      data: { appointmentId: appointment.id },
    },
    trigger: secondsUntilTrigger as any,
  });
};

