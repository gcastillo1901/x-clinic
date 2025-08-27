// src/contexts/DataContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from './AuthContext';

type DataContextType = {
  refreshTrigger: number;
  triggerRefresh: () => void;
};

const DataContext = createContext<DataContextType>({} as DataContextType);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const { session } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    if (!session?.user?.id) return;

    const clinicId = session.user.id;

    // Suscribirse a cambios en appointments
    const appointmentsChannel = supabase
      .channel('appointments_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'appointments',
          filter: `clinic_id=eq.${clinicId}`
        }, 
        () => {
          console.log('Appointments changed, triggering refresh');
          triggerRefresh();
        }
      )
      .subscribe();

    // Suscribirse a cambios en patients
    const patientsChannel = supabase
      .channel('patients_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'patients',
          filter: `clinic_id=eq.${clinicId}`
        }, 
        () => {
          console.log('Patients changed, triggering refresh');
          triggerRefresh();
        }
      )
      .subscribe();

    // Suscribirse a cambios en payments
    const paymentsChannel = supabase
      .channel('payments_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'payments',
          filter: `clinic_id=eq.${clinicId}`
        }, 
        () => {
          console.log('Payments changed, triggering refresh');
          triggerRefresh();
        }
      )
      .subscribe();

    // Suscribirse a cambios en dental_records
    const dentalRecordsChannel = supabase
      .channel('dental_records_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'dental_records',
          filter: `clinic_id=eq.${clinicId}`
        }, 
        () => {
          console.log('Dental records changed, triggering refresh');
          triggerRefresh();
        }
      )
      .subscribe();

    return () => {
      appointmentsChannel.unsubscribe();
      patientsChannel.unsubscribe();
      paymentsChannel.unsubscribe();
      dentalRecordsChannel.unsubscribe();
    };
  }, [session?.user?.id]);

  return (
    <DataContext.Provider value={{ refreshTrigger, triggerRefresh }}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataRefresh = () => useContext(DataContext);