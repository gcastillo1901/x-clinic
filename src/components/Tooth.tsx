// src/components/Tooth.tsx (versión mejorada)
import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

type ToothCondition = {
  condition: string;
  treatment_date: string;
  notes?: string;
};

type ToothProps = {
  number: number;
  conditions: ToothCondition[];
  onPress: (toothNumber: number) => void;
  size?: 'small' | 'medium' | 'large';
};

const CONDITION_COLORS: Record<string, string> = {
  'caries': '#a52a2a',
  'restoration': '#ffd700',
  'extraction': '#000000',
  'root_canal': '#800080',
  'crown': '#c0c0c0',
  'healthy': '#90ee90',
  'impacted': '#696969',
  'missing': '#ffffff',
};

const TOOTH_NAMES: Record<number, string> = {
  11: 'Incisivo Central Sup. Derecho',
  12: 'Incisivo Lateral Sup. Derecho',
  13: 'Canino Sup. Derecho',
  14: 'Primer Premolar Sup. Derecho',
  15: 'Segundo Premolar Sup. Derecho',
  16: 'Primer Molar Sup. Derecho',
  17: 'Segundo Molar Sup. Derecho',
  18: 'Tercer Molar Sup. Derecho',
  21: 'Incisivo Central Sup. Izquierdo',
  22: 'Incisivo Lateral Sup. Izquierdo',
  23: 'Canino Sup. Izquierdo',
  24: 'Primer Premolar Sup. Izquierdo',
  25: 'Segundo Premolar Sup. Izquierdo',
  26: 'Primer Molar Sup. Izquierdo',
  27: 'Segundo Molar Sup. Izquierdo',
  28: 'Tercer Molar Sup. Izquierdo',
  31: 'Incisivo Central Inf. Izquierdo',
  32: 'Incisivo Lateral Inf. Izquierdo',
  33: 'Canino Inf. Izquierdo',
  34: 'Primer Premolar Inf. Izquierdo',
  35: 'Segundo Premolar Inf. Izquierdo',
  36: 'Primer Molar Inf. Izquierdo',
  37: 'Segundo Molar Inf. Izquierdo',
  38: 'Tercer Molar Inf. Izquierdo',
  41: 'Incisivo Central Inf. Derecho',
  42: 'Incisivo Lateral Inf. Derecho',
  43: 'Canino Inf. Derecho',
  44: 'Primer Premolar Inf. Derecho',
  45: 'Segundo Premolar Inf. Derecho',
  46: 'Primer Molar Inf. Derecho',
  47: 'Segundo Molar Inf. Derecho',
  48: 'Tercer Molar Inf. Derecho',
};

export const Tooth: React.FC<ToothProps> = ({ 
  number, 
  conditions, 
  onPress, 
  size = 'medium' 
}) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const status = getToothStatus(conditions);
  const toothName = TOOTH_NAMES[number] || `Diente ${number}`;
  const backgroundColor = CONDITION_COLORS[status] || '#ffffff';

  const sizeStyles = {
    small: { width: 20, height: 30 },
    medium: { width: 30, height: 40 },
    large: { width: 40, height: 50 },
  };

  const handlePress = () => {
    onPress(number);
  };

  const handleLongPress = () => {
    setTooltipVisible(true);
  };

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity 
        onPress={handlePress}
        onLongPress={handleLongPress}
        onPressOut={() => setTooltipVisible(false)}
        delayLongPress={500}
        activeOpacity={0.7}
        style={[
          styles.container, 
          { backgroundColor },
          sizeStyles[size],
        ]}
      >
        <View style={styles.toothNumberContainer}>
          <Text style={styles.toothNumber}>{number}</Text>
        </View>
        
        {conditions.length > 1 && (
          <View style={styles.multipleConditionsIndicator}>
            <MaterialIcons name="warning" size={12} color="#000" />
          </View>
        )}
      </TouchableOpacity>

      {tooltipVisible && (
        <View style={[
          styles.tooltip,
          size === 'small' && { minWidth: 120 },
          size === 'large' && { minWidth: 180 },
        ]}>
          <Text style={styles.tooltipTitle}>{toothName}</Text>
          <Text style={styles.tooltipSubtitle}>{statusLabel(status)}</Text>
          
          {conditions.map((cond, idx) => (
            <View key={idx} style={styles.conditionRow}>
              <View style={[
                styles.conditionBullet, 
                { backgroundColor: CONDITION_COLORS[cond.condition] }
              ]} />
              <Text style={styles.tooltipText}>
                {conditionLabel(cond.condition)} - {formatDate(cond.treatment_date)}
              </Text>
            </View>
          ))}
          
          {conditions.length === 0 && (
            <Text style={styles.tooltipText}>Sano - Sin tratamientos registrados</Text>
          )}
        </View>
      )}
    </View>
  );
};

// Funciones auxiliares
function getToothStatus(conditions: ToothCondition[]): string {
  if (conditions.length === 0) return 'healthy';
  if (conditions.some(c => c.condition === 'extraction')) return 'missing';
  if (conditions.some(c => c.condition === 'caries')) return 'caries';
  if (conditions.some(c => c.condition === 'root_canal')) return 'root_canal';
  return conditions[0].condition;
}

function conditionLabel(condition: string): string {
  const labels: Record<string, string> = {
    'caries': 'Caries',
    'restoration': 'Restauración',
    'extraction': 'Extraído',
    'root_canal': 'Endodoncia',
    'crown': 'Corona',
    'healthy': 'Sano',
    'impacted': 'Impactado',
    'missing': 'Faltante',
  };
  return labels[condition] || condition;
}

function statusLabel(status: string): string {
  return status === 'healthy' ? 'Estado: Sano' : `Estado: ${conditionLabel(status)}`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-ES');
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    margin: 3,
  },
  container: {
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#999',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  toothNumberContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 10,
    paddingHorizontal: 4,
  },
  toothNumber: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  multipleConditionsIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tooltip: {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: [{ translateX: -90 }],
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    minWidth: 150,
    zIndex: 100,
    marginBottom: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tooltipTitle: {
    fontWeight: 'bold',
    marginBottom: 2,
    fontSize: 12,
  },
  tooltipSubtitle: {
    fontSize: 10,
    marginBottom: 6,
    color: '#555',
  },
  tooltipText: {
    fontSize: 10,
    marginLeft: 4,
  },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  conditionBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});