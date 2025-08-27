// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { Session } from '@supabase/supabase-js';
import { registerForPushNotifications } from '../services/notificationService';

type AuthContextType = {
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.log('Session error:', error.message);
          // Si hay error de refresh token, limpiar sesión
          if (error.message.includes('refresh_token_not_found') || error.message.includes('Invalid Refresh Token')) {
            await supabase.auth.signOut();
          }
        }
        
        setSession(session);
      } catch (error) {
        console.error('Auth initialization error:', error);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      setSession(session);
      setLoading(false);
      
      // Registrar notificaciones cuando el usuario inicia sesión
      if (event === 'SIGNED_IN' && session?.user?.id) {
        try {
          await registerForPushNotifications(session.user.id);
        } catch (error) {
          console.error('Error registering push notifications:', error);
        }
      }
      
      // Manejar errores de token
      if (event === 'TOKEN_REFRESHED' && !session) {
        console.log('Token refresh failed, signing out');
        await supabase.auth.signOut();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log('Attempting to sign out...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('SignOut error:', error);
        // Forzar limpieza local si hay error
        setSession(null);
      }
      console.log('Sign out successful');
    } catch (error) {
      console.error('Error in signOut:', error);
      // Forzar limpieza local en caso de error
      setSession(null);
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  };

  const isAdmin = session?.user?.user_metadata?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        isAdmin,
        signIn,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);