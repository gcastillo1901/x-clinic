// src/components/SimplePatientPicker.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface Patient {
  id: string;
  full_name: string;
}

interface SimplePatientPickerProps {
  patients: Patient[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

const SimplePatientPicker: React.FC<SimplePatientPickerProps> = ({
  patients,
  selectedValue,
  onValueChange,
  placeholder = "Buscar paciente..."
}) => {
  const [searchText, setSearchText] = useState('');
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  useEffect(() => {
    if (selectedValue) {
      const patient = patients.find(p => p.id === selectedValue);
      setSelectedPatient(patient || null);
      setSearchText(patient?.full_name || '');
    }
  }, [selectedValue, patients]);

  useEffect(() => {
    if (searchText.length > 0) {
      const filtered = patients.filter(patient =>
        patient.full_name.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients(patients);
    }
  }, [searchText, patients]);

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setSearchText(patient.full_name);
    onValueChange(patient.id);
    setShowDropdown(false);
  };

  const handleClearSelection = () => {
    setSelectedPatient(null);
    setSearchText('');
    onValueChange('');
    setShowDropdown(false);
  };

  const renderPatientItem = ({ item }: { item: Patient }) => (
    <TouchableOpacity
      style={styles.patientItem}
      onPress={() => handleSelectPatient(item)}
    >
      <Text style={styles.patientName}>{item.full_name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={searchText}
          onChangeText={(text) => {
            setSearchText(text);
            setShowDropdown(text.length > 0);
            // Limpiar selección si el texto no coincide exactamente
            if (selectedPatient && text !== selectedPatient.full_name) {
              setSelectedPatient(null);
              onValueChange('');
            }
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
        />
        {selectedPatient && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearSelection}
          >
            <MaterialIcons name="clear" size={20} color="#64748b" />
          </TouchableOpacity>
        )}
      </View>

      {showDropdown && filteredPatients.length > 0 && (
        <View style={styles.dropdown}>
          <FlatList
            data={filteredPatients.slice(0, 5)}
            renderItem={renderPatientItem}
            keyExtractor={(item) => item.id}
            style={styles.patientList}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: 'white',
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#1e293b',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  clearButton: {
    padding: 4,
  },
  dropdown: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1001,
  },
  patientList: {
    maxHeight: 180,
  },
  patientItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  patientName: {
    fontSize: 16,
    color: '#1e293b',
  },
});

export default SimplePatientPicker;