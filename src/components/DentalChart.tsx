// src/components/DentalChart.tsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Tooth } from '../components/Tooth';
import { useDentalRecords } from '../hooks/useDentalRecords';

const toothNumbers = [
  // Dientes permanentes adultos
  18, 17, 16, 15, 14, 13, 12, 11,
  21, 22, 23, 24, 25, 26, 27, 28,
  48, 47, 46, 45, 44, 43, 42, 41,
  31, 32, 33, 34, 35, 36, 37, 38,
];

export const DentalChart = ({ 
  patientId, 
  onToothPress 
}: { 
  patientId: string;
  onToothPress?: (toothNumber: number) => void;
}) => {
  const { records, loading } = useDentalRecords(patientId);
  
  const getToothConditions = (toothNumber: number) => {
    return records.filter(record => record.tooth_number === toothNumber);
  };

  return (
    <View style={styles.container}>
      {/* Arriba - Maxilar */}
      <View style={styles.upperJaw}>
        {toothNumbers.slice(0, 16).map((number) => (
          <Tooth 
            key={`upper-${number}`} 
            number={number} 
            conditions={getToothConditions(number)}
            onPress={() => onToothPress?.(number)}
          />
        ))}
      </View>
      
      {/* Abajo - Mandibular */}
      <View style={styles.lowerJaw}>
        {toothNumbers.slice(16).map((number) => (
          <Tooth 
            key={`lower-${number}`} 
            number={number} 
            conditions={getToothConditions(number)}
            onPress={() => onToothPress?.(number)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  upperJaw: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  lowerJaw: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
  },
});