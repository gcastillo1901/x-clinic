// src/hooks/useOfflineSync.ts
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from '../services/supabase';

export const useOfflineSync = () => {
  const { session } = useAuth();
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSyncs, setPendingSyncs] = useState<(() => Promise<void>)[]>([]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
      
      if (state.isConnected) {
        processPendingSyncs();
      }
    });

    return () => unsubscribe();
  }, []);

  const processPendingSyncs = async () => {
    if (!session || pendingSyncs.length === 0) return;
    
    try {
      for (const syncOperation of pendingSyncs) {
        await syncOperation();
      }
      
      setPendingSyncs([]);
    } catch (error) {
      console.error('Error during sync:', error);
    }
  };

  const addSyncOperation = (operation: () => Promise<void>) => {
    if (isOnline) {
      return operation();
    } else {
      setPendingSyncs(prev => [...prev, operation]);
      return Promise.resolve();
    }
  };

  return { isOnline, addSyncOperation };
};