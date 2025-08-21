// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, resetPassword } = useAuth();

  const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert('Error', 'Por favor ingresa email y contraseña');
    return;
  }

  try {
    setLoading(true);
    await signIn(email, password); 
    Alert.alert('Éxito', 'Has iniciado sesión correctamente');
  } catch (error) {
    console.error('Login error:', error);
    
    let errorMessage = 'Error al iniciar sesión';
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Credenciales incorrectas';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Por favor verifica tu email primero';
      }
    }
    
    Alert.alert('Error', errorMessage);
  } finally {
    setLoading(false);
  }
};


  const handlePasswordReset = async () => {
    if (!email) {
      Alert.alert('Error', 'Por favor ingresa tu email');
      return;
    }

    try {
      setLoading(true);
      await resetPassword(email);
      Alert.alert('Éxito', 'Se ha enviado un enlace para restablecer tu contraseña');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Error al restablecer contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/dra.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>X-Clinic</Text>
        <Text style={styles.subtitle}>Gestión de Expedientes</Text>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Cargando...' : 'Iniciar Sesión'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.forgotPassword} 
          onPress={handlePasswordReset}
          disabled={loading}
        >
          <Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  formContainer: {
    width: '100%',
  },
  input: {
    height: 50,
    borderColor: '#cbd5e1',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: 'white',
  },
  loginButton: {
    height: 50,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  forgotPassword: {
    marginTop: 15,
    alignSelf: 'center',
  },
  linkText: {
    color: '#3b82f6',
    fontSize: 14,
  },
});

export default LoginScreen;