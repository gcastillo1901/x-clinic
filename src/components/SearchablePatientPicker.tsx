// src/components/SearchablePatientPicker.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  Modal 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface Patient {
  id: string;
  full_name: string;
}

interface SearchablePatientPickerProps {
  patients: Patient[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

const SearchablePatientPicker: React.FC<SearchablePatientPickerProps> = ({
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
            if (!selectedPatient || text !== selectedPatient.full_name) {
              setShowDropdown(true);
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
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setShowDropdown(!showDropdown)}
        >
          <MaterialIcons 
            name={showDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
            size={24} 
            color="#64748b" 
          />
        </TouchableOpacity>
      </View>

      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDropdown(false)}
        >
          <View style={styles.dropdown}>
            {filteredPatients.length > 0 ? (
              <FlatList
                data={filteredPatients}
                renderItem={renderPatientItem}
                keyExtractor={(item) => item.id}
                style={styles.patientList}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
              />
            ) : (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>
                  No se encontraron pacientes
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
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
    marginRight: 8,
  },
  dropdownButton: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdown: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    maxHeight: 300,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  patientList: {
    maxHeight: 250,
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
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
});

export default SearchablePatientPicker;