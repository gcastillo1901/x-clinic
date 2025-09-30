// src/components/MultipleToothPicker.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface MultipleToothPickerProps {
  selectedTeeth: number[];
  onSelectionChange: (teeth: number[]) => void;
}

const MultipleToothPicker: React.FC<MultipleToothPickerProps> = ({
  selectedTeeth,
  onSelectionChange,
}) => {
  const [showModal, setShowModal] = useState(false);

  const toothNumbers = [
    // Cuadrante 1 (Superior derecho): 11-18
    ...Array.from({ length: 8 }, (_, i) => 11 + i),
    // Cuadrante 2 (Superior izquierdo): 21-28
    ...Array.from({ length: 8 }, (_, i) => 21 + i),
    // Cuadrante 3 (Inferior izquierdo): 31-38
    ...Array.from({ length: 8 }, (_, i) => 31 + i),
    // Cuadrante 4 (Inferior derecho): 41-48
    ...Array.from({ length: 8 }, (_, i) => 41 + i)
  ];

  const toggleTooth = (toothNumber: number) => {
    const newSelection = selectedTeeth.includes(toothNumber)
      ? selectedTeeth.filter(t => t !== toothNumber)
      : [...selectedTeeth, toothNumber].sort((a, b) => a - b);
    
    onSelectionChange(newSelection);
  };

  const getDisplayText = () => {
    if (selectedTeeth.length === 0) return 'Seleccionar dientes...';
    if (selectedTeeth.length === 1) return `Diente ${selectedTeeth[0]}`;
    return `${selectedTeeth.length} dientes seleccionados`;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.selectorText}>{getDisplayText()}</Text>
        <MaterialIcons name="keyboard-arrow-down" size={24} color="#64748b" />
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Dientes</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <MaterialIcons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.teethGrid}>
              <View style={styles.quadrantContainer}>
                <Text style={styles.quadrantTitle}>Superior Derecho (11-18)</Text>
                <View style={styles.teethRow}>
                  {Array.from({ length: 8 }, (_, i) => 11 + i).map(tooth => (
                    <TouchableOpacity
                      key={tooth}
                      style={[
                        styles.toothButton,
                        selectedTeeth.includes(tooth) && styles.selectedTooth
                      ]}
                      onPress={() => toggleTooth(tooth)}
                    >
                      <Text style={[
                        styles.toothText,
                        selectedTeeth.includes(tooth) && styles.selectedToothText
                      ]}>
                        {tooth}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.quadrantContainer}>
                <Text style={styles.quadrantTitle}>Superior Izquierdo (21-28)</Text>
                <View style={styles.teethRow}>
                  {Array.from({ length: 8 }, (_, i) => 21 + i).map(tooth => (
                    <TouchableOpacity
                      key={tooth}
                      style={[
                        styles.toothButton,
                        selectedTeeth.includes(tooth) && styles.selectedTooth
                      ]}
                      onPress={() => toggleTooth(tooth)}
                    >
                      <Text style={[
                        styles.toothText,
                        selectedTeeth.includes(tooth) && styles.selectedToothText
                      ]}>
                        {tooth}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.quadrantContainer}>
                <Text style={styles.quadrantTitle}>Inferior Izquierdo (31-38)</Text>
                <View style={styles.teethRow}>
                  {Array.from({ length: 8 }, (_, i) => 31 + i).map(tooth => (
                    <TouchableOpacity
                      key={tooth}
                      style={[
                        styles.toothButton,
                        selectedTeeth.includes(tooth) && styles.selectedTooth
                      ]}
                      onPress={() => toggleTooth(tooth)}
                    >
                      <Text style={[
                        styles.toothText,
                        selectedTeeth.includes(tooth) && styles.selectedToothText
                      ]}>
                        {tooth}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.quadrantContainer}>
                <Text style={styles.quadrantTitle}>Inferior Derecho (41-48)</Text>
                <View style={styles.teethRow}>
                  {Array.from({ length: 8 }, (_, i) => 41 + i).map(tooth => (
                    <TouchableOpacity
                      key={tooth}
                      style={[
                        styles.toothButton,
                        selectedTeeth.includes(tooth) && styles.selectedTooth
                      ]}
                      onPress={() => toggleTooth(tooth)}
                    >
                      <Text style={[
                        styles.toothText,
                        selectedTeeth.includes(tooth) && styles.selectedToothText
                      ]}>
                        {tooth}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.doneButtonText}>Listo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: 'white',
    paddingHorizontal: 15,
    height: 50,
  },
  selectorText: {
    fontSize: 16,
    color: '#1e293b',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  teethGrid: {
    maxHeight: 400,
  },
  quadrantContainer: {
    marginBottom: 20,
  },
  quadrantTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 10,
  },
  teethRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  toothButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedTooth: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  toothText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  selectedToothText: {
    color: 'white',
  },
  doneButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  doneButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MultipleToothPicker;