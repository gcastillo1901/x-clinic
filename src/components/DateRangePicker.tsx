// src/components/DateRangePicker.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface DateRangePickerProps {
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  onChange: (range: { startDate: Date; endDate: Date }) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ dateRange, onChange }) => {
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [activePicker, setActivePicker] = useState<'start' | 'end'>('start');

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      if (activePicker === 'start') {
        onChange({ ...dateRange, startDate: selectedDate });
      } else {
        onChange({ ...dateRange, endDate: selectedDate });
      }
    }
    setShowStartPicker(false);
    setShowEndPicker(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.dateButton}
        onPress={() => {
          setActivePicker('start');
          setShowStartPicker(true);
        }}
      >
        <Text style={styles.dateText}>{formatDate(dateRange.startDate)}</Text>
        <MaterialIcons name="event" size={20} color="#3b82f6" />
      </TouchableOpacity>

      <Text style={styles.separator}>a</Text>

      <TouchableOpacity 
        style={styles.dateButton}
        onPress={() => {
          setActivePicker('end');
          setShowEndPicker(true);
        }}
      >
        <Text style={styles.dateText}>{formatDate(dateRange.endDate)}</Text>
        <MaterialIcons name="event" size={20} color="#3b82f6" />
      </TouchableOpacity>

      {(showStartPicker || showEndPicker) && (
        <DateTimePicker
          value={activePicker === 'start' ? dateRange.startDate : dateRange.endDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: 'white',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 10,
  },
  dateText: {
    marginRight: 10,
    color: '#1e293b',
  },
  separator: {
    marginHorizontal: 10,
    color: '#64748b',
  },
});

export default DateRangePicker;