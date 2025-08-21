// src/screens/LoadingScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
       <Image 
                 source={require('../../assets/X-CLINIC.png')} 
                 style={styles.logo}
                 resizeMode="contain"
               />
        <Text style={styles.title}>X-Clinic</Text>
        <Text style={styles.subtitle}>Cargando aplicación...</Text>
      </View>
      <ActivityIndicator size="large" color="#3b82f6" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginTop: 5,
  },
});

export default LoadingScreen;